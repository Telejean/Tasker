import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

def generate_synthetic_data(n_samples=1000, random_state=42):
    np.random.seed(random_state)

    # --- User-related features (generated per task instance for simplicity) ---
    # User's historical completion rate (0.5-1.0, skewed high)
    user_past_completion = np.round(
        np.random.beta(a=5, b=1.5, size=n_samples) * 0.5 + 0.5, 2
    )

    # Average completion time (actual/estimated)
    # Influenced by user_past_completion: better users are closer to 1 or <1
    # Target mean for lognormal: 1.0 for UPC=1.0, up to 1.5 for UPC=0.5
    target_mean_act_div_est = 1.5 - (user_past_completion - 0.5) * 1.0
    avg_completion_time = np.round(
        np.clip(
            np.random.lognormal(
                mean=np.log(target_mean_act_div_est), sigma=0.2, size=n_samples
            ),
            0.5, # Min: 50% of estimate
            2, # Max: 2.5x estimate
        ),
        2,
    )

    # Number of tasks user has completed (experience)
    tasks_completed = np.clip(
        np.random.normal(loc=30, scale=15, size=n_samples), 0, 100
    ).astype(int)

    # Number of tasks user has completed overtime
    # Higher if user_past_completion is lower
    overdue_ratio = np.clip(
        0.02 + (1.0 - user_past_completion) ** 2 * 0.5, 0.01, 0.4
    )



    # --- Task-related features ---
    duration = np.clip(
        np.random.normal(loc=7, scale=3, size=n_samples), 1, 20
    ).astype(int)
    priority = np.random.choice([1, 2, 3], n_samples, p=[0.3, 0.5, 0.2])

    # Subtasks somewhat related to duration
    subtasks = np.clip(
        np.random.poisson(lam=duration * 0.3 + 1, size=n_samples), 0, 10
    )

    # Deadline days: related to duration + buffer
    buffer_days_factor = np.random.normal(loc=1.5, scale=0.3, size=n_samples)
    deadline_days_raw = (duration * buffer_days_factor).astype(int)
    deadline_days = np.maximum(1, np.clip(deadline_days_raw, np.round(duration * 0.8), np.round(duration * 3)))


    created_to_deadline = deadline_days + np.random.randint(0, 15, n_samples)
    task_type = np.random.choice(
        ["bug", "feature", "documentation"], n_samples, p=[0.3, 0.5, 0.2]
    )

    # Description length related to duration
    description_length = np.clip(
        np.random.normal(loc=50 + duration * 10, scale=40, size=n_samples),
        10,
        500,
    ).astype(int)

    # Comments count related to duration
    comments_count = np.clip(
        np.random.poisson(lam=1 + duration * 0.5, size=n_samples), 0, 20
    )

    # Assigned team size slightly related to duration
    assigned_team_size = np.clip(
        np.random.normal(loc=1 + duration * 0.1, scale=1, size=n_samples), 1, 5
    ).astype(int)

    # --- User's current state for this task ---
    # Number of other tasks user is currently working on
    no_curr_assigned_tasks = np.clip(
        np.random.poisson(lam=2, size=n_samples), 0, 5
    )

    # User availability in hours for this task until deadline
    user_base_daily_hours = np.random.normal(loc=6, scale=1, size=n_samples)
    availability_reduction_factor = np.clip(
        1 - (no_curr_assigned_tasks * 0.10), 0.3, 1.0 # 10% less time per other task
    )
    effective_daily_hours_for_this_task = (
        user_base_daily_hours * availability_reduction_factor
    )
    user_availability_raw = (
        effective_daily_hours_for_this_task * deadline_days
    ).astype(int)
    user_availability = np.maximum(1, user_availability_raw) # At least 1 hour total


    df = pd.DataFrame({
        "duration": duration,
        "priority": priority,
        "subtasks": subtasks,
        "deadline_days": deadline_days,
        "created_to_deadline": created_to_deadline,
        "user_past_completion": user_past_completion,
        "task_type": task_type,
        "description_length": description_length,
        "comments_count": comments_count,
        "assigned_team_size": assigned_team_size,
        "user_availability": user_availability,
        "no_curr_assigned_tasks": no_curr_assigned_tasks,
        "tasks_completed": tasks_completed,
        "avg_completion_time": avg_completion_time,
    })

    # Map task_type to numeric for propensity calculation
    df["task_type_numeric"] = df["task_type"].map(
        {"bug": 0, "feature": 1, "documentation": 2}
    )

    features_to_scale = [
        "duration", "priority", "subtasks", "deadline_days",
        "created_to_deadline", "user_past_completion", "task_type_numeric",
        "description_length", "comments_count", "assigned_team_size",
        "user_availability", "no_curr_assigned_tasks", "tasks_completed",
         "avg_completion_time",
    ]

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(df[features_to_scale])
    scaled_df = pd.DataFrame(scaled_features, columns=features_to_scale, index=df.index)


    weights = {
        "duration": -0.15,
        "priority": 0.05,
        "subtasks": -0.10,
        "deadline_days": 0.15,
        "created_to_deadline": 0.03,
        "user_past_completion": 0.30,
        "task_type_numeric": 0.05,
        "description_length": -0.02,
        "comments_count": 0.02,
        "assigned_team_size": 0.03,
        "user_availability": 0.20,
        "no_curr_assigned_tasks": -0.10,
        "tasks_completed": 0.10,
        "avg_completion_time": -0.20,
    }

    completion_propensity = pd.Series(np.zeros(len(df)), index=df.index)
    for feature, weight in weights.items():
        if feature in scaled_df.columns:
            completion_propensity += scaled_df[feature] * weight
        else:
            print(f"Warning: Feature {feature} not found in scaled_df for propensity calculation.")


    completion_propensity += np.random.normal(0, 0.3, len(df))


    propensity_mean = np.mean(completion_propensity)
    propensity_std = np.std(completion_propensity)
    if propensity_std == 0:
        propensity_std = 1

    probability_of_completion = 1 / (
        1 + np.exp(-(completion_propensity - propensity_mean) / propensity_std)
    )

    threshold = 0.5
    df["completed_on_time"] = (probability_of_completion > threshold).astype(int)

    # print(completion_propensity.describe())
    # print(probability_of_completion.describe())
    # plt.hist(probability_of_completion, bins=50)
    # plt.title("Distribution of Probability of Completion")
    # plt.show()

    print(
        f"Class balance (Completed on Time / Total): {df['completed_on_time'].mean():.4f}"
    )
    return df


data_set = generate_synthetic_data(n_samples=10000, random_state=42)
data_set.to_csv("synth_data_set_v2.csv", index=False)
print("\nFirst 5 rows of the generated dataset:")
print(data_set.head())
print("\nInfo about the generated dataset:")
data_set.info()
