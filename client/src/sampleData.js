const tasks = [
  {
    id: 0,
    projectName: "E-Commerce Platform",
    name: "Develop login feature",
    deadline: "2025-03-01",
    description: "Implement user authentication with email and password.",
    assignedPeople: ["Alice", "Bob"],
  },
  {
    id: 1,
    projectName: "E-Commerce Platform",
    name: "Design dashboard UI",
    deadline: "2025-03-05",
    description: "Create a user-friendly interface for the dashboard.",
    assignedPeople: ["Charlie", "Dave"],
  },
  {
    id: 2,
    projectName: "E-Commerce Platform",
    name: "Database schema setup",
    deadline: "2025-02-28",
    description: "Define tables and relationships for the database.",
    assignedPeople: ["Eve"],
  },
  {
    projectName: "Mobile Banking App",
    id: 3,
    name: "API development for tasks",
    deadline: "2025-03-10",
    description: "Build REST APIs to manage tasks in the system.",
    assignedPeople: ["Frank", "Grace"],
  },
  {
    projectName: "E-Commerce Platform",
    id: 4,
    name: "User registration feature",
    deadline: "2025-03-03",
    description: "Develop a registration system with email verification.",
    assignedPeople: ["Hank"],
  },
  {
    projectName: "AI-Based Task Management System",
    id: 5,
    name: "Implement task assignment",
    deadline: "2025-03-07",
    description: "Allow team leads to assign tasks to members.",
    assignedPeople: ["Ivy", "Jack"],
  },
  {
    projectName: "E-Commerce Platform",
    id: 6,
    name: "Optimize database queries",
    deadline: "2025-03-15",
    description: "Improve query performance for faster data retrieval.",
    assignedPeople: ["Kevin"],
  },
  {
    projectName: "E-Commerce Platform",
    id: 7,
    name: "Write unit tests",
    deadline: "2025-03-12",
    description: "Ensure core functionalities work as expected.",
    assignedPeople: ["Laura", "Mike"],
  },
  {
    projectName: "Mobile Banking App",
    id: 8,
    name: "Deploy application",
    deadline: "2025-03-20",
    description: "Deploy the system to a cloud environment.",
    assignedPeople: ["Nancy"],
  },
  // {
  //   projectName: "AI-Based Task Management System",
  //   id: 9,
  //   name: "AI-based task estimation",
  //   deadline: "2025-03-25",
  //   description: "Implement an AI model to estimate task difficulty.",
  //   assignedPeople: ["Oscar", "Paul"],
  // },
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
