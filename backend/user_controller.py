from fastapi import APIRouter
from models import Account, User, UserIn
from dependencies import user_service as service, account_service

router = APIRouter(prefix="/api/users", tags=["Users"])

# wiring moved to dependencies.py so every controller shares the same objects



@router.get("/{user_id}", response_model=User)
def get_user(user_id: int):
    return service.get_user(user_id)

@router.post("", response_model=User)
def create_user(data: UserIn):
    return service.create_user(data)


@router.put("/{user_id}", response_model=User)
def update_user(user_id: int, data: UserIn):
    return service.update_user(user_id, data)



@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int):
    service.delete_user(user_id)
    return None  # FastAPI will return a 204 No Content response


@router.get("", response_model=list[User])
def list_users():
    return service.list_users()


# TODO: GET /api/users/{user_id}/accounts -> list[Account]
#       one-liner calling account_service.list_accounts_for_user
