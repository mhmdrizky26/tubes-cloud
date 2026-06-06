"""Shared dependencies: ambil user dari Bearer token."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from .database import get_db
from .models import Material, User
from .security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    cred_err = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise cred_err
    except JWTError:
        raise cred_err

    user = db.get(User, int(user_id))
    if user is None:
        raise cred_err
    return user


def owned_material(db: Session, material_id: int, user: User) -> Material:
    """Ambil materi milik user atau 404. Dipakai bersama oleh materials & quiz."""
    material = db.get(Material, material_id)
    if not material or material.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Materi tidak ditemukan")
    return material
