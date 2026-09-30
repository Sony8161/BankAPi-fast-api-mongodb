from fastapi import APIRouter
from models import Account, AccountIn, AccountUpdate, AmountIn
from dependencies import account_service as service

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.post("", response_model=Account, status_code=201)   # 201 = Created
def create_account(data: AccountIn):
    return service.create_account(data)   # example, done for you




@router.get("", response_model=list[Account])
def list_accounts():
    return service.list_accounts()

@router.get("/{account_id}", response_model=Account)
def get_account(account_id: int):
    return service.get_account(account_id)
@router.put("/{account_id}", response_model=Account)
def update_account(account_id: int, data: AccountUpdate):
    return service.update_account(account_id, data)

@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int):
    return service.delete_account(account_id)


@router.post("/{account_id}/deposit", response_model=Account)
def deposit(account_id: int, data: AmountIn):
    return service.deposit(account_id, data.amount)

@router.post("/{account_id}/withdraw", response_model=Account)
def withdraw(account_id: int, data: AmountIn):
    return service.withdraw(account_id, data.amount)
