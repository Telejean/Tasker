from fastapi import APIRouter

from .endpoints import task_predictions

api_router = APIRouter()
api_router.include_router(task_predictions.router, prefix="/tasks", tags=["tasks"])
