from fastapi import APIRouter
from models import Account, AccountIn, AccountUpdate, AmountIn, Transaction, TransferIn
from dependencies import account_service as service

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])
transfer_router = APIRouter(prefix="/api/transfers", tags=["Transfers"])   # second router, same file


@router.post("", response_model=Account, status_code=201)   # 201 = Created
def create_account(data: AccountIn):
    return service.create_account(data)   # example, done for you




@router.get("", response_model=list[Account])
def list_accounts():
    return service.list_accounts()

@router.get("/premium", response_model=list[Account])
def get_premium_accounts(threshold: float):
    return service.get_premium_accounts(threshold)  


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

@router.get("/{account_id}/transactions", response_model=list[Transaction])
def get_transactions(account_id: int):
    return service.get_transactions(account_id)
    # end of account routes
    
@transfer_router.post("", response_model=Transaction, status_code=201)
def transfer(data: TransferIn):
    return service.transfer(data)       

