# Simple Bank (FastAPI + MongoDB Atlas + React)

A small online bank: customers, accounts, deposits, withdrawals, transfers and an audit trail of every money movement,
with a login system (JWT) and two roles: **admin** (bank staff) and **customer**.
Built with Python, FastAPI, Pydantic, MongoDB Atlas and React, using a layered (MVC-style) design.

```
React page -> Axios service (adds "Authorization: Bearer <token>")
           -> Controller (routes + role checks) -> Service (business rules) -> Repository (MongoDB) -> Atlas
```

## Run it (Windows / PowerShell)

Backend (terminal 1):

```powershell
cd backend
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
..\.venv\Scripts\python.exe seed_demo.py        # optional: demo customers + logins (safe to run twice)
..\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Frontend (terminal 2):

```powershell
cd frontend
npm install
npm run dev        # http://localhost:5173
```

`backend/.env` (not committed) must contain:

```
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority"
JWT_SECRET="<long random string>"     # python -c "import secrets; print(secrets.token_hex(32))"
# optional: ADMIN_USERNAME, ADMIN_PASSWORD (default admin / admin123), JWT_MINUTES (default 60)
```

Swagger UI: http://127.0.0.1:8000/docs (log in with `POST /api/auth/login`, copy `accessToken`, click **Authorize**).

## Logins and roles

| Login | Role | What they can do |
|---|---|---|
| `admin` / `admin123` | ADMIN | Everything: all customers, accounts, search, audit log, turn on online banking for a customer |
| `john` / `john123`, `jane` / `jane123` (from `seed_demo.py`) | CUSTOMER | Only their own customer record, accounts and transactions; open accounts, deposit, withdraw, transfer |

- The admin login is created when the server starts if it doesn't exist yet.
- Anyone can sign up at **Open an account** (`POST /api/auth/register`): it creates a new customer and their login.
- Passwords are stored as bcrypt hashes. Tokens are HS256-signed JWTs that expire after `JWT_MINUTES`.
- `401` = not logged in / bad or expired token. `403` = logged in, but not allowed (e.g. a customer opening someone else's account).

## Endpoints

| Area | Method | Route | Who |
|---|---|---|---|
| Auth | POST | `/api/auth/login`, `/api/auth/register` | anyone |
| | GET | `/api/auth/me` | any login |
| | GET, POST | `/api/auth/users` (list logins / create a login for a customer) | admin |
| Customers | GET, POST | `/api/customers` | admin |
| | GET | `/api/customers/search?name=jo`, `/api/customers/premium?threshold=1000` | admin |
| | GET | `/api/customers/{id}`, `/api/customers/{id}/accounts`, `/api/customers/{id}/transactions` | admin or that customer |
| | PUT, DELETE | `/api/customers/{id}` (delete also removes accounts and login) | admin |
| Accounts | POST | `/api/accounts` | admin, or a customer for themselves |
| | GET | `/api/accounts`, `/api/accounts/premium?threshold=1000` | admin |
| | GET | `/api/accounts/{id}`, `/api/accounts/{id}/transactions` | admin or the owner |
| | PUT, DELETE | `/api/accounts/{id}` (PUT can't change the balance) | admin |
| | POST | `/api/accounts/{id}/deposit`, `/api/accounts/{id}/withdraw` body `{"amount": 500}` | admin or the owner |
| Transfers | POST | `/api/transfers` body `{"fromAccountId": 1, "toAccountId": 2, "amount": 50}` | admin or the owner of the FROM account |
| Audit | GET | `/api/audit/transactions`, `/api/audit/transactions/{id}` | admin |

Business rules: amounts must be positive, no withdrawing or transferring more than the balance,
no transfer to the same account, and every deposit / withdrawal / transfer is recorded in the audit trail
(who, when, which accounts, how much). Audit records are never changed or deleted.

## Testing

Import `backend/Duong_Lam_Banking-app.postman_collection.json` into Postman and use **Run collection**
(51 requests, 89 assertions). Folder 0 logs in as admin and saves the token; the collection sends it on every
request. Folder 5 checks the roles (customers get 403 on other people's data).

## Structure

```
backend/
  main.py                 app + routers, creates the admin login on startup
  dependencies.py         creates and wires repositories and services
  db.py                   MongoDB connection, Decimal128 codec, auto-increment ids
  models.py               Pydantic models (requests/responses)
  security.py             bcrypt password hashing, JWT create/decode
  auth_guard.py           get_current_user, require_admin, ensure_owner (used with Depends)
  *_controller.py         routes
  *_service.py            business rules
  *_repository.py         MongoDB queries
  seed_demo.py            demo data
frontend/src/
  auth/                   AuthContext (who is signed in), ProtectedRoute, token storage
  layouts/                PublicLayout (header) and AppLayout (sidebar)
  pages/                  public pages, customer/ (online banking), admin/ (staff portal)
  components/             reusable pieces (tables, cards, forms)
  services/               Axios calls; api.js adds the token and handles 401
```
