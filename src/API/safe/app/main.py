# -------- IMPORTS --------
# api imports
from app.config import description, settings
from fastapi import FastAPI, Depends, Request, HTTPException, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta

# database & ORM imports
from app.database import get_db
from app.database import AsyncSessionLocal
import app.models as models
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, text
from sqlalchemy.exc import IntegrityError

# pydantic imports
from pydantic import BaseModel, EmailStr

# logging & authentication imports
from app.functions import create_password_hash, verify_password, check_user_requirements, create_jwt_token, verify_jwt_token, has_level_access_by_jwt, has_level_access_by_db
from typing import Optional
import logging

# proxy middleware import
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

# -------- SETUP & CONFIGURATION --------

# app setup
app = FastAPI(
    title="Safe API - GDC Ian",
    description=description,
    summary="A safe API for GDC research project by Ian-Chains Baute.",
    version="0.2.1",
    contact={
        "name": "Ian-Chains Baute",
        "email": "school@ian-chains.it",
        "url": "https://ian-chains.it",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# logging setup
app.add_middleware(
    ProxyHeadersMiddleware,
    trusted_hosts="*"
)

origins = [
    "https://safe-app.ian-chains.be",
]

#CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# database connection test on startup
@app.on_event("startup")
async def on_startup():
    logger = logging.getLogger("uvicorn.error")

    # If session factory not configured, log and skip test
    if AsyncSessionLocal is None:
        logger.error("AsyncSessionLocal not configured; skipping DB connection test.")
        return

    try:
        async with AsyncSessionLocal() as session:
            await session.execute(select(1)) #simple test query
        logger.info("Database connection test succeeded.")
    except Exception as e:
        logger.exception("Database connection test failed: %s", e)

# -------- ROOT & TESTING ENDPOINTS --------

@app.get("/")
async def read_root(request: Request):
    """Root endpoint returning a welcome message and client IP address."""
    return {"detail": "Hello, welcome to the Safe API! GDC research project by Ian-Chains Baute.", "type": "safe", "client_host": request.client.host}

# -------- USER ENDPOINTS --------

class UserCreate(BaseModel):
    """Model for creating a new user."""
    username: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    """Model for updating an existing user. Only provided fields will be changed."""
    id: int
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    
@app.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    """Retrieve all users and their information from the database."""
    
    result = await db.execute(select(models.User))
    users = result.scalars().all() # scalars() haalt alle kolommen op, all() zet om in lijst
    return users

@app.get("/users/{user_id}")
async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve a user by their ID from the database."""
    
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalars().first()  # scalars() haalt alle kolommen op, first() haalt de eerste rij op

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@app.post("/users", status_code=201)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user in the database with hashed password."""

    # basic password & input validation
    await check_user_requirements(user)

    # check for existing username or email
    result = await db.execute(select(models.User).where((models.User.username == user.username) | (models.User.email == user.email)))
    existing = result.scalars().first()
    if existing:
        if existing.username == user.username:
            raise HTTPException(status_code=409, detail="Username already exists")
        if existing.email == user.email:
            raise HTTPException(status_code=409, detail="Email already exists")

    # password hashing
    password_hash = await create_password_hash(user.password)

    # create user in database
    new_user = models.User(username=user.username, email=user.email, password_hash=password_hash)
    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Username or email already exists")
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Could not create user")

    # return new user data
    return {"id": new_user.id, "username": new_user.username, "email": new_user.email, "created_at": new_user.created_at}

@app.put("/users", status_code=200)
async def update_user(user: UserUpdate, request: Request, db: AsyncSession = Depends(get_db)):
    """Update an existing user's data. User must be authenticated and match the JWT subject."""

    # verify token and ensure user is same as token subject
    payload = await verify_jwt_token(request)
    sub = payload.get("sub")
    try:
        auth_user_id = int(sub)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    if auth_user_id != user.id:
        raise HTTPException(status_code=403, detail="Cannot modify another user's data")

    # Validate provided fields (only validate fields that are provided)
    if user.password is not None and len(user.password) < 8:
            raise HTTPException(status_code=422, detail="Password must be at least 8 characters long")
    if user.username is not None and len(user.username) < 3:
            raise HTTPException(status_code=422, detail="Username must be at least 3 characters long")

    # Check for username/email conflicts with other users
    conflict_filters = []
    if user.username:
        conflict_filters.append(models.User.username == user.username)
    if user.email:
        conflict_filters.append(models.User.email == user.email)
    if conflict_filters:
        result = await db.execute(select(models.User).where(or_(*conflict_filters)).where(models.User.id != user.id))
        existing = result.scalars().first()
        if existing:
            if user.username and existing.username == user.username:
                raise HTTPException(status_code=409, detail="Username already exists")
            if user.email and existing.email == user.email:
                raise HTTPException(status_code=409, detail="Email already exists")

    # Fetch the user to update
    result = await db.execute(select(models.User).where(models.User.id == user.id))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Apply updates
    if user.username:
        db_user.username = user.username
    if user.email:
        db_user.email = user.email
    if user.password:
        password_hash = await create_password_hash(user.password)
        db_user.password_hash = password_hash

    try:
        await db.commit()
        await db.refresh(db_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Username or email already exists")
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Could not update user")

    return {"id": db_user.id, "username": db_user.username, "email": db_user.email}

# -------- AUTHENTICATION ENDPOINTS --------

class LoginRequest(BaseModel):
    """Model for login request."""
    username_or_email: str
    password: str

@app.post("/login")
async def login(credentials: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT token."""

    # find user by username or email
    result = await db.execute(select(models.User).where((models.User.username == credentials.username_or_email) | (models.User.email == credentials.username_or_email)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # verify password using helper
    verified = await verify_password(user.password_hash, credentials.password)

    # generate JWT token using helper
    token, exp = await create_jwt_token(user.id, user.username, user.role)
    
    # create secure cookie with token
    try:
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=settings.JWT_EXP_MINUTES * 60
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to set authentication cookie")

    # return token and expiration time
    return {"id": user.id, "username": user.username, "email": user.email}

@app.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user by clearing the authentication cookie."""
    jwt = request.cookies.get("access_token")
    if not jwt:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        response.delete_cookie(key="access_token")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to clear authentication cookie")
    return {"detail": "Logged out successfully"}

# -------- MESSAGE ENDPOINTS --------

class PostCreate(BaseModel):
    """Model for creating a new post."""
    title: str
    content: str
    content_mime: Optional[str] = 'text/html'

@app.post("/posts", status_code=201)
async def create_post(post: PostCreate, request: Request, db: AsyncSession = Depends(get_db)):
    """Create a new post. Requires valid JWT and at least level 9 access."""

    # Verify JWT from cookie
    payload = await verify_jwt_token(request)

    # Ensure user has required access level
    await has_level_access_by_jwt(payload, 9)

    # extract user id from token
    sub = payload.get("sub")
    try:
        author_id = int(sub)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    # create post
    new_post = models.Post(author_id=author_id, title=post.title, content=post.content, content_mime=post.content_mime)
    db.add(new_post)
    try:
        await db.commit()
        await db.refresh(new_post)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Could not create post")
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Could not create post")

    return {"id": new_post.id, "author_id": new_post.author_id, "title": new_post.title, "created_at": new_post.created_at}

@app.get("/posts/id/{post_id}")
async def get_post_by_id(post_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve a post by its ID from the database."""

    result = await db.execute(select(models.Post).where(models.Post.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.get("/posts")
async def get_latest_posts(db: AsyncSession = Depends(get_db)):
    """Return the latest 5 posts without content. Each item contains post id, title and author username."""

    # join posts with users to get author username and avoid lazy loads
    result = await db.execute(
        select(models.Post, models.User.username)
        .join(models.User, models.Post.author_id == models.User.id)
        .order_by(models.Post.created_at.desc())
        .limit(5)
    )

    # format results to include post id, title, content, author username and created_at
    rows = result.all()
    # If no posts are found, return a 404 to signal empty result set
    if not rows:
        raise HTTPException(status_code=404, detail="No posts found")
    posts = []
    for post, username in rows:
        posts.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "content_mime": post.content_mime,
            "author_id": post.author_id,
            "author": username,
            "created_at": post.created_at,
        })

    return posts


@app.get("/posts/search")
async def search_posts(q: str, db: AsyncSession = Depends(get_db)):
    """Search posts by title. Returns list of posts with id, title, author and created_at.

    - `q`: zoekterm(en), spaties splitsen in woorden
    """

    # validate query parameter
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Missing or empty 'q' parameter")

    # split query into terms, remove extra spaces
    terms = [t.strip() for t in q.split() if t.strip()]
    if not terms:
        raise HTTPException(status_code=400, detail="Invalid 'q' parameter")

    # build OR filters for each term against the title (case-insensitive, partial match)
    filters = [models.Post.title.ilike(f"%{term}%") for term in terms]

    # join posts with users to get author username and avoid lazy loads, apply filters and order by newest first
    stmt = (
        select(models.Post, models.User.username)
        .join(models.User, models.Post.author_id == models.User.id)
        .where(or_(*filters))
        .order_by(models.Post.created_at.desc())
    )

    result = await db.execute(stmt)
    rows = result.all()
    if not rows:
        return JSONResponse(status_code=404, content={"detail": "No posts found", "query": q})

    # format results to include post id, title, author username and created_at, but exclude content for performance
    posts = []
    for post, username in rows:
        posts.append({
            "id": post.id,
            "title": post.title,
            "author": username,
            "created_at": post.created_at,
        })

    return {"query": q, "results": posts}

# -------- ADMIN ENDPOINTS --------

@app.post("/reset", status_code=200)
async def reset_database(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """Reset all application data in the database while keeping tables/schema."""

    # Verify JWT and access level
    payload = await verify_jwt_token(request)
    await has_level_access_by_db(payload, 1)

    # Perform truncate of known tables while keeping schema and resetting identities
    try:
        await db.execute(text(
            "TRUNCATE TABLE content.comments, content.posts, access.refresh_tokens, access.password_resets, access.users RESTART IDENTITY CASCADE"
        ))
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Could not reset database")

    # Remove authentication cookie
    try:
        response.delete_cookie(key="access_token")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to clear authentication cookie")

    # Return HTML that reloads the page on the client
    return response