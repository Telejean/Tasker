import pandas as pd
import numpy as np
from scipy.stats import truncnorm, gamma

# More diverse task types beyond IT
TASK_TYPES = ['planning', 'design', 'development', 'testing', 'marketing',
              'documentation', 'research', 'event', 'administrative',
              'budgeting', 'outreach', 'training', 'procurement']


def generate_synthetic_data(n_samples=5000):
    # Task properties
    duration = np.clip(np.random.lognormal(mean=1.8, sigma=0.5, size=n_samples), 1, 30)
    priority = np.random.choice([1, 2, 3], n_samples, p=[0.5, 0.3, 0.2])
    subtasks = np.clip(np.random.negative_binomial(n=2, p=0.4, size=n_samples), 0, 8)

    # Time-related properties (more realistic correlation)
    created_to_deadline = np.clip(np.random.gamma(shape=3, scale=4, size=n_samples), 5, 60)
    days_passed = np.random.uniform(0.1, 0.8) * created_to_deadline
    deadline_days = np.round(created_to_deadline - days_passed).astype(int)

    # User properties
    user_past_completion = np.clip(np.random.beta(a=7, b=3, size=n_samples), 0.3, 1.0)
    user_availability = np.clip(np.random.normal(loc=65, scale=20, size=n_samples), 10, 100)
    no_curr_assigned_tasks = np.clip(np.random.poisson(lam=4, size=n_samples), 1, 15)
    tasks_completed = np.clip(np.random.lognormal(mean=3, sigma=0.7, size=n_samples), 5, 200).astype(int)
    overdue_tasks = np.clip(np.random.poisson(lam=np.sqrt(tasks_completed) * 0.7, size=n_samples), 0, 30)
    avg_completion_time = np.clip(np.random.beta(a=2, b=5, size=n_samples) * 0.9 + 0.1, 0.1, 1.0)

    # Task metadata
    task_type = np.random.choice(TASK_TYPES, n_samples, p=[0.1, 0.08, 0.15, 0.07, 0.12,
                                                           0.09, 0.08, 0.05, 0.1, 0.04,
                                                           0.03, 0.06, 0.03])
    description_length = np.clip(gamma.rvs(a=2.5, scale=35, size=n_samples), 20, 500).astype(int)
    comments_count = np.clip(np.random.negative_binomial(n=2, p=0.3, size=n_samples), 0, 25)

    # Team size (project team, not task assignees)
    assigned_team_size = np.random.choice([1, 3, 5, 7], n_samples, p=[0.2, 0.5, 0.2, 0.1])

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

    df['completion_probability'] = calculate_completion_probability(df)

    # Generate outcomes with realistic noise
    df['completed_on_time'] = np.where(
        np.random.rand(n_samples) < df['completion_probability'], 1, 0
    )

    # Balance classes (60% on-time, 40% late)
    on_time_ratio = df['completed_on_time'].mean()
    if on_time_ratio > 0.7:
        n_to_flip = int(len(df) * (on_time_ratio - 0.6))
        flip_indices = np.random.choice(
            df[df['completed_on_time'] == 1].index,
            size=n_to_flip,
            replace=False
        )
        df.loc[flip_indices, 'completed_on_time'] = 0

    print(f"Final completion rate: {df['completed_on_time'].mean():.2f}")
    return df


def calculate_completion_probability(df):
    # More realistic feature interactions
    time_pressure = np.where(
        df['deadline_days'] < df['duration'],
        np.clip(1.5 - (df['duration'] / df['deadline_days']), 0.1, 2.0),
        1.0
    )

    workload_factor = df['no_curr_assigned_tasks'] / df['user_availability']

    # Base propensity with stronger signals
    propensity = (
            0.2 * (3 - df['priority']) +  # Higher priority = higher chance
            0.4 * df['user_past_completion'] +
            0.3 * np.log1p(df['tasks_completed']) -
            0.5 * workload_factor -
            0.6 * (1 - df['avg_completion_time']) -
            0.4 * time_pressure +
            0.1 * np.where(df['assigned_team_size'] > 1, 0.5, 0)
    )

    # Convert to probability with realistic distribution
    probability = 1 / (1 + np.exp(-propensity))

    # Ensure reasonable completion rates (60-80%)
    return np.clip(probability, 0.2, 0.9)


# Generate and save dataset
dataset = generate_synthetic_data(10000)
dataset.to_csv("refined_synthetic_data.csv", index=False)