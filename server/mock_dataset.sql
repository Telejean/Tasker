-- Departments
INSERT INTO "Departments" ("departmentName", "createdAt", "updatedAt") VALUES
('Engineering', '2025-01-01 10:00:00+03', '2025-01-01 10:00:00+03'),
('Marketing', '2025-01-01 10:00:00+03', '2025-01-01 10:00:00+03'),
('Design', '2025-01-01 10:00:00+03', '2025-01-01 10:00:00+03'),
('Product Management', '2025-01-01 10:00:00+03', '2025-01-01 10:00:00+03');

-- Users (including you as a real user)
INSERT INTO "Users" (name, surname, email, "phoneNumber", , bio, "isAdmin", tags, workload, "performanceStats", skills, availability, "createdAt", "updatedAt", "departmentId") VALUES
('Vișan', 'Rareș', 'raresvisanandrei@gmail.com', '0724127365', 'ceva', true, '["student", "developer", "team-lead"]', 0.7, '{"tasksCompleted": 45, "averageRating": 4.8, "onTimeDelivery": 0.92}', '["JavaScript", "Python", "React", "Node.js"]', '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00"}', '2025-01-01 10:00:00+03', '2025-06-08 15:11:28+03', 1),
('John', 'Smith', 'john.smith@company.com', '0721234567', 'Senior Frontend Developer with 5+ years experience', false, '["frontend", "react", "senior"]', 0.8, '{"tasksCompleted": 120, "averageRating": 4.6, "onTimeDelivery": 0.88}', '["React", "TypeScript", "CSS", "HTML"]', '{"monday": "08:00-16:00", "tuesday": "08:00-16:00", "wednesday": "08:00-16:00", "thursday": "08:00-16:00", "friday": "08:00-16:00"}', '2025-01-15 09:00:00+03', '2025-06-01 10:00:00+03', 1),
('Maria', 'Garcia', 'maria.garcia@company.com', '0722345678', 'Backend specialist focusing on scalable architectures', false, '["backend", "python", "databases"]', 0.75, '{"tasksCompleted": 98, "averageRating": 4.7, "onTimeDelivery": 0.91}', '["Python", "Django", "PostgreSQL", "Redis"]', '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00"}', '2025-01-20 11:00:00+03', '2025-06-02 14:30:00+03', 1),
('Sarah', 'Johnson', 'sarah.johnson@company.com', '0723456789', 'Digital marketing strategist with focus on growth', false, '["marketing", "strategy", "analytics"]', 0.6, '{"tasksCompleted": 67, "averageRating": 4.5, "onTimeDelivery": 0.85}', '["Google Analytics", "SEO", "Content Marketing", "Social Media"]', '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00"}', '2025-02-01 12:00:00+03', '2025-06-03 16:45:00+03', 2),
('Alex', 'Chen', 'alex.chen@company.com', '0724567890', 'UX/UI Designer passionate about user-centered design', false, '["design", "ux", "ui", "prototyping"]', 0.65, '{"tasksCompleted": 54, "averageRating": 4.9, "onTimeDelivery": 0.93}', '["Figma", "Adobe Creative Suite", "Prototyping", "User Research"]', '{"monday": "09:30-17:30", "tuesday": "09:30-17:30", "wednesday": "09:30-17:30", "thursday": "09:30-17:30", "friday": "09:30-17:30"}', '2025-02-10 13:30:00+03', '2025-06-04 11:20:00+03', 3),
('David', 'Wilson', 'david.wilson@company.com', '0725678901', 'Product Manager with strong technical background', false, '["product", "management", "strategy"]', 0.85, '{"tasksCompleted": 89, "averageRating": 4.4, "onTimeDelivery": 0.87}', '["Product Strategy", "Agile", "Data Analysis", "Stakeholder Management"]', '{"monday": "08:30-16:30", "tuesday": "08:30-16:30", "wednesday": "08:30-16:30", "thursday": "08:30-16:30", "friday": "08:30-16:30"}', '2025-02-15 14:00:00+03', '2025-06-05 09:15:00+03', 4);

-- Projects
INSERT INTO "Projects" (name, "iconId", icon, description, status, "managerId", "startDate", "endDate", "createdAt", "updatedAt") VALUES
('E-commerce Platform Redesign', 1, '🛒', 'Complete redesign of the company e-commerce platform with modern UI/UX', 'ACTIVE', 1, '2025-03-01 09:00:00+03', '2025-08-31 17:00:00+03', '2025-02-20 10:00:00+03', '2025-06-01 14:30:00+03'),
('Mobile App Development', 2, '📱', 'Native mobile application for iOS and Android platforms', 'ACTIVE', 6, '2025-04-01 09:00:00+03', '2025-10-31 17:00:00+03', '2025-03-15 11:00:00+03', '2025-06-02 16:45:00+03'),
('Marketing Campaign Q3', 3, '📢', 'Comprehensive marketing campaign for Q3 product launch', 'ACTIVE', 4, '2025-06-01 09:00:00+03', '2025-09-30 17:00:00+03', '2025-05-15 12:00:00+03', '2025-06-03 10:20:00+03'),
('Database Migration', 4, '🗄️', 'Migration from legacy database system to modern cloud solution', 'ACTIVE', 3, '2025-05-01 09:00:00+03', '2025-07-31 17:00:00+03', '2025-04-20 13:30:00+03', '2025-06-04 15:10:00+03');

