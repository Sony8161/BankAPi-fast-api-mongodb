from fastapi import APIRouter
from models import Account, Customer, CustomerIn
from dependencies import customer_service as service, account_service

router = APIRouter(prefix="/api/customers", tags=["Customers"])

# wiring moved to dependencies.py so every controller shares the same objects



# TODO (search/filter): two GET routes HERE, above "/{customer_id}" (same reason as
# /premium in account_controller: routes match top to bottom).
#   GET "/search"   query param name: str          -> list[Customer]   service.search_customers(name)
#   GET "/premium"  query param threshold: float   -> list[Customer]   service.premium_customers(threshold)

@router.get("/{customer_id}", response_model=Customer)
def get_customer(customer_id: int):
    return service.get_customer(customer_id)

@router.post("", response_model=Customer)
def create_customer(data: CustomerIn):
    return service.create_customer(data)


@router.put("/{customer_id}", response_model=Customer)
def update_customer(customer_id: int, data: CustomerIn):
    return service.update_customer(customer_id, data)



@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int):
    service.delete_customer(customer_id)
    return None  # FastAPI will return a 204 No Content response


@router.get("", response_model=list[Customer])
def list_customers():
    return service.list_customers()


@router.get("/{customer_id}/accounts", response_model=list[Account])
def list_accounts_for_customer(customer_id: int):
    return account_service.list_accounts_for_customer(customer_id)

