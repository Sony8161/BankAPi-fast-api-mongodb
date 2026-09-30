from fastapi import FastAPI
from user_controller import router as user_router
from account_controller import router as account_router

app = FastAPI(title="Banking API")
app.include_router(user_router)
app.include_router(account_router)