-- Tasks
INSERT INTO "Tasks" (name, description, priority, deadline, status, "creatorId", "projectId", tags, "completedAt", "estimatedDuration", "actualDuration", "completionConfidence", difficulty, type, "createdAt", "updatedAt") VALUES
('Design System Setup', 'Create comprehensive design system with components and guidelines', 'HIGH', '2025-07-15 17:00:00+03', 'IN_PROGRESS', 1, 1, '["design", "frontend", "components"]', NULL, 40.0, NULL, 0.8, 3.5, 'DEVELOPMENT', '2025-03-01 10:00:00+03', '2025-06-07 14:20:00+03'),
('User Authentication Module', 'Implement secure user authentication with JWT tokens', 'HIGH', '2025-07-01 17:00:00+03', 'NOT_STARTED', 1, 1, '["backend", "security", "authentication"]', NULL, 32.0, NULL, 0.9, 4.0, 'DEVELOPMENT', '2025-03-05 11:30:00+03', '2025-06-06 16:45:00+03'),
('Payment Gateway Integration', 'Integrate Stripe payment gateway for secure transactions', 'MEDIUM', '2025-08-01 17:00:00+03', 'NOT_STARTED', 3, 1, '["backend", "payments", "integration"]', NULL, 24.0, NULL, 0.7, 3.8, 'DEVELOPMENT', '2025-03-10 09:15:00+03', '2025-06-05 12:30:00+03'),
('iOS App Core Features', 'Develop core features for iOS application', 'HIGH', '2025-08-15 17:00:00+03', 'IN_PROGRESS', 6, 2, '["mobile", "ios", "development"]', NULL, 80.0, NULL, 0.75, 4.2, 'DEVELOPMENT', '2025-04-01 10:00:00+03', '2025-06-08 11:15:00+03'),
('Android App Core Features', 'Develop core features for Android application', 'HIGH', '2025-08-15 17:00:00+03', 'NOT_STARTED', 6, 2, '["mobile", "android", "development"]', NULL, 80.0, NULL, 0.75, 4.2, 'DEVELOPMENT', '2025-04-01 10:30:00+03', '2025-06-07 15:45:00+03'),
('Social Media Campaign', 'Create and execute social media campaign across platforms', 'MEDIUM', '2025-07-31 17:00:00+03', 'IN_PROGRESS', 4, 3, '["marketing", "social-media", "campaign"]', NULL, 30.0, NULL, 0.85, 2.5, 'MARKETING', '2025-06-01 12:00:00+03', '2025-06-08 10:30:00+03'),
('Content Creation', 'Develop marketing content including blogs, videos, and graphics', 'MEDIUM', '2025-08-15 17:00:00+03', 'NOT_STARTED', 4, 3, '["marketing", "content", "creative"]', NULL, 45.0, NULL, 0.8, 3.0, 'MARKETING', '2025-06-05 14:20:00+03', '2025-06-08 13:45:00+03'),
('Database Schema Design', 'Design new database schema for cloud migration', 'HIGH', '2025-06-30 17:00:00+03', 'COMPLETED', 3, 4, '["database", "schema", "migration"]', '2025-06-01 16:30:00+03', 20.0, 18.5, 1.0, 3.7, 'DEVELOPMENT', '2025-05-01 09:00:00+03', '2025-06-01 16:30:00+03'),
('Data Migration Scripts', 'Write scripts to migrate data from legacy system', 'HIGH', '2025-07-15 17:00:00+03', 'IN_PROGRESS', 3, 4, '["database", "migration", "scripts"]', NULL, 35.0, NULL, 0.9, 4.1, 'DEVELOPMENT', '2025-05-10 11:00:00+03', '2025-06-08 14:15:00+03');

