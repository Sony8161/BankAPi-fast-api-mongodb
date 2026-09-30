from pymongo.database import Database

from db import from_doc, next_id
from models import Transaction, TransactionIn


class AuditRepository:
    """Storage for the audit trail: the "transactions" collection.
    Records are only ever ADDED, never updated or deleted. That's what makes it an audit trail.
    A document looks like: {"_id": 4, "type": "TRANSFER", "amount": 300, "customer_id": 1,
                            "from_account_id": 1, "to_account_id": 3, "timestamp": ...}"""

    def __init__(self, db: Database):
        self._db = db
        self._col = db.transactions

    def create(self, data: TransactionIn) -> Transaction:
        # TODO: same as CustomerRepository.create, with the "transactions" counter
        raise NotImplementedError

    def find_all(self) -> list[Transaction]:
        # TODO: newest first: self._col.find().sort("_id", -1)
        raise NotImplementedError

    def find_by_id(self, txn_id: int) -> Transaction | None:
        # TODO
        raise NotImplementedError

    def find_by_account_id(self, account_id: int) -> list[Transaction]:
        # TODO: money left this account OR entered it, newest first.
        #       Filter: {"$or": [{"from_account_id": account_id}, {"to_account_id": account_id}]}
        raise NotImplementedError
