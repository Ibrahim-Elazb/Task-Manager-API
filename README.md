# Task Manager API

## Project Description
The project is API For Task Managment for Teams/Departments

## Installation Instructions
1. Clone the repository.
2. Change to the project directory.
3. Install the dependencies by running `npm install`.
4. Set up the environment variables:
   - Create a `.env` file in the server directory.
   - Specify the required environment variables (e.g., database connection details, Token keys, etc.).
5. Start the server by running `node index.js`.

## Usage Guide
- You Can Access API using client Application like postman with URL http://127.0.0.1:3000/<Path>

## Technologies Used
- HTML
- CSS
- Express Framework
- MongoDB

## Project Structure
- `/config` : Project Configuration Like Database Configuration.
- `/middleware`: Contains authentication and validation middleware.
- `/models`: Models of System Entities Like User, Department, Task, and Comment.
- `/public`: Contains static files (uploaded images and files of the tasks).
- `/services`: Contains Multer (node.js middleware for handling multipart/form-data, primarily used for file uploads) and SendEmail for sending emails if needed.
- `/utils`: Contains utility functions for date formatting, deleting files, error handling, and custom HTTP errors.
- `/modules`: Contains index.router which aggregate the whole main system routing API points and  System modules (Auth Module, User Module, Department Module, Task Module, and Comment Module)and each module contains Its own Routing Points, Validation Schema for each point, DAO(Data Access Object) to handle Database CRUD operations, and controllers   Middelware Functions.




## Database Configuration
Create a PostgreSQL database for the project.
Update the database configuration in the `.env` file in the server directory with the following variables:
DB_URL=your_database_url
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

## Database Structure
- `User` Collection: Contains the following fields:
	- firstName
	- lastName
	- emailAddress
	- phone
	- password
    - role: ['user', 'manager', 'admin']
    - department
    - image
    - confirmEmail: For Email Confirmation
    - resetPasswordCode: Used in Forget Password
- `Department` Collection: Contains The Field "name"
  
- `Task` Collection: Contains the following fields:
  - title 
  - description
  - dueDate:deadline of the task
  - priority: periority of the task with values ['high', 'medium', 'low']
  - waitingForTasks: An array of task IDs that are waiting for the completion of this Task
  - waitingTasks: An array of task IDs that this Task is waiting for before it can be executed or completed.
  - status: status is 'To Do' when the waitingTasks has uncompleted tasks & 'In Progress' when all tasks in its "waitingTasks" are "Completed" with values ['To Do', 'In Progress', 'Completed'],
  - comments: comments to the task
  - files: An array of files of task
  - parentTask: parent task which is complete when all its subtasks are in status "Completed"
  - subtasks: tasks which are the build of this task
  - assignedUsers: users who this task is assigned to
  - createdBy: the user who created the task
  - labels: labels help in searching for this task
  - createdAt: time of creation of the task

- `Comment` Collection: Contains the following fields:
  - text
  - files
  - writtenBy
  - createdAt

## API Documentation
The following API endpoints are available:

### Auth API
- POST `<URL>/api/v1/auth/login`: For Login
- GET `<URL>/api/v1/auth/confirm-email/<token>`: For Email confirm
- PATCH `<URL>/api/v1/auth/forget-password`: If user forget password.
- PATCH `<URL>/api/v1/auth/reset-password`: If user wants to change password

### Department API
- POST `<URL>/api/v1/department/new`: Add a new Department.
- PATCH `<URL>/api/v1/department/edit/<department-id>`: Edit Department.
- DELETE `<URL>/api/v1/department/delete/<department-id>`: Delete Department
- GET `<URL>/api/v1/department/<department-id>`: Get Department Information
- GET `<URL>/api/v1/department/`: Get All Departments Information

### User API
- POST `<URL>/api/v1/user/new`: Create a new user.
- PATCH `<URL>/api/v1/user/edit/<user-id>`: Edit user information.
- PUT `<URL>/api/v1/user/edit-role/<user-id>`: Change user role.
- GET `<URL>/api/v1/user/department/<department-id>`: Get all users of department.
- GET `<URL>/api/v1/user/<user-id>`: Get user details.
- GET `<URL>/api/v1/user/`: Get all users.
- DELETE `<URL>/api/v1/user/delete/<user-id>`: Delete a user.

### Task API
- POST `<URL>/api/v1/task/new`: Add a New Task.
- PATCH `<URL>/api/v1/task/edit/<task-id>`: Edit a task details.
- DELETE `<URL>/api/v1/task/delete/<task-id>`: Delete a task.
- GET `<URL>/api/v1/task/search`: Search Tasks.
- GET `<URL>/api/v1/task/<task-id>`: Get Task By ID.
- GET `<URL>/api/v1/task/`: Get all tasks.

### Comment API
- POST `<URL>/api/v1/comment/new/<task-id>`: Add a new comment to task.
- DELETE `<URL>/api/v1/comment/delete/<task-id>/<comment-id>`: Delete Comment.
- GET `<URL>/api/v1/comment/<task-id>`: Get all comments of task.


## Deployment Instructions
Set up a MongoDB database server.
Update the database configuration in the `.env` file in the server directory with the appropriate credentials for the production environment.
Install PM2 globally: `npm install -g pm2`
Start the server using PM2: `pm2 start index.js`
Access the deployed app through the appropriate URL or IP address.