-- AssignedPeople
INSERT INTO "AssignedPeople" ("taskId", "userId", "createdAt", "updatedAt") VALUES
(1, 5, '2025-03-01 10:00:00+03', '2025-03-01 10:00:00+03'),
(1, 2, '2025-03-01 10:00:00+03', '2025-03-01 10:00:00+03'),
(2, 1, '2025-03-05 11:30:00+03', '2025-03-05 11:30:00+03'),
(2, 3, '2025-03-05 11:30:00+03', '2025-03-05 11:30:00+03'),
(3, 3, '2025-03-10 09:15:00+03', '2025-03-10 09:15:00+03'),
(4, 2, '2025-04-01 10:00:00+03', '2025-04-01 10:00:00+03'),
(5, 2, '2025-04-01 10:30:00+03', '2025-04-01 10:30:00+03'),
(6, 4, '2025-06-01 12:00:00+03', '2025-06-01 12:00:00+03'),
(7, 4, '2025-06-05 14:20:00+03', '2025-06-05 14:20:00+03'),
(7, 5, '2025-06-05 14:20:00+03', '2025-06-05 14:20:00+03'),
(8, 3, '2025-05-01 09:00:00+03', '2025-05-01 09:00:00+03'),
(9, 3, '2025-05-10 11:00:00+03', '2025-05-10 11:00:00+03'),
(9, 1, '2025-05-10 11:00:00+03', '2025-05-10 11:00:00+03');

-- UserProjects
INSERT INTO "UserProjects" ("userId", "projectId", role, "createdAt", "updatedAt") VALUES
(1, 1, 'LEADER', '2025-02-20 10:00:00+03', '2025-02-20 10:00:00+03'),
(2, 1, 'MEMBER', '2025-02-20 10:00:00+03', '2025-02-20 10:00:00+03'),
(3, 1, 'MEMBER', '2025-02-20 10:00:00+03', '2025-02-20 10:00:00+03'),
(5, 1, 'MEMBER', '2025-02-20 10:00:00+03', '2025-02-20 10:00:00+03'),
(6, 2, 'LEADER', '2025-03-15 11:00:00+03', '2025-03-15 11:00:00+03'),
(1, 2, 'COORDINATOR', '2025-03-15 11:00:00+03', '2025-03-15 11:00:00+03'),
(2, 2, 'MEMBER', '2025-03-15 11:00:00+03', '2025-03-15 11:00:00+03'),
(4, 3, 'LEADER', '2025-05-15 12:00:00+03', '2025-05-15 12:00:00+03'),
(5, 3, 'MEMBER', '2025-05-15 12:00:00+03', '2025-05-15 12:00:00+03'),
(3, 4, 'LEADER', '2025-04-20 13:30:00+03', '2025-04-20 13:30:00+03'),
(1, 4, 'MEMBER', '2025-04-20 13:30:00+03', '2025-04-20 13:30:00+03');

-- Teams
INSERT INTO "Teams" (name, "projectId", "createdAt", "updatedAt") VALUES
('E-commerce Frontend Team', 1, '2025-02-20 10:00:00+03', '2025-02-20 10:00:00+03'),
('E-commerce Backend Team', 1, '2025-02-20 10:00:00+03', '2025-02-20 10:00:00+03'),
('Mobile Development Team', 2, '2025-03-15 11:00:00+03', '2025-03-15 11:00:00+03'),
('Marketing Creative Team', 3, '2025-05-15 12:00:00+03', '2025-05-15 12:00:00+03'),
('Database Migration Team', 4, '2025-04-20 13:30:00+03', '2025-04-20 13:30:00+03');

-- UserTeams
INSERT INTO "UserTeams" ("userId", "teamId", "userRole", "assignedAt", "expiresAt", "createdAt", "updatedAt") VALUES
(2, 1, 'LEADER', '2025-02-20 10:00:00+03', NULL, '2025-02-20 10:00:00+03', '2025-02-20 10:00:00+03'),
(5, 1, 'MEMBER', '2025-02-20 10:00:00+03', NULL, '2025-02-20 10:00:00+03', '2025-02-20 10:00:00+03'),
(3, 2, 'LEADER', '2025-02-20 10:00:00+03', NULL, '2025-02-20 10:00:00+03', '2025-02-20 10:00:00+03'),
(1, 2, 'MEMBER', '2025-02-20 10:00:00+03', NULL, '2025-02-20 10:00:00+03', '2025-02-20 10:00:00+03'),
(2, 3, 'LEADER', '2025-03-15 11:00:00+03', NULL, '2025-03-15 11:00:00+03', '2025-03-15 11:00:00+03'),
(1, 3, 'COORDINATOR', '2025-03-15 11:00:00+03', NULL, '2025-03-15 11:00:00+03', '2025-03-15 11:00:00+03'),
(4, 4, 'LEADER', '2025-05-15 12:00:00+03', NULL, '2025-05-15 12:00:00+03', '2025-05-15 12:00:00+03'),
(5, 4, 'MEMBER', '2025-05-15 12:00:00+03', NULL, '2025-05-15 12:00:00+03', '2025-05-15 12:00:00+03'),
(3, 5, 'LEADER', '2025-04-20 13:30:00+03', NULL, '2025-04-20 13:30:00+03', '2025-04-20 13:30:00+03'),
(1, 5, 'MEMBER', '2025-04-20 13:30:00+03', NULL, '2025-04-20 13:30:00+03', '2025-04-20 13:30:00+03');