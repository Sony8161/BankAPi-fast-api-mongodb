from models import Account, AccountIn, AccountUpdate


class AccountRepository:
    """Storage only. No business rules. MongoDB will replace this later."""

    def __init__(self):
        self._accounts: dict[int, Account] = {}
        self._next_id = 1

    def find_all(self) -> list[Account]:
        # TODO
        raise NotImplementedError

    def find_by_id(self, account_id: int) -> Account | None:
        # TODO: None if missing (same as UserRepository)
        raise NotImplementedError

    def find_by_user_id(self, user_id: int) -> list[Account]:
        # TODO: every account whose user_id matches. Hint: list comprehension
        raise NotImplementedError

    def create(self, data: AccountIn) -> Account:
        # TODO: new Account with the next id. Balance comes from the model default.
        raise NotImplementedError

    def update(self, account_id: int, data: AccountUpdate) -> Account:
        # TODO: change ONLY account_type; keep id, user_id and balance.
        # Hint: existing.model_copy(update=data.model_dump())
        raise NotImplementedError

    def delete(self, account_id: int) -> None:
        # TODO
        raise NotImplementedError

    def delete_by_user_id(self, user_id: int) -> None:
        # TODO: remove every account this user owns (used by the cascade delete).
        # Careful: you can't delete from a dict while looping over that same dict.
        raise NotImplementedError
