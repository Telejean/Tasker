import os
import joblib
import pandas as pd
import numpy as np
from typing import List
from tensorflow.keras.models import load_model

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "trained_models/task_completion_prediction_model_nn.keras")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "trained_models/preprocessor_nn.pkl")

task_prediction_model = None
task_prediction_preprocessor = None

def load_task_prediction_model():
    global task_prediction_model, task_prediction_preprocessor
    if task_prediction_model is None:
        if os.path.exists(MODEL_PATH):
            try:
                task_prediction_model = load_model(MODEL_PATH)
                print(f"Task prediction model loaded successfully from {MODEL_PATH}")
            except Exception as e:
                print(f"Error loading Keras model: {e}")
        else:
            print(f"Model not found at {MODEL_PATH}")
    if task_prediction_preprocessor is None:
        if os.path.exists(PREPROCESSOR_PATH):
            try:
                task_prediction_preprocessor = joblib.load(PREPROCESSOR_PATH)
                print(f"Preprocessor loaded successfully from {PREPROCESSOR_PATH}")
            except Exception as e:
                print(f"Error loading preprocessor: {e}")
        else:
            print(f"Preprocessor not found at {PREPROCESSOR_PATH}")

def predict_task_completion(data: pd.DataFrame) -> List[float]:
    if task_prediction_model is None or task_prediction_preprocessor is None:
        print("Model or preprocessor not loaded. Cannot make predictions.")
        return []

    try:
        categorical_features = ['task_type']
        numerical_features = [
            'duration', 'priority', 'subtasks', 'deadline_days', 'created_to_deadline',
            'user_past_completion', 'description_length', 'comments_count',
            'assigned_team_size', 'user_availability', 'no_curr_assigned_tasks',
            'tasks_completed', 'avg_completion_time'
        ]

        required_columns = set(numerical_features + categorical_features )
        missing = required_columns - set(data.columns)
        if missing:
            print(f"Missing required columns for prediction: {missing}")
            return []

        X_num_cat = data[numerical_features + categorical_features]
        X_num_cat_processed = task_prediction_preprocessor.transform(X_num_cat)

        preds = task_prediction_model.predict([X_num_cat_processed])
        preds = preds.flatten().tolist()
        return preds
    except Exception as e:
        print(f"Error during prediction: {e}")
        return []
