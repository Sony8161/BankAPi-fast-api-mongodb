from models import User, UserIn


class UserRepository:
    """Storage only. No business rules. MySQL will replace this later."""

    def __init__(self):                  # constructor
        self._users: dict[int, User] = {}  # _ = "private" by convention
        self._next_id = 1

    def find_all(self) -> list[User]:
        return list(self._users.values())

    def find_by_id(self, user_id: int) -> User | None:
        return self._users.get(user_id)  # None if missing, no 404 here

    def create(self, data: UserIn) -> User:
        user = User(id=self._next_id, **data.model_dump())
        self._users[self._next_id] = user
        self._next_id += 1
        return user

    def update(self, user_id: int, data: UserIn) -> User:
        user = User(id=user_id, **data.model_dump())
        self._users[user_id] = user
        return user

    def delete(self, user_id: int) -> None:
        del self._users[user_id]
