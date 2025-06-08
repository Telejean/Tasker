import pandas as pd
import numpy as np
import random
import os
import matplotlib as plt

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
from tensorflow.keras.layers import Dense, Dropout, Input
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping



random.seed(42)
np.random.seed(42)
tf.random.set_seed(42)

MODEL_SAVE_DIR = "../app/models/trained_models"
MODEL_FILENAME = "task_completion_prediction_model_nn.keras"
PREPROCESSOR_FILENAME = "preprocessor_nn.pkl"
MODEL_PATH = os.path.join(MODEL_SAVE_DIR, MODEL_FILENAME)
PREPROCESSOR_PATH = os.path.join(MODEL_SAVE_DIR, PREPROCESSOR_FILENAME)

def preprocess_data(df):
    print("Preprocessing data...")

    categorical_features = ['task_type']
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

def build_and_train_model(X_train, y_train, input_dim):
    print("Building realistic neural network...")

    inputs = Input(shape=(input_dim,))
    x = Dense(128, activation='relu')(inputs)
    x = Dropout(0.4)(x)
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.3)(x)
    outputs = Dense(1, activation='sigmoid')(x)

    model = Model(inputs=inputs, outputs=outputs)

    def weighted_bce(y_true, y_pred):
        weights = tf.where(
            y_true == 1,
            1.0,
            3.0
        )
        bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)
        return tf.reduce_mean(weights * bce)

    model.compile(
        optimizer=Adam(learning_rate=0.0001),
        loss=weighted_bce,
        metrics=[
            'accuracy',
            tf.keras.metrics.Precision(name='precision'),
            tf.keras.metrics.Recall(name='recall'),
            tf.keras.metrics.AUC(name='auc')
        ]
    )

    early_stopping = EarlyStopping(
        monitor='val_auc',
        patience=20,
        mode='max',
        restore_best_weights=True
    )

    history = model.fit(
        X_train,
        y_train,
        epochs=100,
        batch_size=64,
        validation_split=0.15,
        callbacks=[early_stopping],
        verbose=1
    )

    return model, history

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

def save_model_and_preprocessor(model, preprocessor):
    print("Saving model and preprocessor...")
    os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
    model.save(MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    print(f"Neural network model saved to {MODEL_PATH}")
    print(f"Preprocessor saved to {PREPROCESSOR_PATH}")

if __name__ == "__main__":
    raw_data = pd.read_csv("refined_synthetic_data.csv")
    print(f"Class distribution: {raw_data['completed_on_time'].value_counts(normalize=True)}")

    X_num_cat, y, preprocessor = preprocess_data(raw_data)

    X_train, X_test, y_train, y_test = train_test_split(
        X_num_cat, y, test_size=0.20, random_state=42, stratify=y
    )

    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    input_dim = X_train_processed.shape[1]
    model, history = build_and_train_model(X_train_processed, y_train, input_dim)

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

    metrics = evaluate_model(model, preprocessor, X_test, y_test)

    save_model_and_preprocessor(model, preprocessor)
