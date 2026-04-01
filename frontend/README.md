## TeamTime Frontend Project

Description:
This is the frontend implementation of TeamTime, an employee management system. It includes dashboards and features for both Admin and Employee roles. The frontend is built using Next.js, React, TailwindCSS, and React Icons. This README explains the project structure, the purpose of each file, and instructions for running the project.

## 📂 Project Structure
app/
├─ admin/
│  ├─ layout.jsx            // Admin left sidebar layout
│  ├─ dashboard/page.jsx    // Admin dashboard page
│  ├─ employees/page.jsx    // Admin: Employees table
│  ├─ departments/page.jsx  // Admin: Departments view
│  ├─ attendance/page.jsx   // Admin: Attendance overview (filter by employee/date)
│  ├─ leaverequests/page.jsx// Admin: Leave requests table
│  └─ reports/page.jsx      // Admin: Reports view
├─ employee/
│  ├─ layout.jsx            // Employee left sidebar layout
│  ├─ dashboard/page.jsx    // Employee dashboard with Time In / Time Out buttons
│  ├─ attendance/page.jsx   // Employee: View personal attendance history
│  └─ leaves/page.jsx       // Employee: Apply for leave
├─ login/page.jsx            // Login page for both Admin and Employee
├─ signup/page.jsx           // Signup page for new Employee
├─ globals.css               // Global CSS (Tailwind and base styles)
└─ layout.jsx                // Main layout wrapper if needed

## 📝 File Explanation
## Admin Folder

layout.jsx:
Provides a responsive left sidebar for Admin with menu items for Dashboard, Employees, Departments, Attendance, Leave Requests, and Reports. Collapsible menu using hamburger icon.

dashboard/page.jsx:
Shows admin statistics like total employees, pending leave approvals, total hours, and leaves left. Uses placeholder/tentative data.

employees/page.jsx:
Displays a table of employees with ID, Name, Email, Password, Department, and Actions (Edit/Delete buttons). Uses temporary data.

departments/page.jsx:
Displays departments in cards with department name, short description, and a “View” button. Designed for future expansion.

attendance/page.jsx:
Displays attendance data of employees. Allows filtering by employee or date range (currently with tentative data).

leaverequests/page.jsx:
Displays leave requests table with Employee Name, Days, and Status.

reports/page.jsx:
Placeholder page for admin reports like attendance summary, leaves summary, and hours worked. Currently uses tentative data.

## Employee Folder

layout.jsx:
Provides a responsive left sidebar for Employee with Dashboard, Attendance, and Leaves menu items. Collapsible menu using hamburger icon.

dashboard/page.jsx:
Employee dashboard with:

Time In button → records current time in.

Time Out button → records current time out.

Attendance summary and tentative history table with hours calculation.

attendance/page.jsx:
Employee can view personal attendance history with Time In, Time Out, Hours, and Date columns. Data is temporary.

leaves/page.jsx:
Employee can apply for leave with start date, end date, reason, and submission button. Shows confirmation message.

Login and Signup Pages

login/page.jsx:
Allows users to login. Uses role-based redirection:

Email admin@ex.com → redirected to Admin dashboard.

Any other email → redirected to Employee dashboard.

signup/page.jsx:
Employee registration page (tentative, frontend only).

## 🚀 How to Run the Project

Clone the repository.

Delete node_modules folder if present.

Install dependencies:

npm install


Run the development server:

npm run dev


Open the browser at http://localhost:3000
.

## 🔑 Login Instructions

Admin Dashboard:

Email: admin@ex.com

Password: Any value (frontend only)

Employee Dashboard:

Any other email (frontend only)

Password: Any value

Currently, backend is not integrated. Once backend is implemented, login and data will be verified through API calls.

## ⚡ Notes

All tables and statistics currently use tentative data.

After backend integration, the frontend will fetch real employee data, attendance, leaves, and reports.

Sidebar is fully responsive and collapsible using the hamburger icon.

Styling uses TailwindCSS, and icons use react-icons.

👍 Suggestions for Future Backend Integration

Create API routes for:

api/employees → GET, POST, PUT, DELETE

api/attendance → GET, POST

api/leaves → GET, POST

api/reports → GET

Replace tentative data arrays with data fetched from backend.

Use JWT or session authentication to validate Admin/Employee roles.