import { DateValue, parseDate } from '@internationalized/date';
import { Project, Task } from '@my-types/types';


export const sampleTasks: Task[] = [
    {
        id: 0,
        projectName: "E-Commerce Platform",
        name: "Develop login feature",
        deadline: parseDate("2025-03-01"),
        description: "Implement user authentication with email and password.",
        assignedPeople: ["Alice", "Bob"],
        status: "completed",
        priority: "high"
    },
    {
        id: 1,
        projectName: "E-Commerce Platform",
        name: "Design dashboard UI",
        deadline: parseDate("2025-03-05"),
        description: "Create a user-friendly interface for the dashboard.",
        assignedPeople: ["Charlie", "Dave"],
        status: "in-progress",
        priority: "medium"
    },
    {
        id: 2,
        projectName: "E-Commerce Platform",
        name: "Database schema setup",
        deadline: parseDate("2025-02-28"),
        description: "Define tables and relationships for the database.",
        assignedPeople: ["Eve"],
        status: "completed",
        priority: "medium"
    },
    {
        projectName: "Mobile Banking App",
        id: 3,
        name: "API development for tasks",
        deadline: parseDate("2025-03-10"),
        description: "Build REST APIs to manage tasks in the system.",
        assignedPeople: ["Frank", "Grace"],
        status: "in-progress",
        priority: "high"
    },
    {
        projectName: "E-Commerce Platform",
        id: 4,
        name: "User registration feature",
        deadline: parseDate("2025-03-03"),
        description: "Develop a registration system with email verification.",
        assignedPeople: ["Hank"],
        status: "completed",
        priority: "low"
    },
    {
        projectName: "AI-Based Task Management System",
        id: 5,
        name: "Implement task assignment",
        deadline: parseDate("2025-03-07"),
        description: "Allow team leads to assign tasks to members.",
        assignedPeople: ["Ivy", "Jack"],
        status: "not-started",
        priority: "medium"
    },
    {
        projectName: "E-Commerce Platform",
        id: 6,
        name: "Optimize database queries",
        deadline: parseDate("2025-03-15"),
        description: "Improve query performance for faster data retrieval.",
        assignedPeople: ["Kevin"],
        status: "not-started",
        priority: "low"
    },
    {
        projectName: "E-Commerce Platform",
        id: 7,
        name: "Write unit tests",
        deadline: parseDate("2025-03-12"),
        description: "Create unit tests for the existing features.",
        assignedPeople: ["Laura", "Mike"],
        status: "in-progress",
        priority: "high"
    },
    {
        projectName: "Mobile Banking App",
        id: 8,
        name: "Deploy application",
        deadline: parseDate("2025-03-20"),
        description: "Deploy the system to a cloud environment.",
        assignedPeople: ["Nancy"],
        status: "not-started",
        priority: "medium"
    },
    {
        id: 9,
        projectName: "Mobile Banking App",
        name: "Implement biometric authentication",
        deadline: parseDate("2025-03-25"),
        description: "Add fingerprint and face recognition for login.",
        assignedPeople: ["Oliver", "Patricia"],
        status: "not-started",
        priority: "low"
    },
    {
        id: 10,
        projectName: "AI-Based Task Management System",
        name: "Train recommendation model",
        deadline: parseDate("2025-03-18"),
        description: "Train ML model to suggest task priorities.",
        assignedPeople: ["Quinn", "Rachel"],
        status: "in-progress",
        priority: "high"
    },
    {
        id: 11,
        projectName: "E-Commerce Platform",
        name: "Implement payment gateway",
        deadline: parseDate("2025-03-08"),
        description: "Integrate with Stripe for payment processing.",
        assignedPeople: ["Steve"],
        status: "completed",
        priority: "medium"
    },
    {
        id: 12,
        projectName: "Company Website Redesign",
        name: "Create wireframes",
        deadline: parseDate("2025-03-02"),
        description: "Design initial wireframes for the new website.",
        assignedPeople: ["Tina", "Ursula"],
        status: "completed",
        priority: "low"
    },
    {
        id: 13,
        projectName: "AI-Based Task Management System",
        name: "Set up CI/CD pipeline",
        deadline: parseDate("2025-03-22"),
        description: "Configure continuous integration and deployment.",
        assignedPeople: ["Victor"],
        status: "not-started",
        priority: "high"
    },
    {
        id: 14,
        projectName: "Mobile Banking App",
        name: "Performance testing",
        deadline: parseDate("2025-03-17"),
        description: "description",
        assignedPeople: [],
        status: "in-progress",
        priority: "medium"
    }
]


export const projects: Project[] = [
    {
        id: 1,
        name: "AI-Based Task Management System",
        members: ["Alice", "Bob", "Charlie", "Dave"],
        manager: "Eve",
        completion: 0.6,
        iconId: 1,
        icon: "LuApple",
        status: "active"
    },
    {
        id: 2,
        name: "E-Commerce Platform",
        members: ["Frank", "Grace", "Hank", "Ivy"],
        manager: "Jack",
        completion: 1,
        iconId: 2,
        icon: "LuAmbulance",
        status: "active"

    },
    {
        id: 3,
        name: "Mobile Banking App",
        members: ["Kevin", "Laura", "Mike", "Nancy"],
        manager: "Oscar",
        completion: 0.8,
        iconId: 3,
        icon: "LuAperture",
        status: "archived"
    },
    {
        id: 4,
        name: "New Project Example",
        members: ["Alice", "Eve"],
        manager: "Bob",
        completion: 0.0,
        iconId: 4,
        icon: "LuNewProjectIcon",
        status: "active"
    }
]