const tasks = [
  {
    id: 0,
    projectName: "E-Commerce Platform",
    name: "Develop login feature",
    deadline: "2025-03-01",
    description: "Implement user authentication with email and password.",
    assignedPeople: ["Alice", "Bob"],
    status: "completed"
  },
  {
    id: 1,
    projectName: "E-Commerce Platform",
    name: "Design dashboard UI",
    deadline: "2025-03-05",
    description: "Create a user-friendly interface for the dashboard.",
    assignedPeople: ["Charlie", "Dave"],
    status: "in-progress"
  },
  {
    id: 2,
    projectName: "E-Commerce Platform",
    name: "Database schema setup",
    deadline: "2025-02-28",
    description: "Define tables and relationships for the database.",
    assignedPeople: ["Eve"],
    status: "completed"
  },
  {
    projectName: "Mobile Banking App",
    id: 3,
    name: "API development for tasks",
    deadline: "2025-03-10",
    description: "Build REST APIs to manage tasks in the system.",
    assignedPeople: ["Frank", "Grace"],
    status: "in-progress"
  },
  {
    projectName: "E-Commerce Platform",
    id: 4,
    name: "User registration feature",
    deadline: "2025-03-03",
    description: "Develop a registration system with email verification.",
    assignedPeople: ["Hank"],
    status: "completed"
  },
  {
    projectName: "AI-Based Task Management System",
    id: 5,
    name: "Implement task assignment",
    deadline: "2025-03-07",
    description: "Allow team leads to assign tasks to members.",
    assignedPeople: ["Ivy", "Jack"],
    status: "not-started"
  },
  {
    projectName: "E-Commerce Platform",
    id: 6,
    name: "Optimize database queries",
    deadline: "2025-03-15",
    description: "Improve query performance for faster data retrieval.",
    assignedPeople: ["Kevin"],
    status: "not-started"
  },
  {
    projectName: "E-Commerce Platform",
    id: 7,
    name: "Write unit tests",
    deadline: "2025-03-12",
    description: "Ensure core functionalities work as expected.",
    assignedPeople: ["Laura", "Mike"],
    status: "in-progress"
  },
  {
    projectName: "Mobile Banking App",
    id: 8,
    name: "Deploy application",
    deadline: "2025-03-20",
    description: "Deploy the system to a cloud environment.",
    assignedPeople: ["Nancy"],
    status: "not-started"
  },
  // Additional 10 examples
  {
    id: 9,
    projectName: "Mobile Banking App",
    name: "Implement biometric authentication",
    deadline: "2025-03-25",
    description: "Add fingerprint and face recognition for login.",
    assignedPeople: ["Oliver", "Patricia"],
    status: "not-started"
  },
  {
    id: 10,
    projectName: "AI-Based Task Management System",
    name: "Train recommendation model",
    deadline: "2025-03-18",
    description: "Train ML model to suggest task priorities.",
    assignedPeople: ["Quinn", "Rachel"],
    status: "in-progress"
  },
  {
    id: 11,
    projectName: "E-Commerce Platform",
    name: "Implement payment gateway",
    deadline: "2025-03-08",
    description: "Integrate with Stripe for payment processing.",
    assignedPeople: ["Steve"],
    status: "completed"
  },
  {
    id: 12,
    projectName: "Company Website Redesign",
    name: "Create wireframes",
    deadline: "2025-03-02",
    description: "Design initial wireframes for the new website.",
    assignedPeople: ["Tina", "Ursula"],
    status: "completed"
  },
  {
    id: 13,
    projectName: "AI-Based Task Management System",
    name: "Set up CI/CD pipeline",
    deadline: "2025-03-22",
    description: "Configure continuous integration and deployment.",
    assignedPeople: ["Victor"],
    status: "not-started"
  },
  {
    id: 14,
    projectName: "Mobile Banking App",
    name: "Performance testing",
    deadline: "2025-03-17",
    description: "Test app performance under heavy load.",
    assignedPeople: ["Wendy", "Xavier"],
    status: "in-progress"
  },
  {
    id: 15,
    projectName: "Company Website Redesign",
    name: "Content migration",
    deadline: "2025-03-14",
    description: "Move existing content to the new CMS.",
    assignedPeople: ["Yvonne"],
    status: "not-started"
  },
  {
    id: 16,
    projectName: "E-Commerce Platform",
    name: "Implement product search",
    deadline: "2025-03-09",
    description: "Add search functionality with filters.",
    assignedPeople: ["Zack", "Alice"],
    status: "completed"
  },
  {
    id: 17,
    projectName: "AI-Based Task Management System",
    name: "User feedback analysis",
    deadline: "2025-03-28",
    description: "Analyze user feedback to improve features.",
    assignedPeople: ["Bob", "Charlie"],
    status: "not-started"
  },
  {
    id: 18,
    projectName: "Mobile Banking App",
    name: "Security audit",
    deadline: "2025-03-30",
    description: "Conduct comprehensive security review.",
    assignedPeople: ["Dave", "Eve"],
    status: "not-started"
  }
];

const projects = [
  {
    id: 1,
    name: "AI-Based Task Management System",
    members: ["Alice", "Bob", "Charlie", "Dave"],
    manager: "Eve",
    completion: 0.6,
    iconId:1,
    icon:"LuApple"
  },
  {
    id: 2,
    name: "E-Commerce Platform",
    members: ["Frank", "Grace", "Hank", "Ivy"],
    manager: "Jack",
    completion: 1,
    iconId:2,
    icon:"LuAmbulance "
  },
  {
    id: 3,
    name: "Mobile Banking App",
    members: ["Kevin", "Laura", "Mike", "Nancy"],
    manager: "Oscar",
    completion: 0.8,
    iconId:3,
    icon:"LuAperture"
  },
];

export {tasks, projects};
