
from pymongo.database import Database

from db import from_doc, next_id
from models import Transaction, TransactionIn


class AuditRepository:
    """Storage for the audit trail: the "transactions" collection.
    Records are only ever ADDED, never updated or deleted. That's what makes it an audit trail.
    
    
    A document looks like: {"_id": 4, "type": "TRANSFER", "amount": 300, "customer_id": 1,
                            "from_account_id": 1, "to_account_id": 3, "timestamp": ...}"""

    """Helper to convert a MongoDB document to a Transaction model."""
    @staticmethod
    def _doc_to_transaction(doc) -> Transaction:
        return from_doc(Transaction, doc) if doc else None
    


    def __init__(self, db: Database):
        self._db = db
        self._col = db.transactions

    def create(self, data: TransactionIn) -> Transaction:
        doc = {"_id": next_id(self._db, "transactions"), **data.model_dump()}
        self._col.insert_one(doc)
        return self._doc_to_transaction(doc)
        
        # raise NotImplementedError

    def find_all(self) -> list[Transaction]:
        Transactions = self._col
        docs = Transactions.find().sort("_id", -1)
        return [self._doc_to_transaction(doc) for doc in docs]  
        
        #raise NotImplementedError

    def find_by_id(self, txn_id: int) -> Transaction | None:
        Transactions = self._col
        doc = Transactions.find_one({"_id": txn_id})
        return self._doc_to_transaction(doc)
        # raise NotImplementedError

    def find_by_account_id(self, account_id: int) -> list[Transaction]:
        Transactions = self._col
        docs = Transactions.find({"$or": [{"from_account_id": account_id}, {"to_account_id": account_id}]}).sort("_id", -1)
        return [self._doc_to_transaction(doc) for doc in docs]
        
        # raise NotImplementedError
