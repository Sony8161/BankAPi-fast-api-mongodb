from decimal import Decimal
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, PlainSerializer
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base for every model. Python uses snake_case, JSON uses camelCase:
    user_id in code  <->  "userId" in requests/responses."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# Money is stored as Decimal (exact math) but sent to the client as a JSON number.
Money = Annotated[Decimal, PlainSerializer(float, return_type=float, when_used="json")]


# ---------- Users ----------


class UserIn(CamelModel):   # what the client sends
    name: str
    email: str


class User(UserIn):        # inheritance: UserIn + id
    id: int


# ---------- Accounts ----------
class AccountType(str, Enum):   # only these values are allowed (Swagger shows a dropdown)
    SAVINGS = "SAVINGS"
    CHECKING = "CHECKING"


class AccountIn(CamelModel):
    """POST /api/accounts body: {"userId": 1, "accountType": "SAVINGS"}"""
    # TODO: user_id (int) and account_type (AccountType)


class AccountUpdate(CamelModel):
    """PUT body. No balance on purpose: only deposit/withdraw may change money."""
    # TODO: account_type


class Account(CamelModel):
    """What the API returns."""
    # TODO: id, user_id, account_type, balance (type Money, default Decimal("0.00"))
    # Think: could this inherit from AccountIn, the way User inherits UserIn?
