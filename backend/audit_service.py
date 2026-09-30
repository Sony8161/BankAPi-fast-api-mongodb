from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException
from audit_repository import AuditRepository
from models import Transaction, TransactionIn, TxnType


class AuditService:
    """Records every money movement and answers "what happened?" questions.
    AccountService calls record() after each deposit / withdraw / transfer."""

    def __init__(self, repo: AuditRepository):
        self._repo = repo

    def record(self, txn_type: TxnType, amount: Decimal, customer_id: int,
               from_account_id: int | None = None, to_account_id: int | None = None) -> Transaction:
        # TODO: build a TransactionIn from these values, with timestamp=datetime.now(timezone.utc),
        #       then save it with the repository and return the result
        raise NotImplementedError

    def list_transactions(self) -> list[Transaction]:
        # TODO
        raise NotImplementedError

    def get_transaction(self, txn_id: int) -> Transaction:
        # TODO: 404 "Transaction not found" (same pattern as get_customer)
        raise NotImplementedError

    def list_for_account(self, account_id: int) -> list[Transaction]:
        # TODO
        raise NotImplementedError
