from decimal import Decimal

from account_repository import AccountRepository
from auth_service import AuthService
from customer_repository import CustomerRepository
from models import AdminCustomer
from user_repository import UserRepository

PREMIUM = Decimal("1000")


class AdminService:
    """The staff customer list. Built for size: one PAGE of customers, then ONE query for all their
    accounts and ONE for all their logins ($in), instead of one query per customer (the "N+1" problem)."""

    def __init__(self, customer_repo: CustomerRepository, account_repo: AccountRepository,
                 user_repo: UserRepository, auth_service: AuthService):
        self._customers = customer_repo
        self._accounts = account_repo
        self._users = user_repo
        self._auth = auth_service

    def customer_page(self, text: str, premium_only: bool, limit: int, skip: int) -> tuple[list[AdminCustomer], int]:
        query = CustomerRepository.search_query(text)
        if premium_only:
            ids = self._accounts.customer_ids_with_balance_at_least(PREMIUM)
            query = {"$and": [query, {"_id": {"$in": ids}}]} if query else {"_id": {"$in": ids}}
        customers = self._customers.find_page(query, limit, skip)
        ids = [c.id for c in customers]
        accounts = self._accounts.find_by_customer_ids(ids)   # 1 query for the whole page
        logins = {u.customer_id: u for u in self._users.find_by_customer_ids(ids)}   # 1 more
        rows = []
        for c in customers:
            mine = [a for a in accounts if a.customer_id == c.id]
            login = logins.get(c.id)
            rows.append(AdminCustomer(
                id=c.id, name=c.name, email=c.email, account_count=len(mine),
                total_balance=sum((a.balance for a in mine), Decimal("0")),
                premium=any(a.balance >= PREMIUM for a in mine),
                login=self._auth.login_info(login) if login else None,
            ))
        return rows, self._customers.count(query)
