from decimal import Decimal

from models import Account, AccountIn, AccountUpdate


class AccountRepository:
    """Storage only. No business rules. MongoDB will replace this later."""

    def __init__(self):
        self._accounts: dict[int, Account] = {}
        self._next_id = 1

    def find_all(self) -> list[Account]:
        return list(self._accounts.values())

    def find_by_id(self, account_id: int) -> Account | None:
        return self._accounts.get(account_id)

    def find_by_user_id(self, user_id: int) -> list[Account]:
        return [account for account in self._accounts.values() if account.user_id == user_id]

    def create(self, data: AccountIn) -> Account:
        account = Account(
            id=self._next_id,
            user_id=data.user_id,
            account_type=data.account_type,
            balance=Decimal("0.00"),
        )
        self._accounts[self._next_id] = account
        self._next_id += 1
        return account

    def update(self, account_id: int, data: AccountUpdate) -> Account:
        existing = self._accounts.get(account_id)
        if not existing:
            raise ValueError("Account not found")
        updated = existing.model_copy(update=data.model_dump())
        self._accounts[account_id] = updated
        return updated

    def delete(self, account_id: int) -> None:
        if account_id in self._accounts:
            del self._accounts[account_id]

    def delete_by_user_id(self, user_id: int) -> None:
        to_delete = [account_id for account_id, account in self._accounts.items() if account.user_id == user_id]
        for account_id in to_delete:
            del self._accounts[account_id]

    def update_balance(self, account_id: int, new_balance: Decimal) -> Account:
        existing = self._accounts.get(account_id)
        if not existing:
            raise ValueError("Account not found")
        updated = existing.model_copy(update={"balance": new_balance})
        self._accounts[account_id] = updated
        return updated
