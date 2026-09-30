from decimal import Decimal
from fastapi import HTTPException
from models import Account, AccountIn, AccountUpdate, Transaction, TransferIn, TxnType
from account_repository import AccountRepository
from customer_service import CustomerService
from audit_service import AuditService


class AccountService:
    """Business rules for accounts. Reuses CustomerService for the "customer exists" check."""

    def __init__(self, repo: AccountRepository, customer_service: CustomerService,
                 audit_service: AuditService):
        self._repo = repo
        self._customer_service = customer_service
        self._audit = audit_service   # records every money movement (Priority 3)

    def get_account(self, account_id: int) -> Account:
        # TODO: the single 404 check ("Account not found"), same pattern as get_customer
        account = self._repo.find_by_id(account_id)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        return account

    def list_accounts(self) -> list[Account]:
        return self._repo.find_all()

    def list_accounts_for_customer(self, customer_id: int) -> list[Account]:
        self._customer_service.get_customer(customer_id)  # will raise 404 if customer not found
        return self._repo.find_by_customer_id(customer_id)

    def create_account(self, data: AccountIn) -> Account:
        self._customer_service.get_customer(data.customer_id)  # will raise 404 if customer not found
        return self._repo.create(data)

    def update_account(self, account_id: int, data: AccountUpdate) -> Account:
        self._repo.find_by_id(account_id)
        self.get_account(account_id)
        return self._repo.update(account_id, data)

    def delete_account(self, account_id: int) -> None:
        self.get_account(account_id)
        return self._repo.delete(account_id)

    # ---------- Step 4: money ----------
    def deposit(self, account_id: int, amount: Decimal) -> Account:
        account = self.get_account(account_id)
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")
        new_balance = account.balance + amount
        result = self._repo.update_balance(account_id, new_balance)
        self._audit.record(TxnType.DEPOSIT, amount, account.customer_id, to_account_id=account_id)
        return result
        

    def withdraw(self, account_id: int, amount: Decimal) -> Account:
        account = self.get_account(account_id)
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")
        if amount > account.balance:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        new_balance = account.balance - amount
        result = self._repo.update_balance(account_id, new_balance)
        self._audit.record(TxnType.WITHDRAW, amount, account.customer_id, from_account_id=account_id)
        return result

    # ---------- Priority 2 ----------
    def get_premium_accounts(self, threshold: float) -> list[Account]:
        if threshold < 0:
            raise HTTPException(status_code=400, detail="Threshold must be non-negative")
        return self._repo.find_accounts_with_balance_above(Decimal(str(threshold)))

    def transfer(self, data: TransferIn) -> Transaction:
        rules = []
        from_account = self.get_account(data.from_account_id)
        to_account = self.get_account(data.to_account_id)
        if from_account.id == to_account.id:
            raise HTTPException(status_code=400, detail="Cannot transfer to the same account") 
        if data.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")
        if data.amount > from_account.balance:
            raise HTTPException(status_code=400, detail="Insufficient funds")   
        new_from_balance = from_account.balance - data.amount
        new_to_balance = to_account.balance + data.amount
        self._repo.update_balance(from_account.id, new_from_balance)
        self._repo.update_balance(to_account.id, new_to_balance)
        return self._audit.record(TxnType.TRANSFER, data.amount, from_account.customer_id, from_account_id=from_account.id, to_account_id=to_account.id)
       

    # ---------- Priority 3 ----------
    def get_transactions(self, account_id: int) -> list[Transaction]:
        self.get_account(account_id)  # will raise 404 if not found
        return self._audit.list_for_account(account_id)
        raise NotImplementedError
