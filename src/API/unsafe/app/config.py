from pydantic_settings import BaseSettings
from sqlalchemy.orm import declarative_base
from os import getenv

class Settings(BaseSettings):
    DB_HOST: str = getenv("DB_HOST", "localhost")
    DB_PORT: int = int(getenv("DB_PORT", 5432))
    DB_USER: str = getenv("DB_USER", "user")
    DB_PASS: str = getenv("DB_PASS", "password")
    DB_NAME: str = getenv("DB_NAME", "database")
    DB_POOL_SIZE: int = int(getenv("DB_POOL_SIZE", 10))
    DB_MAX_OVERFLOW: int = int(getenv("DB_MAX_OVERFLOW", 20))
    DB_URL: str = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    DB_ECHO_QUERIES: bool = getenv("DB_ECHO_QUERIES", "true").lower() in ("true", "1", "yes")
    
    # JWT settings
    JWT_SECRET: str = getenv("JWT_SECRET", "9055379cfcec6207cb7b9a5cc064c9ae418a43f97f5f92f33bd8efb2c911c2d2")
    JWT_ALGORITHM: str = getenv("JWT_ALGORITHM", "HS256")
    JWT_EXP_MINUTES: int = int(getenv("JWT_EXP_MINUTES", 15))

    #Argon2 Hashing settings
    HASH_TIME_COST: int = int(getenv("HASH_TIME_COST", 5))
    HASH_MEMORY_COST: int = int(getenv("HASH_MEMORY_COST", 128*1024))  # in KB
    HASH_PARALLELISM: int = int(getenv("HASH_PARALLELISM", 4))
    HASH_SALT_LENGTH: int = int(getenv("HASH_SALT_LENGTH", 16))
    HASH_HASH_LENGTH: int = int(getenv("HASH_HASH_LENGTH", 32))

    # Cookie settings
    COOKIE_DOMAIN: str = getenv("COOKIE_DOMAIN", "ian-chains.be")
    
settings = Settings()
# gebruik settings.DB_HOST etc.

description = """
This is the **Unsafe API** for the GDC research project by Ian-Chains Baute.

This system is based on FastAPI and SQLAlchemy. It has features like posting blogposts, commenting, user authentication, and more.  
This version of the GDC API is unsafe, to show and **demonstrate security vulnerabilities** for educational purposes. 
Please be cautious when using this API in a production environment.  
"""

#Base class voor models
Base = declarative_base()