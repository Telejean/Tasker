import pandas as pd
import numpy as np
import random
import os

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
import joblib

import tensorflow as tf
from tensorflow.keras.layers import Dense, Dropout, Input, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
import matplotlib.pyplot as plt


# Set random seeds for reproducibility
random.seed(42)
np.random.seed(42)
tf.random.set_seed(42)

# --- Configuration ---
MODEL_SAVE_DIR = "../app/models/trained_models"
MODEL_FILENAME = "task_completion_prediction_model_nn.keras"
PREPROCESSOR_FILENAME = "preprocessor_nn.pkl"
MODEL_PATH = os.path.join(MODEL_SAVE_DIR, MODEL_FILENAME)
PREPROCESSOR_PATH = os.path.join(MODEL_SAVE_DIR, PREPROCESSOR_FILENAME)

# --- 1. Data Preprocessing and Feature Engineering ---
def preprocess_data(df):
    print("Preprocessing data...")

    # Define features
    categorical_features = ['task_type']  # Only task_type is one-hot encoded
    numerical_features = [
        'duration',
        'priority',
        'subtasks',
        'deadline_days',
        'created_to_deadline',
        'user_past_completion',
        'description_length',
        'comments_count',
        'assigned_team_size',
        'user_availability',
        'no_curr_assigned_tasks',
        'tasks_completed',
        'avg_completion_time'
    ]

    # Preprocessing pipeline for numerical + low-cardinality categoricals
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ],
        remainder='drop'
    )

    X_num_cat = df[numerical_features + categorical_features]
    y = df['completed_on_time']

    return X_num_cat, y, preprocessor

# --- 2. Build and Train the Neural Network Model ---
def build_and_train_model(X_train, y_train, input_dim):
    print("Building and training a more complex neural network...")

    features_input = Input(shape=(input_dim,), name='features')
    x = Dense(128, activation='relu')(features_input)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.3)(x)
    x = Dense(32, activation='relu')(x)
    output = Dense(1, activation='sigmoid')(x)

    model = Model(inputs=features_input, outputs=output)
    model.compile(optimizer=Adam(learning_rate=0.001), loss='binary_crossentropy', metrics=['accuracy'])

    early_stopping = EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True)

    history = model.fit(
        X_train,
        y_train,
        epochs=300,
        batch_size=32,
        validation_split=0.2,
        callbacks=[early_stopping],
        verbose=1,
    )

    print("Neural network training complete.")
    return model, history

# --- 3. Evaluate the Model ---
def evaluate_model(model, preprocessor, X_test, y_test):
    print("Evaluating the model...")

    X_test_processed = preprocessor.transform(X_test)
    y_pred_proba = model.predict(X_test_processed)
    y_pred = (y_pred_proba > 0.5).astype(int)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print("\nModel Evaluation Metrics:")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    print("\nConfusion Matrix:")
    print(cm)

# --- 4. Save the Trained Model and Preprocessor ---
def save_model_and_preprocessor(model, preprocessor):
    print("Saving model and preprocessor...")
    os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
    model.save(MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    print(f"Neural network model saved to {MODEL_PATH}")
    print(f"Preprocessor saved to {PREPROCESSOR_PATH}")

# --- Main Training Process ---
if __name__ == "__main__":
    # 1. Load Data
    raw_data = pd.read_csv("synth_data_set_v2.csv")

    # 2. Preprocess Data and Engineer Features
    X_num_cat, y, preprocessor = preprocess_data(raw_data)

    # 3. Split Data (before fitting the preprocessor)
    X_train, X_test, y_train, y_test = train_test_split(
        X_num_cat, y, test_size=0.25, random_state=42, stratify=y
    )

    # 4. Fit the preprocessor *only* on the training data
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    # 5. Build and Train the Neural Network Model
    input_dim = X_train_processed.shape[1]

    trained_model, history = build_and_train_model(
        X_train_processed, y_train, input_dim
    )

    plt.figure(figsize=(12, 4))
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.show()


    # 6. Evaluate the Model
    evaluate_model(
        trained_model, preprocessor,
        X_test, y_test
    )

    # 7. Save the Model and Preprocessor
    save_model_and_preprocessor(trained_model, preprocessor)
