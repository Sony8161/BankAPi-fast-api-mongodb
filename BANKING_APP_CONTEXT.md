# Banking App Project — Context for Claude

## How to work with me
- I'm learning. Build **slowly, one step at a time**. Explain the concept, give me a starter file with TODOs, I write the code, you review it.
- Don't build the whole thing for me. Keep explanations brief.
- I'm on **Windows / PowerShell**. Run the server from the `backend` folder: `cd backend` then `python -m uvicorn main:app --reload` (plain `uvicorn` isn't on my PATH).
- Project folder: `C:\Users\jeffl\Documents\citibank`
  - `backend/` — FastAPI app (main, models, controller, service, repository)
  - `frontend/` — React app (empty until step 8)
  - `.venv/` stays at the project root and is shared

## End goal (from the assignment doc)
Simple bank app where users can create an account, view account details, deposit, withdraw, and view transaction history.

**Graded on:** correct API implementation, clean MVC separation, working UI flows, proper database usage.
**Submit:** GitHub source code, SQL script, UI screenshots, Postman collection.

### Stack
- Backend: **Python + FastAPI** (chosen over Flask for built-in Swagger + Pydantic validation)
- Database: **MongoDB Atlas** (switched back from MySQL on 2026-09-30, even though the assignment mentions an SQL script). Decide at step 6: keep int ids (counters collection) or use ObjectId strings.
- Frontend: React
- Tools: VS Code, Postman, Swagger (`http://127.0.0.1:8000/docs`)

### Architecture
Frontend → Controller (routes) → Service (business logic) → Repository (storage) → Database

### Reference schema (from the assignment; Mongo collections will mirror these fields)
```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE accounts (
  account_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  balance DECIMAL(10,2) DEFAULT 0,
  account_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE transactions (
  txn_id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT,
  txn_type VARCHAR(20),
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);
```

### Required endpoints
| Action | Route | Body |
|---|---|---|
| Create account | POST `/api/accounts` | `{"userId": 1, "accountType": "SAVINGS"}` |
| Get account | GET `/api/accounts/{id}` | |
| Deposit | POST `/api/accounts/{id}/deposit` | `{"amount": 500}` |
| Withdraw | POST `/api/accounts/{id}/withdraw` | `{"amount": 200}` |
| Transaction history | GET `/api/accounts/{id}/transactions` | |

Sample account response: `{"accountId": 1, "userName": "John Doe", "balance": 1000.00}`
Sample transaction response: `[{"type": "DEPOSIT", "amount": 500, "date": "2026-03-20"}]`

### Service methods (AccountService)
createAccount(userId, accountType), getAccount(accountId), deposit(accountId, amount), withdraw(accountId, amount), getTransactions(accountId)

### Business rules
- Can't withdraw more than the balance
- Deposit amount must be positive
- Record a transaction for every deposit/withdraw

### My extra requirements
- 1 user can have 0 to many accounts
- Full CRUD for users and accounts (get all, get by id, create one, update, delete one)
- **Deleting a user also deletes all their accounts** (cascade, done in code)
- Get a user's accounts: GET `/api/users/{id}/accounts`
- PUT must NOT change balance directly; only deposit/withdraw/transfer touch money
- Transfer: POST `/api/transfers` with from_id, to_id, amount (both must exist, not the same account)

### Frontend screens
Home (Create Account / View Account buttons) → Create Account (name, email, account type dropdown) → Account Details (ID, name, balance + Deposit / Withdraw / View Transactions) → Deposit, Withdraw (amount input) → Transaction History table (ID, type, amount, date)

### Bonus
JWT login, transfers, pagination for transactions, UI validation messages, AWS deployment

## Roadmap
1. ✅ User CRUD in one file, in-memory, tested in Swagger
2. ✅ Split into layers (models / repository / service / controller)
3. ⏳ **CURRENT:** Account CRUD, linked to a user (+ cascade delete)
4. Service logic: deposit and withdraw with the business rules
5. Transactions: record them and add the history endpoint
6. Swap in-memory repositories for MongoDB Atlas (only the repository layer + dependencies.py change)
7. Postman collection and Swagger check
8. React frontend
9. Bonus: JWT, transfers, AWS

## Current state (step 3)
Step 2 is done and working (User CRUD through all layers).
Starter files in `backend/`:
- `models.py` — added `CamelModel` base (snake_case in Python, camelCase in JSON), `Money` type (Decimal, sent as a number), `AccountType` enum. **I need to fill:** `AccountIn`, `AccountUpdate` (no balance), `Account` fields.
- `account_repository.py` — **TODO:** find_all, find_by_id, find_by_user_id, create, update (keep balance), delete, delete_by_user_id.
- `account_service.py` — **TODO:** get_account (404), list_accounts, list_accounts_for_user, create_account (user must exist), update_account, delete_account.
- `account_controller.py` — POST done as an example. **TODO:** GET all, GET by id, PUT, DELETE.
- `dependencies.py` — done. Creates and wires all repos/services once so controllers share them.
- `user_service.py` — now takes `account_repo`. **TODO:** cascade delete in delete_user.
- `user_controller.py` — imports from dependencies. **TODO:** GET `/api/users/{id}/accounts`.
- `main.py` — includes the account router. Done.

## Lessons so far
- Python is case-sensitive (`APIRouter`, not `APIrouter`)
- Use Pydantic v2's `model_copy(update=...)`, not `.copy()`
- In-memory data resets every time the server reloads
- Wire objects in one place (`dependencies.py`, the composition root); two `UserRepository()` calls = two separate dicts

## OOP concepts to connect along the way
Classes/objects, constructors (incl. multiple), methods/params/return types, overloading, inheritance (`User(UserIn)`, later SavingsAccount), overriding, access modifiers (Java: public/private/protected/default; Python uses `_` convention), static, final.
