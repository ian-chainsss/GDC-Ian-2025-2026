# authentication imports
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, Argon2Error
import jwt

# algemene imports
from fastapi import Request, HTTPException
from datetime import datetime, timedelta

# config imports
from app.config import settings
from sqlalchemy import select
from app.models import User
from app.database import AsyncSessionLocal

async def create_password_hash(password: str) -> str:
    """Create a hashed password using Argon2id. Expects a plain password string. Returns the hashed password string."""
    
    ph = PasswordHasher(
        time_cost=settings.HASH_TIME_COST,
        memory_cost=settings.HASH_MEMORY_COST,
        parallelism=settings.HASH_PARALLELISM,
        salt_len=settings.HASH_SALT_LENGTH,
        hash_len=settings.HASH_HASH_LENGTH,
    )
    try:
        return ph.hash(password)
    except Argon2Error as e:
        raise HTTPException(status_code=500, detail="Password hashing failed")

async def verify_password(stored_hash: str, password: str) -> bool:
    """Verify a plain password against a stored Argon2 hash. Expects stored_hash and password. Returns boolean."""

    ph = PasswordHasher()
    try:
        ph.verify(stored_hash, password)
        return True
    except VerifyMismatchError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Argon2Error as e:
        raise HTTPException(status_code=500, detail="Password verification failed")
    
async def check_user_requirements(user) -> None:
    """Check basic requirements for user creation. Raises HTTPException if any requirement is not met."""

    if not user.password or len(user.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters long")
    if not user.username or len(user.username) < 3:
        raise HTTPException(status_code=422, detail="Username must be at least 3 characters long")
    if not user.email:
        raise HTTPException(status_code=422, detail="Email must be provided")
    
async def create_jwt_token(user_id: int, username: str, role: int):
    """Create a JWT token and return (token, expiration_datetime). Expects user_id, username, role."""

    now = datetime.utcnow()
    exp = now + timedelta(minutes=settings.JWT_EXP_MINUTES)
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }

    try:
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Token generation failed")

    return token, exp

async def verify_jwt_token(request: Request):
    """Verify a JWT token from the request. Returns the decoded payload dict if valid, otherwise raises HTTPException."""
    
    token = request.cookies.get(settings.COOKIE_KEY)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token missing")

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Token verification failed") from e

async def has_level_access_by_jwt(payload: dict, level: int) -> bool:
    """Check whether the given JWT payload grants user access."""

    if not isinstance(payload, dict) or level is None:
        raise HTTPException(status_code=400, detail="Invalid payload or access level")
    role = payload.get("role")
    if role is None:
        raise HTTPException(status_code=400, detail="Invalid payload or access level")

    try:
        role_int = int(role)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid payload or access level")
    
    if not role_int <= level:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

async def has_level_access_by_db(payload: dict, level: int) -> bool:
    """Check whether the user identified in `payload` has access by querying the DB."""

    # Validate payload and extract user ID
    if not isinstance(payload, dict) or level is None:
        raise HTTPException(status_code=400, detail="Invalid payload or access level")
    sub = payload.get("sub")
    if sub is None:
        raise HTTPException(status_code=400, detail="Invalid payload or access level")
    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid payload or access level")

    # Query the database for the user's data and check if user exists
    query = select(User).where(User.id == user_id)
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(query)
            user = result.scalars().first()
    except Exception:
        raise HTTPException(status_code=500, detail="Database query failed")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        role_int = int(user.role)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid payload or access level")

    if not role_int <= level:
        raise HTTPException(status_code=403, detail="Insufficient permissions")