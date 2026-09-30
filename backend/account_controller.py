from fastapi import APIRouter
from models import Account, AccountIn, AccountUpdate
from dependencies import account_service as service

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.post("", response_model=Account, status_code=201)   # 201 = Created
def create_account(data: AccountIn):
    return service.create_account(data)   # example, done for you


# TODO: GET    ""               -> list[Account]    (list_accounts)
# TODO: GET    "/{account_id}"  -> Account          (get_account)
# TODO: PUT    "/{account_id}"  -> Account          body: AccountUpdate
# TODO: DELETE "/{account_id}"  -> 204
