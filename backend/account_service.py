from decimal import Decimal
from fastapi import HTTPException
from models import Account, AccountIn, AccountUpdate
from account_repository import AccountRepository
from user_service import UserService


class AccountService:
    """Business rules for accounts. Reuses UserService for the "user exists" check."""

    def __init__(self, repo: AccountRepository, user_service: UserService):
        self._repo = repo
        self._user_service = user_service

    def get_account(self, account_id: int) -> Account:
        # TODO: the single 404 check ("Account not found"), same pattern as get_user
        account = self._repo.find_by_id(account_id)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        return account

    def list_accounts(self) -> list[Account]:
        return self._repo.find_all()

    def list_accounts_for_user(self, user_id: int) -> list[Account]:
        self._user_service.get_user(user_id)  # will raise 404 if user not found
        return self._repo.find_by_user_id(user_id)

    def create_account(self, data: AccountIn) -> Account:
        self._user_service.get_user(data.user_id)  # will raise 404 if user not found
        return self._repo.create(data)

    def update_account(self, account_id: int, data: AccountUpdate) -> Account:
        self._repo.find_by_id(account_id)
        self.get_account(account_id)
        return self._repo.update(account_id, data)

    def delete_account(self, account_id: int) -> None:
        self.get_account(account_id)
        return self._repo.delete(account_id)

    # ---------- Step 4: money ----------
    def deposit(self, account_id: int, amount: Decimal) -> Account:
        account = self.get_account(account_id)
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")
        new_balance = account.balance + amount
        return self._repo.update_balance(account_id, new_balance)   
        # TODO: rules, in this order:
        #   1. account must exist (404)            -> reuse get_account
        #   2. amount must be > 0 (400 "Amount must be positive")
        #   3. new balance = old balance + amount  -> repo.update_balance
        # (step 5 will also record a transaction here)
        raise NotImplementedError

    def withdraw(self, account_id: int, amount: Decimal) -> Account:
        account = self.get_account(account_id)
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")
        if amount > account.balance:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        new_balance = account.balance - amount
        return self._repo.update_balance(account_id, new_balance)
