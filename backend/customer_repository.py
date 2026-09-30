from pymongo import ReturnDocument
from pymongo.database import Database

from db import from_doc, next_id
from models import Customer, CustomerIn


class CustomerRepository:
    """Storage only. Reads/writes the "customers" collection in MongoDB.
    A document looks like: {"_id": 1, "name": "John", "email": "j@x.com"}"""

    def __init__(self, db: Database):
        self._db = db
        self._col = db.customers          # a collection is like a SQL table

    def find_by_id(self, customer_id: int) -> Customer | None:
        # example, done for you: find_one returns a dict or None; from_doc turns it into a Customer
        return from_doc(Customer, self._col.find_one({"_id": customer_id}))

    def create(self, data: CustomerIn) -> Customer:
        # example, done for you: get the next id, build the document, insert it
        doc = {"_id": next_id(self._db, "customers"), **data.model_dump()}
        self._col.insert_one(doc)
        return from_doc(Customer, doc)

    def find_all(self) -> list[Customer]:
        all_docs = self._col.find()
        return [from_doc(Customer, doc) for doc in all_docs]
    
        # TODO: self._col.find() gives every document. Convert each one with from_doc.
        # raise NotImplementedError

    def update(self, customer_id: int, data: CustomerIn) -> Customer:
        updated_doc = self._col.find_one_and_update(
            {"_id": customer_id},
            {"$set": data.model_dump()},
            return_document=ReturnDocument.AFTER
        )
        return from_doc(Customer, updated_doc) if updated_doc else None
        # TODO: self._col.find_one_and_update(filter, {"$set": data.model_dump()},
        #                                     return_document=ReturnDocument.AFTER)
        #       AFTER = give me the document after the change. Then from_doc it.
        raise NotImplementedError

    def delete(self, customer_id: int) -> None:
        self._col.delete_one({"_id": customer_id})
        # TODO: delete_one(filter)
        # raise NotImplementedError
