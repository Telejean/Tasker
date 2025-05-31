from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api import api_router
from app.models.task_prediction_model import load_task_prediction_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up Taskr AI Microservice...")
    load_task_prediction_model()
    yield
    print("Shutting down Taskr AI Microservice.")

app = FastAPI(
    title="Taskr AI Microservice",
    description="API for Taskr's AI-powered features",
    version="0.1.0",
    lifespan=lifespan,  # <-- Use the new lifespan handler
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Health"])
async def root():
    return {"message": "Taskr AI Microservice is running"}
