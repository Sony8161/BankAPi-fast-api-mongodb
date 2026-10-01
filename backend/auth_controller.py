from fastapi import APIRouter, Depends

from auth_guard import get_current_user, require_admin
from dependencies import auth_service as service
from models import CreateLoginIn, LoginIn, RegisterIn, TokenOut, User

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn):
    return service.login(data)


@router.post("/register", response_model=TokenOut, status_code=201)
def register(data: RegisterIn):
    return service.register(data)


@router.get("/me", response_model=User)
def me(user: User = Depends(get_current_user)):
    return user   # get_current_user already did the work


@router.get("/users", response_model=list[User], dependencies=[Depends(require_admin)])
def list_users():
    return service.list_users()


@router.post("/users", response_model=User, status_code=201, dependencies=[Depends(require_admin)])
def create_login(data: CreateLoginIn):
    return service.create_login(data)
