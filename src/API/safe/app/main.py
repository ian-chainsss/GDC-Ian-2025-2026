# -------- IMPORTS --------
#api imports
from app.config import description, settings
from fastapi import FastAPI, Depends, Request, HTTPException, Response
from datetime import datetime, timedelta

#database & ORM imports
from app.database import get_db
from app.database import AsyncSessionLocal
import app.models as models
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.exc import IntegrityError

#pydantic imports
from pydantic import BaseModel, EmailStr

#logging & authentication imports
from app.functions import create_password_hash, verify_password, check_user_requirements, create_jwt_token, verify_jwt_token
from typing import Optional
import logging

#proxy middleware import
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

# -------- SETUP & CONFIGURATION --------

#app setup
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

#logging setup
app.add_middleware(
    ProxyHeadersMiddleware,
    trusted_hosts="*"
)

#database connection test on startup
@app.on_event("startup")
async def on_startup():
    logger = logging.getLogger("uvicorn.error")

    #If session factory not configured, log and skip test
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
    return {"message": "Hello, welcome to the Safe API! GDC research project by Ian-Chains Baute.", "client_host": request.client.host}

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
    users = result.scalars().all() #scalars() haalt alle kolommen op, all() zet om in lijst
    return users

@app.get("/users/{user_id}")
async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve a user by their ID from the database."""

    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalars().first() #scalars() haalt alle kolommen op, first() haalt de eerste rij op
    return user

@app.post("/users", status_code=201)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user in the database with hashed password."""

    #basic password & input validation
    await check_user_requirements(user)

    # check for existing username or email
    result = await db.execute(select(models.User).where((models.User.username == user.username) | (models.User.email == user.email)))
    existing = result.scalars().first()
    if existing:
        if existing.username == user.username:
            raise HTTPException(status_code=409, detail="Username already exists")
        if existing.email == user.email:
            raise HTTPException(status_code=409, detail="Email already exists")

    #password hashing
    password_hash = await create_password_hash(user.password)

    #create user in database
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

    #return new user data
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

    #verify password using helper
    verified = await verify_password(user.password_hash, credentials.password)

    #generate JWT token using helper
    token, exp = await create_jwt_token(user.id, user.username, user.role)
    
    #create secure cookie with token
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

    #return token and expiration time
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
    return {"message": "Logged out successfully"}