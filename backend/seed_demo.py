"""Demo data for a presentation. Run from backend/:   python seed_demo.py
Safe to run twice: it skips any login that already exists.

Logins it creates (password in brackets):
  john  (john123)   John Doe  - Savings $5,000, Checking $1,250
  jane  (jane123)   Jane Smith - Checking $800
The admin login (admin / admin123 unless .env says otherwise) is made when the server starts.
"""
import os
from decimal import Decimal

from fastapi import HTTPException

from dependencies import account_service, auth_service, customer_repo, customer_service, user_repo
from models import AccountIn, AccountType, CreateLoginIn, CustomerIn, TransferIn

DEMO = [
    ("John Doe", "john@example.com", "john", "john123", [(AccountType.SAVINGS, 5000), (AccountType.CHECKING, 1250)]),
    ("Jane Smith", "jane@example.com", "jane", "jane123", [(AccountType.CHECKING, 800)]),
]

auth_service.ensure_admin(os.getenv("ADMIN_USERNAME", "admin"), os.getenv("ADMIN_PASSWORD", "admin123"))
first_accounts = []
for name, email, username, password, accounts in DEMO:
    if user_repo.find_by_username(username):
        print(f"skip {username}: login already exists")
        continue
    customer = customer_repo.find_by_email(email) or customer_service.create_customer(CustomerIn(name=name, email=email))
    try:
        auth_service.create_login(CreateLoginIn(customer_id=customer.id, username=username, password=password))
    except HTTPException as e:
        print(f"skip {username}: {e.detail}")
        continue
    created = []
    for account_type, amount in accounts:
        account = account_service.create_account(AccountIn(customer_id=customer.id, account_type=account_type))
        account_service.deposit(account.id, Decimal(amount))
        created.append(account)
    first_accounts.append(created[0])
    print(f"{username}: customer {customer.id}, accounts {[a.id for a in created]}")

if len(first_accounts) == 2:   # a transfer and a withdrawal so the activity lists aren't empty
    john_savings, jane_checking = first_accounts
    account_service.transfer(TransferIn(from_account_id=john_savings.id, to_account_id=jane_checking.id, amount=Decimal(150)))
    account_service.withdraw(jane_checking.id, Decimal(60))
    print("added a transfer and a withdrawal")
