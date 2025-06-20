# **EZ2use Assessment System**

## **Table of Contents**

* [Description](#bookmark=id.xxor1vv56l4e)  
* [Features](#bookmark=id.w2e3qc7r5c65)  
* [Technology Stack](#bookmark=id.2xbdqddqqufy)  
* [Project Architecture](#bookmark=id.7jk5fzyy6s6g)  
* [Installation](#bookmark=id.bxy2y46rr0d)  
* [Usage](#bookmark=id.wh31ap9dde7f)  
* [Deployment](#bookmark=id.yfleg0vpgztu)  
* [Visual Elements](#bookmark=id.bq6y6vqfrudn)  
* [Testing](#bookmark=id.48vrp0u20n99)  
* [Contributing](#bookmark=id.9ue6x7gdpmsi)  
* [Troubleshooting](#bookmark=id.7q49mqous6c)  
* [Future Enhancements](#bookmark=id.6eol8niylwva)  
* [Getting Help and Support](#bookmark=id.dy5a2989vhlz)  
* [License](#bookmark=id.27wzbpnd6w1q)  
* [Acknowledgements](#bookmark=id.uwu7bc9622f2)

## **Description**

The **EZ2use Assessment System** is a comprehensive, full-stack platform engineered to streamline and enhance the process of creating, delivering, and managing technical assessments, primarily for **teachers and assessors**. This project was developed to provide an efficient and automated solution to traditional manual grading and feedback cycles, offering a seamless experience for those managing educational assessments.

This system addresses key challenges such as:

* **Inefficient Assessment Creation:** Providing intuitive tools for designing diverse question types.  
* **Manual Grading Overheads:** Automating the grading of specific assessment formats to free up instructor time.  
* **Centralized Management:** Offering a unified platform for tracking assessment performance and results.

As an individual project, its development has been a significant learning journey, acquiring in-depth knowledge in building scalable full-stack applications, securing APIs, managing database schemas, and implementing modern UI/UX principles.

## **Features**

* **User Role Management:** Distinct interfaces and permissions for Admin and Instructor/Assessor roles.  
* **Dynamic Assessment Creation:** Instructors/Assessors can create assessments with various question types (e.g., multiple-choice, true/false, short answer, code snippets).  
* **Automated Grading:** Support for automated grading for selected question types.  
* **Instructor/Assessor Dashboard:** View assessment results, monitor submissions, and manage the assessment lifecycle.  
* **Secure Authentication & Authorization:** Robust user login and access control using JWTs.  
* **Responsive User Interface:** Optimized for various devices, from desktop to mobile.  
* **Data Validation:** Comprehensive input validation on both frontend and backend to ensure data integrity.

## **Technology Stack**

The EZ2use Assessment System is built using a modern full-stack architecture, leveraging robust and widely adopted technologies for performance, scalability, and maintainability.

### **Frontend**

* **React.js (v18.x):** Chosen for its declarative, component-based paradigm, facilitating the creation of interactive and reusable UI components. It leverages React Hooks for efficient state management and side effects.  
* **Chakra UI (v2.x):** A highly customizable component library that provides accessible and responsive UI building blocks, ensuring a consistent design system and accelerating development speed.  
* **TypeScript (v5.x):** Utilized for static typing, enhancing code quality, improving developer tooling, and reducing runtime errors.

### **Backend**

* **Node.js (v18.x) with Express.js (v4.x)::** A fast, unopinionated, and flexible backend framework that allows for rapid development of RESTful APIs, benefiting from Node.js's non-blocking I/O model.  
* **Passport.js (v0.6.x):** Integrated for handling authentication strategies, specifically JSON Web Tokens (JWT) for secure, stateless user sessions.  
* **Joi (v17.x):** Employed for robust schema validation of incoming request payloads, ensuring data integrity and preventing common API vulnerabilities.

### **Database**

* **PostgreSQL (v14.x):** A powerful, open-source relational database system chosen for its reliability, data integrity, advanced querying capabilities, and robust support for concurrent connections. Ideal for structured assessment data, user profiles, and submission records.  
* **Sequelize (v6.x) (ORM):** An Object-Relational Mapper that simplifies interaction with the PostgreSQL database. It allows developers to work with database records using JavaScript objects, reducing the need for raw SQL queries and enabling easier schema migrations.

## **Project Architecture**

The EZ2use Assessment System follows a classic client-server architecture with a RESTful API serving as the communication layer between the frontend and backend.

* **Frontend (Client-Side):** The React application serves as the user interface, handling all client-side interactions, data presentation, and making API requests to the backend. It uses fetch or Axios for HTTP communication.  
* **Backend (Server-Side):** The Node.js/Express.js server exposes a suite of RESTful API endpoints. It is responsible for:  
  * Handling HTTP requests (GET, POST, PUT, DELETE).  
  * User authentication and authorization.  
  * Business logic execution (e.g., assessment creation, grading calculations).  
  * Interacting with the PostgreSQL database via Sequelize ORM.  
* **Database:** PostgreSQL stores all persistent data, including user information, assessment definitions, question banks, and results. The database schema is managed through Sequelize migrations.

API Contracts and Interconnections:  
The backend API adheres to REST principles, providing clear endpoints for managing resources. Key API categories include:

* /api/auth: User authentication (login, registration).  
* /api/users: User management (admin functions).  
* /api/assessments: CRUD operations for assessments.  
* /api/questions: Management of question types and content.  
* /api/submissions: Handling responses and results.  
* /api/reports: Generating analytical reports.

Future plans include integrating OpenAPI (Swagger) for comprehensive API documentation.

Data Model Reference:  
The database leverages an ORM (Sequelize) to define models that map directly to database tables. Key models include User, Assessment, Question, and Score. A detailed Entity-Relationship Diagram (ERD) can be found here.

## **Installation**

Follow these steps to set up and run the EZ2use Assessment System locally.

### **Prerequisites**

Ensure you have the following installed on your system:

* **Node.js:** v18.x or higher  
* **npm:** v9.x or higher (comes with Node.js)  
* **PostgreSQL:** v14.x or higher

### **1\. Clone the Repository**

First, clone the project repository to your local machine:

git clone https://github.com/Abraham-Na70/EZ2useAssessmentSystem.git  
cd EZ2useAssessmentSystem

### **2\. Backend Setup**

Navigate into the backend directory, install dependencies, and set up environment variables.

cd backend  
npm install

Environment Variables:  
Create a .env file in the backend directory and populate it with the following:  
PORT=5000  
DATABASE\_URL="postgresql://postgres:LeBron@localhost:5432/assessment\_system"  
JWT\_SECRET="kjsdFb78gSDFg6sd5fGHSFGjhgSFG76fsd5gSFGHSF6gfsd57GFH"

* PORT: The port on which the backend server will run.  
* DATABASE\_URL: Your PostgreSQL connection string.  
* JWT\_SECRET: A strong, random string used for signing JWTs.

### **3\. Database Setup**

Ensure your PostgreSQL server is running. Then, run database migrations to create the necessary tables:

npx sequelize db:migrate  
npx sequelize db:seed:all \# Optional: to seed initial data for development

### **4\. Frontend Setup**

Navigate into the frontend directory and install dependencies.

cd ../frontend \# Go back to the root, then into frontend  
npm install

Environment Variables:  
Create a .env file in the frontend directory and populate it with the following:  
REACT\_APP\_API\_URL="http://localhost:5000/api"

* REACT\_APP\_API\_URL: The base URL for your backend API. Adjust if your backend runs on a different port or host.

### **5\. Running the Application**

From the respective directories, start the backend and frontend servers.

**Start Backend Server:**

cd ../backend  
npm start

The backend server will typically run on http://localhost:5000.

**Start Frontend Development Server:**

cd ../frontend  
npm start

The frontend application will typically open in your browser at http://localhost:3000.

## **Usage**

The EZ2use Assessment System provides distinct functionalities for different user roles: Admin and Instructor/Assessor.

### **1\. Admin Workflow**

* **Login:** Access the system with admin credentials.  
* **User Management:** Create, update, or delete user accounts (Instructors/Assessors).  
* **System Analytics:** View high-level system usage and performance metrics.

### **2\. Instructor/Assessor Workflow**

* **Login:** Access the system with instructor/assessor credentials.  
* **Create Assessment:**  
  * Navigate to "Create Assessment".  
  * Define assessment title, description, duration, and visibility.  
  * Add various question types (e.g., Multiple Choice, True/False, Short Answer, Code Snippet).  
  * Set grading criteria for each question.  
  * (Screenshot: Assessment Creation Page)

* **Assign Assessment:** Assign created assessments to specific users or groups for completion.  
* **Review Submissions:** View submissions and detailed results. Manually grade applicable questions.  
* **View Scores:** Access scores for completed assessments.  
  * (Screenshot: Assessment Score View)

* **Generate Reports:** Access reports on assessment efficacy and user performance.

## **Deployment**

This project is currently not deployed, but it is designed to be easily containerized using Docker for future deployment.

* **Deployment Strategy (Example: Docker Compose)**  
  1. **Build Docker Images:**  
     docker-compose build

  2. **Run Containers:**  
     docker-compose up \-d

This will bring up the frontend, backend, and PostgreSQL database services. For production, consider using a reverse proxy (e.g., Nginx, Traefik) and setting up HTTPS.

## **Visual Elements**

Here are some visual representations of the EZ2use Assessment System:

![Final Dashboard Layout](init.jpeg)

![Final Dashboard Layout](asses.jpeg)

![Final Dashboard Layout](score.jpeg)

## **Testing**

The project includes automated tests to ensure reliability and functionality.

* **Frameworks Used:**  
  * **Frontend:** Jest and React Testing Library for unit and integration tests.  
  * **Backend:** Mocha and Chai for API unit and integration tests.  
  * **End-to-End (E2E):** Playwright for cross-browser E2E testing of key user workflows.  
* Running Tests:  
  To run the full test suite:  
  \# From the root directory:  
  cd frontend && npm test  
  cd ../backend && npm test  
  \# For E2E tests (from root):  
  cd frontend && npx playwright test

## **Contributing**

As an individual showcase project, direct contributions are not actively sought for this repository's main branch. However, you are welcome to fork the repository and experiment with your own enhancements or modifications.

## **Troubleshooting**

This section provides solutions to common issues you might encounter.

| Issue | Description | Potential Solution(s) |
| :---- | :---- | :---- |
| Database Connection Failed | The application fails to connect to the PostgreSQL database during startup. | 1\. Ensure PostgreSQL server is running. 2\. Verify database credentials in .env file (DB\_USER, DB\_PASSWORD, DB\_HOST, DB\_PORT). 3\. Check firewall settings allowing connection to DB port. |
| Frontend Build Error | npm run build or yarn build command fails with compilation errors. | 1\. Ensure all frontend dependencies are installed (npm install or yarn install). 2\. Check Node.js and npm/yarn versions against prerequisites. 3\. Clear node modules cache (npm cache clean \--force, delete node\_modules, reinstall). |
| API Endpoint Not Found (404) | Requests to backend API endpoints result in a 404 Not Found error. | 1\. Verify backend server is running. 2\. Check API base URL configuration in frontend (e.g., REACT\_APP\_API\_URL in .env). 3\. Ensure backend routes are correctly defined and exposed. |
| Authentication Token Invalid | Users are unable to log in or access protected routes due to invalid tokens. | 1\. Check JWT secret key consistency between backend .env and authentication module. 2\. Verify system clock synchronization on server. 3\. Ensure correct token format and expiration handling. |
| Slow Assessment Loading | Assessments with many questions or complex media load slowly. | 1\. Optimize database queries for question retrieval. 2\. Implement pagination or lazy loading for large assessments. 3\. Compress images/media assets. |
| Missing Seed Data | After database setup, no initial users or assessments appear. | 1\. Ensure you ran npx sequelize db:seed:all after migrations. 2\. Check seeders files for errors. |

## **Future Enhancements**

I have several exciting features planned for the EZ2use Assessment System:

* **Advanced Question Types:** Support for more complex question types, including drag-and-drop, matching, and diagram-based questions.  
* **External LTI Integration:** Integrate with Learning Management Systems (LMS) like Canvas or Moodle.  
* **Performance Monitoring:** Implement robust logging and monitoring for performance bottlenecks.  
* **Rich Text Editor for Questions:** Allow instructors to format questions with images, videos, and complex mathematical equations.  
* **Collaborative Assessment Creation:** Enable multiple instructors to work on the same assessment simultaneously.  
* **Detailed Analytics Dashboard:** Provide more in-depth insights into performance, question efficacy, and assessment trends.

## **Getting Help and Support**

If you encounter any issues, have questions, or would like to suggest new features, please use the following channels:

* **GitHub Issues:** [Open an issue on GitHub](https://github.com/Abraham-Na70/EZ2useAssessmentSystem/issues)  
* **Email:** [abrahamnapi5@gmail.com](mailto:abrahamnapi5@gmail.com)

## **License**

This project is licensed under the MIT License. See the [LICENSE](http://docs.google.com/LICENSE) file for details.

## **Acknowledgements**

* **Abraham Na70:** Sole Developer and Maintainer of this project.  
* **React.js, Node.js, Express.js, PostgreSQL, Chakra UI, Jest, Mocha, Playwright:** Core technologies that made this project possible.  
* [**shields.io**](https://shields.io/)**:** For providing project badges.  
* **Online tutorials and documentation (e.g., MDN Web Docs, freeCodeCamp, Udemy courses):** For invaluable learning resources.
