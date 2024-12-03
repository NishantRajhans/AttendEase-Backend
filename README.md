# **AttendEase-Backend**

## **Overview**
The AttendEase-Backend is an API-driven backend service for managing attendance records efficiently. It includes separate roles for **Admin**, **Teachers**, and **Students**, each with specific endpoints and functionalities.

---

## **Key Features**
- **Role-based Functionality**:
  - Admins: Manage students, teachers, subjects, and grades.
  - Teachers: Record and manage attendance.
  - Students: Access grade and attendance information.
- **Authentication Middleware**:
  - Ensures secure access based on user roles.
- **API Endpoints**:
  - Separate endpoints for Admin, Teacher, and Student functionalities.

---

## **Project Structure**

### **Entry Point**
`index.js` initializes the server, connects to the database, and sets up routing.  
- Uses `dotenv` for environment variables.
- Configures middleware like `CORS` and `JSON` parsing.
- Routes:
  - `/api/v1/Admin`
  - `/api/v1/Teacher`
  - `/api/v1/Student`

### **Admin Functionality**
- **File**: `routes/Admin.js`
- **Endpoints**:
  - Authentication: `POST /SignIn`
  - Manage Users:
    - Add: `POST /AddStudent`, `/AddTeacher`, `/AddSubject`
    - Edit: `PUT /EditStudent/:id`, `/EditTeacher/:id`, `/EditSubject/:id`
    - Delete: `DELETE /DeleteStudent/:id`, `/DeleteTeacher/:id`, `/DeleteSubject`
  - Fetch Data:
    - Students: `GET /GetAllStudent`
    - Teachers: `GET /GetAllTeacher`
    - Subjects: `GET /GetAllSubject`
    - Grades: `GET /GetAllGrade`
- **Middleware**:
  - `AuthMiddleware` for securing admin actions.

### **Teacher Functionality**
- **File**: `routes/Teacher.js`
- **Endpoints**:
  - Authentication: `POST /SignIn`
  - Attendance Management:
    - Add/Edit: `PUT /PutAttendance`
    - Remove: `DELETE /RemoveAttendance`
    - Fetch: `GET /FetchAttendance`, `/FetchTotalPresent`
  - Subject Management: `GET /FetchSubject`
- **Middleware**:
  - `AuthMiddleware` for securing teacher-specific actions.

### **Student Functionality**
- **File**: `routes/Student.js`
- **Endpoints**:
  - Authentication: `GET /SignIn`
  - Grade and Attendance Information:
    - Fetch Grades: `GET /GetGradeSubject`
    - Attendance: `GET /GetGradeSubjectAttedance`, `/GetAllGradeSubjectAttedance`
- **Middleware**:
  - `AuthMiddleware` for securing student-specific data access.

---

## **Installation**

### 1. Clone the repository:
```bash
git clone https://github.com/NishantRajhans/AttendEase-Backend.git
```
### 2. Install dependencies:
```bash
npm install
```
### 3. Configure environment variables in a .env file.
Create a .env file in the root directory and add the following:
```bash
PORT=your_port_number
DATABASE_HOST=your_database_host
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```
### 4. Start the server:
```bash
npm start
```
