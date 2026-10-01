from decimal import Decimal

from fastapi import HTTPException
from models import Customer, CustomerIn
from customer_repository import CustomerRepository
from account_repository import AccountRepository


class CustomerService:
    """Business logic. Talks to the repository, never to routes."""

    def __init__(self, repo: CustomerRepository, account_repo: AccountRepository):
        self._repo = repo
        self._account_repo = account_repo   # needed for the cascade delete

    def get_customer(self, customer_id: int) -> Customer:
        customer = self._repo.find_by_id(customer_id)
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer

    def create_customer(self, data: CustomerIn) -> Customer:
        return self._repo.create(data)
    
    def update_customer(self, customer_id: int, data: CustomerIn) -> Customer:
        self.get_customer(customer_id)  # Reuse the 404 check
        updated_customer = self._repo.update(customer_id, data)
        return updated_customer


    def list_customers(self) -> list[Customer]:
        return self._repo.find_all()
    

    def delete_customer(self, customer_id: int) -> None:
        self.get_customer(customer_id)  # Reuse the 404 check
        #delete this customer's accounts first
        self._account_repo.delete_by_customer_id(customer_id)
        self._repo.delete(customer_id)


    # ---------- Search / filter ----------
    def search_customers(self, name: str) -> list[Customer]:
        # TODO: return self._repo.find_by_name(name.strip())   (strip = remove spaces at the ends)
        raise NotImplementedError

    def premium_customers(self, threshold: float) -> list[Customer]:
        # TODO: customers who own at least one account with balance >= threshold.
        #   1. 400 if threshold < 0 (same message style as get_premium_accounts)
        #   2. accounts = self._account_repo.find_premium(Decimal(str(threshold)))
        #   3. ids = {a.customer_id for a in accounts}    <- a set: each customer once
        #   4. return self._repo.find_by_ids(list(ids))
        raise NotImplementedError
