
from fastapi import HTTPException
from models import User, UserIn
from user_repository import UserRepository
from account_repository import AccountRepository


class UserService:
    """Business logic. Talks to the repository, never to routes."""

    def __init__(self, repo: UserRepository, account_repo: AccountRepository):
        self._repo = repo
        self._account_repo = account_repo   # needed for the cascade delete

    def get_user(self, user_id: int) -> User:
        user = self._repo.find_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def create_user(self, data: UserIn) -> User:
        return self._repo.create(data)
    
    def update_user(self, user_id: int, data: UserIn) -> User:
        self.get_user(user_id)  # Reuse the 404 check
        updated_user = self._repo.update(user_id, data)
        return updated_user


    def list_users(self) -> list[User]:
        return self._repo.find_all()
    

    def delete_user(self, user_id: int) -> None:
        self.get_user(user_id)  # Reuse the 404 check
        #delete this user's accounts first
        self._account_repo.delete_by_user_id(user_id)
        self._repo.delete(user_id)