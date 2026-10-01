from fastapi import HTTPException

from customer_repository import CustomerRepository
from models import CreateLoginIn, CustomerIn, LoginIn, RegisterIn, Role, TokenOut, User, UserInDB
from security import create_access_token, hash_password, verify_password
from user_repository import UserRepository


class AuthService:
    """Logins: sign in, sign up, admin-created logins, and the first admin account."""

    def __init__(self, user_repo: UserRepository, customer_repo: CustomerRepository):
        self._users = user_repo
        self._customers = customer_repo

    def login(self, data: LoginIn) -> TokenOut:
        user = self._users.find_by_username(data.username.strip())
        if user is None or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        return self._token_for(user)

    def register(self, data: RegisterIn) -> TokenOut:
        """Online sign-up: creates a NEW customer and their login, then logs them in."""
        username = data.username.strip().lower()
        if self._users.find_by_username(username):
            raise HTTPException(status_code=409, detail="That username is taken")
        if self._customers.find_by_email(data.email.strip()):
            # Don't let a stranger claim an existing customer just by knowing their email.
            raise HTTPException(status_code=409,
                                detail="A customer with this email already exists. Ask the bank to turn on online banking.")
        customer = self._customers.create(CustomerIn(name=data.name.strip(), email=data.email.strip()))
        user = self._users.create(username, hash_password(data.password), Role.CUSTOMER, customer.id)
        return self._token_for(user)

    def create_login(self, data: CreateLoginIn) -> User:
        """Admin turns on online banking for an existing customer."""
        if self._customers.find_by_id(data.customer_id) is None:
            raise HTTPException(status_code=404, detail="Customer not found")
        if self._users.find_by_customer_id(data.customer_id):
            raise HTTPException(status_code=409, detail="This customer already has a login")
        if self._users.find_by_username(data.username.strip()):
            raise HTTPException(status_code=409, detail="That username is taken")
        user = self._users.create(data.username.strip(), hash_password(data.password),
                                  Role.CUSTOMER, data.customer_id)
        return _public(user)

    def list_users(self) -> list[User]:
        return [_public(u) for u in self._users.find_all()]

    def get_user(self, user_id: int) -> User | None:
        user = self._users.find_by_id(user_id)
        return _public(user) if user else None

    def ensure_admin(self, username: str, password: str) -> None:
        """Runs when the server starts: makes sure there is at least one admin to log in with."""
        self._users.ensure_indexes()
        if self._users.find_by_username(username) is None:
            self._users.create(username, hash_password(password), Role.ADMIN)
            print(f"Created admin login '{username}'")

    def _token_for(self, user: UserInDB) -> TokenOut:
        return TokenOut(access_token=create_access_token(user), user=_public(user))


def _public(user: UserInDB) -> User:
    """Drop the password hash before anything leaves the service."""
    return User(**user.model_dump(exclude={"password_hash"}))
