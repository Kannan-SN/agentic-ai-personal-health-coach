import logging
from jose import jwt, JWTError
from typing import Annotated
from cryptography.hazmat.primitives import serialization
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from pydantic import BaseModel
from cryptography.hazmat.backends import default_backend

from backend.config import main

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class TokenData(BaseModel):
    sessionId: str
    userId: str
    mode: str = ""

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

async def verify_access_token(token: str) -> dict:
    """
    Verify JWT access token for user authentication
    Enhanced security for health data protection
    """
    try:
        public_key = serialization.load_pem_public_key(
            main.JWT_ACCESS_KEY_PUBLIC, backend=default_backend()
        )

        public_key_pem_decrypted = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )

        payload = jwt.decode(
            token, public_key_pem_decrypted.decode("utf-8"), algorithms=["RS256"]
        )

        if payload.get("mode") != "active":
            logging.error("Unauthorized 401, Invalid mode")
            raise credentials_exception

        
        user_id = payload.get("userId")
        if not user_id:
            logging.error("Unauthorized 401, Missing user ID")
            raise credentials_exception

        
        logging.info(f"Health data access authenticated for user: {user_id}")

        return payload
    except JWTError as e:
        logging.error(f"JWT verification failed: {e}")
        raise credentials_exception

async def get_current_user_access(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> TokenData:
    """
    Get current authenticated user with enhanced health data protection
    """
    payload = await verify_access_token(token)
    
   
    token_data = TokenData(
        sessionId=payload.get("sessionId"),
        userId=payload.get("userId"),
        mode=payload.get("mode")
    )
    
    
    if not token_data.userId or not token_data.sessionId:
        logging.error("Incomplete token data for health access")
        raise credentials_exception
    
    return token_data

async def get_current_user_health_access(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> TokenData:
    """
    Special authentication for health-sensitive operations
    Includes additional logging and validation for audit compliance
    """
    token_data = await get_current_user_access(token)
    
   
    logging.info(f"Health-sensitive operation accessed by user: {token_data.userId}")
    
    
    if token_data.mode != "active":
        logging.error(f"Inactive user attempted health data access: {token_data.userId}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active account required for health data access"
        )
    
    return token_data