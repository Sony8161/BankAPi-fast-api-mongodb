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
        raise NotImplementedError

    def list_accounts(self) -> list[Account]:
        # TODO
        raise NotImplementedError

    def list_accounts_for_user(self, user_id: int) -> list[Account]:
        # TODO: 404 if the user doesn't exist, then return their accounts (can be [])
        raise NotImplementedError

    def create_account(self, data: AccountIn) -> Account:
        # TODO: rule: the user must exist. Then create.
        raise NotImplementedError

    def update_account(self, account_id: int, data: AccountUpdate) -> Account:
        # TODO
        raise NotImplementedError

    def delete_account(self, account_id: int) -> None:
        # TODO
        raise NotImplementedError
