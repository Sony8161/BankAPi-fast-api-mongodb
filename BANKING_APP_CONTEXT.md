# Banking App Project — Context for Claude

## How to work with me
- I'm learning. Build **slowly, one step at a time**. Explain the concept, give me a starter file with TODOs, I write the code, you review it.
- Don't build the whole thing for me. Keep explanations brief.
- When pointing out a fix, always say exactly where: file path + line number(s), then what to change.
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
5. ✅ MongoDB integration (trainer's task list) — all 3 priorities done 2026-09-30
   - Priority 1: Customers CRUD <-> Mongo (Users renamed to Customers, `/api/customers`)
   - Priority 2: Accounts CRUD in Mongo, 1 customer has many accounts, `getPremiumAccounts(threshold)` (balance >= threshold), deposit/withdraw/transfer. Optional: filtering/search on GET /api/accounts
   - Priority 3: AuditController -> AuditService -> AuditRepository -> `transactions` collection. Trace one transaction: who (customer_id), when (timestamp), accounts (from/to), amount, type
   - Then: test with Postman, push to GitHub, put the repo link on the GitExcelTracker, put Postman scripts in the Google Drive folder
6. ⏳ **CURRENT:** React frontend (branch `react-frontend`). 38/38 browser test cases pass: frontend/test-results/frontend_test_results.json
7. Bonus: JWT, pagination, AWS, atomic transfers (Mongo transactions), audit failed attempts

## Current state (step 6: React frontend)
Backend: done and on MongoDB (main = 60efed3). CORS added in main.py for http://localhost:5173.
Backend TODOs for the search page: customer_repository.find_by_name ($regex, starts-with, ignore case) and find_by_ids ($in);
customer_service.search_customers and premium_customers; customer_controller GET /search and /premium ABOVE /{customer_id}.

Frontend (Vite + React 19 + react-router + Axios) in `frontend/`. Run: `cd frontend`, `npm install` once, `npm run dev` -> http://localhost:5173
- Done (by Claude, browser-tested): main.jsx, App.jsx (routes), services/api.js (Axios + errorMessage), services/customerService.js,
  services/accountService.js, Header (title prop), Footer, FeatureCard, Spinner, ErrorMessage (onRetry), EmptyState,
  CustomerTable -> CustomerRow (props down, onDelete up), AccountTable, WelcomePage, CustomersPage (THE EXAMPLE: get all, delete,
  loading / error / empty states).
- TODO (Duong), in order: components/CustomerForm.jsx (child->parent onCreate), pages/CustomerDetailPage.jsx (get by id +
  accounts, Promise.all), backend search/premium TODOs, pages/SearchPage.jsx.
- Trainer's list still open: tracker links, Postman JSON + Q&A answers in Google Drive. Optional later: JWT (admin/customer roles, bcrypt).
Study guide doc (with a Line by line tab): https://claude.ai/code/artifact/ed7df4c3-3c60-46d7-884a-0104760973ad
GitHub remote: https://github.com/Sony8161/BankAPi-fast-api-mongodb.git (renamed from BankAPi-fast-api-nodb). Branches: api-base (in-memory API, c7e0962 + AmountIn fix) → mongodb-integration (60efed3) → react-frontend (full app). main = full app.

## Lessons so far
- Python is case-sensitive (`APIRouter`, not `APIrouter`)
- Use Pydantic v2's `model_copy(update=...)`, not `.copy()`
- In-memory data resets every time the server reloads
- Wire objects in one place (`dependencies.py`, the composition root); two `UserRepository()` calls = two separate dicts
- Audit records are never updated or deleted (cascade delete keeps them)
- Declare fixed routes like `/premium` before `/{account_id}`
- `@staticmethod` methods take no `self`; a method name must match between service and repository
- Save files before testing: the server only sees what's on disk
- React: data down as props, events up as function props; one page owns the state, children just draw

## OOP concepts to connect along the way
Classes/objects, constructors (incl. multiple), methods/params/return types, overloading, inheritance (`Customer(CustomerIn)`, later SavingsAccount), overriding, access modifiers (Java: public/private/protected/default; Python uses `_` convention), static, final.
