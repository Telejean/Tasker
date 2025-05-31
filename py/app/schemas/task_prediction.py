from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskPredictionInput(BaseModel):
    task_type: str = Field(..., description="Type of task (e.g., 'bug', 'feature', 'documentation')")
    priority: str = Field(..., description="Task priority as string: 'LOW', 'MEDIUM', 'HIGH'")
    duration: int = Field(..., description="Estimated time to complete the task (in hours/days)")
    subtasks: int = Field(..., description="Number of subtasks")
    deadline: datetime = Field(..., description="Task deadline")
    created_at: datetime = Field(..., description="Task creation time")
    description_length: int = Field(..., description="Number of words/characters in the task description")
    comments_count: int = Field(..., description="Number of comments on the task")
    assigned_team_size: int = Field(..., description="Number of people assigned to the task")
    user_availability: int = Field(..., description="Number of work hours user has until deadline")
    no_curr_assigned_tasks: int = Field(..., description="How many tasks is the user currently working on")
    tasks_completed: int = Field(..., description="How many tasks the user has completed")
    user_past_completion: float = Field(..., description="is the fraction of tasks that a user has completed on time out of all the tasks they have been assigned in the past.")
    avg_completion_time: float = Field(..., description="Average time the user completed a task in respect to deadline (avg(completion_time/duration))")
    created_to_deadline: Optional[int] = Field(None, description="Days between task creation and deadline (can be calculated in backend)")
    deadline_days: Optional[int] = Field(None, description="Days left until deadline (can be calculated in backend)")

    class Config:
        from_attributes = True

class TaskPredictionOutput(BaseModel):
    task_id: int
    completion_probability: float = Field(..., description="Probability of completion on time (0 to 1)")
    risk_indicator: str = Field(..., description="Risk indicator based on probability (e.g., 'LOW', 'MEDIUM', 'HIGH')")
