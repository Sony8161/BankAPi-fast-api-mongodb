"""Composition root: the ONE place objects are created and wired together.

Every controller imports from here, so they all share the SAME repositories
(the same in-memory dicts). When we switch to MongoDB, this is the file where
UserRepository() becomes MongoUserRepository(db); nothing else changes.
"""
from account_repository import AccountRepository
from account_service import AccountService
from user_repository import UserRepository
from user_service import UserService

user_repo = UserRepository()
account_repo = AccountRepository()

user_service = UserService(user_repo, account_repo)
account_service = AccountService(account_repo, user_service)
