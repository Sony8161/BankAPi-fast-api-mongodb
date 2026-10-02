"""A small per-IP rate limit for the "forgot" endpoints, so nobody can flood someone's inbox
or probe thousands of emails. It keeps counts in memory: fine for one server.
With several servers behind a load balancer, keep the counts in Redis instead."""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

_hits: dict[str, deque] = defaultdict(deque)


def limit(name: str, max_calls: int, per_seconds: int):
    """Use as a dependency: dependencies=[Depends(limit("forgot", 5, 900))] = 5 calls per 15 minutes per IP."""
    def check(request: Request) -> None:
        key = f"{name}:{request.client.host if request.client else 'unknown'}"
        now = time.monotonic()
        calls = _hits[key]
        while calls and now - calls[0] > per_seconds:
            calls.popleft()   # forget calls older than the window
        if len(calls) >= max_calls:
            raise HTTPException(status_code=429, detail="Too many requests. Please wait a few minutes and try again.")
        calls.append(now)
    return check
