from pymongo.database import Database

from db import from_doc, next_id
from models import Role, UserInDB


class UserRepository:
    """Storage for logins: the "users" collection. (Customers are people; users are logins.)
    A document looks like: {"_id": 1, "username": "admin", "password_hash": "$2b$12$...",
                            "role": "ADMIN", "customer_id": None}
    The password itself is NEVER stored, only its bcrypt hash."""

    def __init__(self, db: Database):
        self._db = db
        self._col = db.users

    def ensure_indexes(self) -> None:
        # unique index = the DATABASE refuses a second "john", even if two sign-ups race
        self._col.create_index("username", unique=True)

    def find_by_id(self, user_id: int) -> UserInDB | None:
        return from_doc(UserInDB, self._col.find_one({"_id": user_id}))

    def find_by_username(self, username: str) -> UserInDB | None:
        return from_doc(UserInDB, self._col.find_one({"username": username.lower()}))

    def find_by_customer_id(self, customer_id: int) -> UserInDB | None:
        return from_doc(UserInDB, self._col.find_one({"customer_id": customer_id}))

    def find_all(self) -> list[UserInDB]:
        return [from_doc(UserInDB, d) for d in self._col.find().sort("_id", 1)]

    def create(self, username: str, password_hash: str, role: Role,
               customer_id: int | None = None) -> UserInDB:
        doc = {
            "_id": next_id(self._db, "users"),
            "username": username.lower(),     # usernames are case-insensitive: "John" = "john"
            "password_hash": password_hash,
            "role": role.value,
            "customer_id": customer_id,
        }
        self._col.insert_one(doc)
        return from_doc(UserInDB, doc)

    def delete_by_customer_id(self, customer_id: int) -> None:
        self._col.delete_many({"customer_id": customer_id})
