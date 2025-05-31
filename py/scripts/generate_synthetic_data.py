import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

def generate_synthetic_data(n_samples=1000, random_state=42):
    np.random.seed(random_state)

    # Feature distributions
    assigned_team_size = np.clip(np.random.normal(loc=2, scale=1, size=n_samples), 1, 5).astype(int)
    duration = np.clip(np.random.normal(loc=7, scale=3, size=n_samples), 1, 14).astype(int)
    priority = np.random.choice([1, 2, 3], n_samples, p=[0.3, 0.5, 0.2])
    subtasks = np.clip(np.random.poisson(lam=2, size=n_samples), 0, 5)
    deadline_days = np.clip(np.random.normal(loc=15, scale=7, size=n_samples), 1, 30).astype(int)
    created_to_deadline = deadline_days + np.random.randint(0, 10, n_samples)
    user_past_completion = np.round(np.random.beta(a=5, b=1.5, size=n_samples) * 0.5 + 0.5, 2)
    task_type = np.random.choice(['bug', 'feature', 'documentation'], n_samples, p=[0.3, 0.5, 0.2])
    description_length = np.clip(np.random.normal(loc=100, scale=40, size=n_samples), 10, 300).astype(int)
    comments_count = np.clip(np.random.poisson(lam=3, size=n_samples), 0, 20)
    user_availability = np.clip(np.random.normal(loc=60, scale=15, size=n_samples), 20, 100).astype(int)
    no_curr_assigned_tasks = np.clip(np.random.poisson(lam=3, size=n_samples), 1, 10)
    tasks_completed = np.clip(np.random.normal(loc=30, scale=15, size=n_samples), 5, 100).astype(int)
    avg_completion_time = np.round(np.clip(np.random.exponential(scale=0.3, size=n_samples), 0.1, 1.0), 2)

    df = pd.DataFrame({
        'duration': duration,
        'priority': priority,
        'subtasks': subtasks,
        'deadline_days': deadline_days,
        'created_to_deadline': created_to_deadline,
        'user_past_completion': user_past_completion,
        'task_type': task_type,
        'description_length': description_length,
        'comments_count': comments_count,
        'assigned_team_size': assigned_team_size,
        'user_availability': user_availability,
        'no_curr_assigned_tasks': no_curr_assigned_tasks,
        'tasks_completed': tasks_completed,
        'avg_completion_time': avg_completion_time
    })

    features_to_scale = [
        'priority', 'deadline_days', 'user_past_completion', 'user_availability',
        'no_curr_assigned_tasks', 'avg_completion_time', 'description_length'
    ]

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(df[features_to_scale])
    scaled_df = pd.DataFrame(scaled_features, columns=features_to_scale)

    completion_propensity = (
            scaled_df['priority'] * 0.2 +
            scaled_df['deadline_days'] * 0.05 +
            scaled_df['user_past_completion'] * 0.4 +
            scaled_df['user_availability'] * 0.1 +
            scaled_df['no_curr_assigned_tasks'] * -0.05 +
            scaled_df['avg_completion_time'] * -0.2 +
            scaled_df['description_length'] * -0.001 +
            np.random.randn(len(df)) * 0.5
    )

    probability_of_completion = 1 / (1 + np.exp(-(completion_propensity - np.mean(completion_propensity)) / np.std(
        completion_propensity)))  # Center and scale propensity
    threshold = 0.35
    print(completion_propensity.to_string())
    # print(probability_of_completion.to_string())
    # plt.hist(probability_of_completion)
    # plt.show()
    df['completed_on_time'] = (probability_of_completion > threshold).astype(int)

    print(f"Class balance (Completed on Time / Total): {df['completed_on_time'].mean():.4f}")
    return df

data_set = generate_synthetic_data(5000)
data_set.to_csv("synth_data_set.csv", index=False)