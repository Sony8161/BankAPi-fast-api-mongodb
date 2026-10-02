# Banking App Project — Context for Claude

## How to work with me
- I'm learning. Build **slowly, one step at a time**. Explain the concept, give me a starter file with TODOs, I write the code, you review it.
- Don't build the whole thing for me. Keep explanations brief.
- When pointing out a fix, always say exactly where: file path + line number(s), then what to change.
- I'm on **Windows / PowerShell**. Run the server from the `backend` folder: `cd backend` then `python -m uvicorn main:app --reload` (plain `uvicorn` isn't on my PATH).
- Project folder: `C:\Users\jeffl\Documents\citibank`
  - `backend/` — FastAPI app (main, models, controller, service, repository)
  - `frontend/` — React app (Vite)
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
6. ✅ React frontend (branch `react-frontend`). 38/38 browser test cases pass: frontend/test-results/frontend_test_results.json (old UI, before login)
7. ✅ Bank-style UI + login system: JWT, bcrypt, roles ADMIN / CUSTOMER (branch `auth-jwt`, e9f5fde)
8. ✅ One-page redesign (soft rose, light/dark) + full login system: forgot username/password, reset link,
   change password, sign out everywhere, lockout, staff unlock / temporary password (branch `one-page-redesign`, 5a6d4f2)
8b. ⏳ **CURRENT:** Convenience features: payee name check, Zelle-style new-payee warning, recent recipients + Send again,
   quick amounts, nicknames + savings goals, alerts bell, date ranges + monthly statements, session warning, staff notes
9. Scale-up ideas: atomic transfers (Mongo transactions), idempotency keys, refresh tokens, Redis rate limits,
   hash-chained audit log, structured logging + /health, Docker + CI, load tests, real email service, AWS

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

## Current state (step 7: login, roles, bank-style UI) — 2026-10-01
Built by Claude (API-tested 39/39, Postman 51 requests / 89 assertions, browser walkthrough with screenshots):
- Backend: models (Role, LoginIn, RegisterIn, CreateLoginIn, User, UserInDB, TokenOut), security.py (bcrypt + PyJWT HS256,
  JWT_SECRET in .env), user_repository.py (`users` collection, unique username index), auth_service.py, auth_guard.py
  (get_current_user, require_admin, ensure_owner), auth_controller.py (/api/auth/login, register, me, users), role checks on
  every customer/account/transfer/audit route, GET /api/customers/{id}/transactions, admin login created on startup
  (admin / admin123), seed_demo.py (john / john123, jane / jane123). requirements.txt adds pyjwt, bcrypt.
- Frontend: auth/ (AuthContext, ProtectedRoute, session.js localStorage), api.js interceptors (adds Bearer token, 401 -> logout),
  layouts (PublicLayout header, AppLayout sidebar), landing / login / register pages, customer portal (/app: overview, account
  page with deposit/withdraw, transfer with receipt, activity), admin portal (/admin: dashboard stats, customers, customer detail
  with online banking + open account, search, audit log), new index.css design.
- TODO (Duong), in order: backend/auth_service.py login (line 17), backend/auth_guard.py get_current_user (line 26),
  frontend/src/pages/LoginPage.jsx handleSubmit (line 24).

## Current state (step 8: one-page redesign + full login system) — 2026-10-01
Built by Claude on top of e9f5fde (tested: API 37 + 30 + 39 checks, Postman 73 requests / 133 assertions, browser 104/104
light / dark / phone). Mockup: Design canvas "Simple Bank: One-Page Mockup" (also `Simple Bank One-Page Mockup.pdf`).
- Backend: password rule (letter + number), lockout (5 wrong -> 15 min, 429), forgot-username / forgot-password (generic
  answers, rate limited 5 per 15 min per IP), reset links (secrets.token_urlsafe, only SHA-256 stored, 15 min, single use,
  newer cancels older; `password_resets` collection), change password + sign out everywhere (`token_version` -> JWT `ver`
  claim checked in auth_guard), /api/auth/me/events, staff unlock + temporary password, `security_events` log,
  /api/admin/stats and /api/admin/customers (server paging + X-Total-Count, no N+1), audit paging/filters, amount rules
  (> 0, 2 decimals, <= $1,000,000), performed_by on every transaction, gzip + security headers, indexes.
  mailer.py prints emails in the uvicorn terminal (no real email yet).
- Frontend: /app = CustomerHome (balance card with hide-balances eye, Move money with Review step + CONFIRM over $1,000,
  accounts with sparklines + copy number + open account, activity with search/chips/day groups/receipt drawer/statement CSV,
  insights, security card: sign-ins, session timer, change password, sign out everywhere). /admin = AdminHome (KPI tiles,
  customers with debounced server search + premium + paging + Add customer using Duong's CustomerForm, customer drawer:
  online banking on/unlock/temporary password, accounts, teller, recent activity, edit, delete; live feed with 30 s refresh;
  sign-in log with problems-only). AppShell top bar, Ctrl+K palette ("deposit 50"), toasts, rose tokens + dark mode.
  Auth pages: login (show password, Caps Lock warning, remember username, forgot links), register (strength meter),
  forgot username, forgot password, reset password. Old multi-page screens removed (old URLs redirect to /app or /admin).
- Duong's own code kept as written: auth_service.login, auth_guard.get_current_user, LoginPage.handleSubmit, CustomerForm.

## Current state (step 8b: convenience features) — 2026-10-02
Built by Claude on top of 5a6d4f2 (tested: API 28 new + 37 + 30 + 39 checks, Postman 83 requests / 151 assertions,
browser 131/131 + 8/8 session warning). Email stays as the "we've sent it" confirmation (no real sending, by choice).
- Backend: GET /api/accounts/{id}/payee ("Jane S.", 30/min per IP), PATCH /api/accounts/{id}/settings (nickname, goal;
  never the balance), POST /api/auth/refresh ("Stay signed in"), GET/POST /api/admin/customers/{id}/notes
  (`customer_notes` collection, note_repository.py). Account model gains nickname + goal.
- Frontend: MoveMoneyForm (recent recipient chips, name check while typing, "Do you know Ann L.?" + "I know this person"
  tick for first-time payees, quick $20/$50/$100/All, balance after), ReceiptDrawer "Send again", AccountsSection
  (nickname + goal progress), AlertsDrawer (bell: money in, large payments, staff actions, sign-in events, "New" since last
  look), ActivityCard date range, StatementDrawer (monthly opening/closing, CSV, print/Save as PDF), SessionWarning
  (2 min before expiry), CustomerDrawer staff notes. Keyboard-shortcut sheet skipped by choice.
- Demo: script doc https://claude.ai/code/artifact/61a4aeae-1704-4892-a0c6-f0a6bb336da6 and demo/Simple Bank Demo.mp4.

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
- Never say whether an account exists on a signed-out form (forgot username/password): same message either way
- Store only a HASH of reset tokens; tokens expire and work once
- A JWT can't be "deleted": bump a version number in the user record and check it on every request instead
- Debounce search boxes (wait 250 ms) so typing "jane" is one request, not four
- Show who owns an account BEFORE money moves (name check), and ask for a yes on a first payment to someone new
- Rate-limit lookups that reveal names, so nobody can walk through every account number

## OOP concepts to connect along the way
Classes/objects, constructors (incl. multiple), methods/params/return types, overloading, inheritance (`Customer(CustomerIn)`, later SavingsAccount), overriding, access modifiers (Java: public/private/protected/default; Python uses `_` convention), static, final.
