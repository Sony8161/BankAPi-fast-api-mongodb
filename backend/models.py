from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, PlainSerializer
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base for every model. Python uses snake_case, JSON uses camelCase:
    customer_id in code  <->  "customerId" in requests/responses."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# Money is stored as Decimal (exact math) but sent to the client as a JSON number.
Money = Annotated[Decimal, PlainSerializer(float, return_type=float, when_used="json")]


# ---------- Customers ----------


class CustomerIn(CamelModel):   # what the client sends
    name: str
    email: str


class Customer(CustomerIn):        # inheritance: CustomerIn + id
    id: int


# ---------- Accounts ----------
class AccountType(str, Enum):   # only these values are allowed (Swagger shows a dropdown)
    SAVINGS = "SAVINGS"
    CHECKING = "CHECKING"


class AccountIn(CamelModel):
    @staticmethod
    def example() -> "AccountIn":
        return AccountIn(customer_id=1, account_type=AccountType.SAVINGS)

    """POST /api/accounts body: {"customerId": 1, "accountType": "SAVINGS"}"""
    # TODO: customer_id (int) and account_type (AccountType)
    customer_id: int
    account_type: AccountType


class AccountUpdate(CamelModel):
    """PUT body. No balance on purpose: only deposit/withdraw may change money."""
    # TODO: account_type
    account_type: AccountType


class Account(CamelModel):
    """What the API returns."""
    # TODO: id, customer_id, account_type, balance (type Money, default Decimal("0.00"))
    # Think: could this inherit from AccountIn, the way Customer inherits CustomerIn?
    id: int
    customer_id: int
    account_type: AccountType
    balance: Money = Decimal("0.00")


class AmountIn(CamelModel):
    """Body for deposit/withdraw: {"amount": 500}"""
    # TODO: amount (type Money)
    amount: Money


class TransferIn(CamelModel):
    """POST /api/transfers body: {"fromAccountId": 1, "toAccountId": 2, "amount": 50}"""
    # TODO: from_account_id (int), to_account_id (int), amount (Money)


# ---------- Audit (transactions) ----------
class TxnType(str, Enum):
    DEPOSIT = "DEPOSIT"
    WITHDRAW = "WITHDRAW"
    TRANSFER = "TRANSFER"


class TransactionIn(CamelModel):
    """One audit record. Answers: what? how much? who? which accounts? when?"""
    # TODO: use exactly these names (the repository queries them):
    #   type: TxnType
    #   amount: Money
    #   customer_id: int                       WHO started it
    #   from_account_id: int | None = None     money LEFT this account (withdraw, transfer)
    #   to_account_id: int | None = None       money ENTERED this account (deposit, transfer)
    #   timestamp: datetime                    WHEN (UTC)
    # Why "| None"? A deposit has no "from" account and a withdrawal has no "to" account.


class Transaction(TransactionIn):   # same In/Out pattern as Customer(CustomerIn)
    id: int
