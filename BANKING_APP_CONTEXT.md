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
- Database: **MongoDB Atlas** (switched back from MySQL on 2026-09-30, even though the assignment mentions an SQL script). Decided: keep int ids via a `counters` collection (`db.next_id`). Money = Decimal128 via a codec in `db.py`. DB name `banking`.
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
3. ✅ Account CRUD, linked to a user (+ cascade delete)
4. ✅ Deposit and withdraw with the business rules (committed in-memory version: c7e0962)
5. ⏳ **CURRENT: MongoDB integration (trainer's task list)**
   - Priority 1: Customers CRUD <-> Mongo (Users renamed to Customers, `/api/customers`)
   - Priority 2: Accounts CRUD in Mongo, 1 customer has many accounts, `getPremiumAccounts(threshold)` (balance >= threshold), deposit/withdraw/transfer. Optional: filtering/search on GET /api/accounts
   - Priority 3: AuditController -> AuditService -> AuditRepository -> `transactions` collection. Trace one transaction: who (customer_id), when (timestamp), accounts (from/to), amount, type
   - Then: test with Postman, push to GitHub, put the repo link on the GitExcelTracker, put Postman scripts in the Google Drive folder
6. React frontend
7. Bonus: JWT, pagination, AWS, atomic transfers (Mongo transactions), audit failed attempts

## Current state (step 5: MongoDB)
Scaffold with TODOs in `backend/` (a full reference solution was tested by Claude: 30/30 checks):
- `db.py` — done. Connection from `.env`, Decimal codec, `next_id(db, name)`, `from_doc(Model, doc)`.
- `customer_repository.py` — find_by_id + create done as examples. **TODO:** find_all, update, delete.
- `account_repository.py` — **TODO:** all methods incl. `find_premium` ($gte), `delete_by_customer_id` (delete_many).
- `audit_repository.py` — **TODO:** create, find_all, find_by_id, find_by_account_id ($or).
- `audit_service.py` — **TODO:** record, list_transactions, get_transaction (404), list_for_account.
- `account_service.py` — **TODO:** audit records in deposit/withdraw, get_premium_accounts, transfer, get_transactions.
- `models.py` — **TODO:** TransferIn and TransactionIn fields (names listed in comments).
- Controllers — **TODO:** premium route (above `/{account_id}`!), `/{id}/transactions`, POST `/api/transfers`, GET `/api/audit/transactions/{id}`.
- `dependencies.py`, `main.py`, `requirements.txt` — done.
Routes when finished: /api/customers (CRUD + /{id}/accounts), /api/accounts (CRUD, /premium?threshold=, /{id}/deposit, /{id}/withdraw, /{id}/transactions), POST /api/transfers, /api/audit/transactions (+ /{id}).
GitHub remote: https://github.com/Sony8161/BankAPi-fast-api-nodb.git (name says "nodb").

## Lessons so far
- Python is case-sensitive (`APIRouter`, not `APIrouter`)
- Use Pydantic v2's `model_copy(update=...)`, not `.copy()`
- In-memory data resets every time the server reloads
- Wire objects in one place (`dependencies.py`, the composition root); two `UserRepository()` calls = two separate dicts
- Audit records are never updated or deleted (cascade delete keeps them)
- Declare fixed routes like `/premium` before `/{account_id}`

## OOP concepts to connect along the way
Classes/objects, constructors (incl. multiple), methods/params/return types, overloading, inheritance (`Customer(CustomerIn)`, later SavingsAccount), overriding, access modifiers (Java: public/private/protected/default; Python uses `_` convention), static, final.
