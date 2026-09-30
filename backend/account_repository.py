from decimal import Decimal

from pymongo import ReturnDocument
from pymongo.database import Database

from db import from_doc, next_id
from models import Account, AccountIn, AccountUpdate


class AccountRepository:
    """Storage only. Reads/writes the "accounts" collection.
    A document looks like: {"_id": 1, "customer_id": 1, "account_type": "SAVINGS", "balance": 0.00}
    Same patterns as CustomerRepository. Cheat sheet at the bottom of this file."""

    def __init__(self, db: Database):
        self._db = db
        self._col = db.accounts

    def find_all(self) -> list[Account]:
        docs = self._col.find()
        return [_doc_to_account(doc) for doc in docs]

    def find_by_id(self, account_id: int) -> Account | None:
        doc = self._col.find_one({"_id": account_id})
        return _doc_to_account(doc) if doc else None

    def find_by_customer_id(self, customer_id: int) -> list[Account]:
        docs = self._col.find({"customer_id": customer_id})
        return [_doc_to_account(doc) for doc in docs]

    def find_premium(self, threshold: Decimal) -> list[Account]:
        docs = self._col.find({"balance": {"$gte": threshold}})
        return [_doc_to_account(doc) for doc in docs]

    def create(self, data: AccountIn) -> Account:
        doc = {
            "_id": next_id(self._db, "accounts"),
            "customer_id": data.customer_id,
            "account_type": data.account_type,
            "balance": Decimal("0.00")
        }
        self._col.insert_one(doc)
        return _doc_to_account(doc)
        

    def update(self, account_id: int, data: AccountUpdate) -> Account:
        doc = self._col.find_one_and_update(
            {"_id": account_id},
            {"$set": data.model_dump()},
            return_document=ReturnDocument.AFTER
        )
        return _doc_to_account(doc) if doc else None

    def update_balance(self, account_id: int, new_balance: Decimal) -> Account:
        doc = self._col.find_one_and_update(
            {"_id": account_id},
            {"$set": {"balance": new_balance}},
            return_document=ReturnDocument.AFTER
        )
        return _doc_to_account(doc) if doc else None

    def delete(self, account_id: int) -> None:
        self._col.delete_one({"_id": account_id})

    def delete_by_customer_id(self, customer_id: int) -> None:
        self._col.delete_many({"customer_id": customer_id})


def _doc_to_account(doc) -> Account:
    return from_doc(Account, doc)   
# ---------- Mongo cheat sheet (SQL in comments) ----------
# find()                                         SELECT *
# find({"customer_id": 1})                       WHERE customer_id = 1
# find({"balance": {"$gte": 1000}})              WHERE balance >= 1000
# find_one({"_id": 5})                           one document, or None
# find_one_and_update(filter, {"$set": {...}}, return_document=ReturnDocument.AFTER)
# delete_one(filter) / delete_many(filter)
