from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.task_prediction import TaskPredictionInput, TaskPredictionOutput
from app.models.task_prediction_model import predict_task_completion
import pandas as pd
from datetime import datetime, timezone

router = APIRouter()

PRIORITY_MAP = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3}

@router.post("/predict_batch", response_model=List[TaskPredictionOutput])
async def predict_batch(tasks: List[TaskPredictionInput]):
    if not tasks:
        raise HTTPException(status_code=400, detail="No tasks provided for prediction")

    data = pd.DataFrame([task.model_dump() for task in tasks])

    now = datetime.now(timezone.utc)
    data['deadline'] = pd.to_datetime(data['deadline'], utc=True)
    data['created_at'] = pd.to_datetime(data['created_at'], utc=True)

    if 'deadline_days' not in data.columns or data['deadline_days'].isnull().any():
        data['deadline_days'] = (data['deadline'] - now).dt.days
    if 'created_to_deadline' not in data.columns or data['created_to_deadline'].isnull().any():
        data['created_to_deadline'] = (data['deadline'] - data['created_at']).dt.days

    data['priority'] = data['priority'].str.upper().map(PRIORITY_MAP).fillna(2).astype(int)

    required_features = [
        'duration', 'priority', 'subtasks', 'deadline_days', 'created_to_deadline',
        'user_past_completion', 'task_type', 'description_length', 'comments_count',
        'assigned_team_size', 'user_availability', 'no_curr_assigned_tasks', 'tasks_completed',
         'avg_completion_time'
    ]
    for feat in required_features:
        if feat not in data.columns:
            print("feat missing: ", feat)
            data[feat] = 0

    print("data", data)
    predictions = predict_task_completion(data)

    if not predictions or len(predictions) != len(tasks):
        raise HTTPException(status_code=500, detail="Prediction failed")

    results = []
    for i, task in enumerate(tasks):
        completion_prob = predictions[i]
        if completion_prob < 0.3:
            risk_indicator = "HIGH"
        elif completion_prob < 0.6:
            risk_indicator = "MEDIUM"
        else:
            risk_indicator = "LOW"

        results.append(TaskPredictionOutput(
            task_id=getattr(task, "task_id", i),
            completion_probability=completion_prob,
            risk_indicator=risk_indicator
        ))

    return results

@router.post("/predict", response_model=List[TaskPredictionOutput])
async def predict_completion(tasks: List[TaskPredictionInput]):

    if not tasks:
        raise HTTPException(status_code=400, detail="No tasks provided for prediction")

    data = pd.DataFrame([task.model_dump() for task in tasks])

    now = datetime.now(timezone.utc)
    data['deadline'] = pd.to_datetime(data['deadline'], utc=True)
    data['created_at'] = pd.to_datetime(data['created_at'], utc=True)

    if 'deadline_days' not in data.columns or data['deadline_days'].isnull().any():
        data['deadline_days'] = (data['deadline'] - now).dt.days
    if 'created_to_deadline' not in data.columns or data['created_to_deadline'].isnull().any():
        data['created_to_deadline'] = (data['deadline'] - data['created_at']).dt.days

    data['priority'] = data['priority'].str.upper().map(PRIORITY_MAP).fillna(2).astype(int)



    required_features = [
        'duration', 'priority', 'subtasks', 'deadline_days', 'created_to_deadline',
        'user_past_completion', 'task_type', 'description_length', 'comments_count',
        'assigned_team_size', 'user_availability', 'no_curr_assigned_tasks', 'tasks_completed', 'avg_completion_time'
    ]
    for feat in required_features:
        if feat not in data.columns:
            print("feat missing: ", feat)
            data[feat] = 0

    predictions = predict_task_completion(data)

    if not predictions or len(predictions) != len(tasks):
        raise HTTPException(status_code=500, detail="Prediction failed")

    results = []
    for i, task in enumerate(tasks):
        completion_prob = predictions[i]
        if completion_prob < 0.3:
            risk_indicator = "HIGH"
        elif completion_prob < 0.6:
            risk_indicator = "MEDIUM"
        else:
            risk_indicator = "LOW"

        results.append(TaskPredictionOutput(
            task_id=getattr(task, "task_id", i),
            completion_probability=completion_prob,
            risk_indicator=risk_indicator
        ))

    return results