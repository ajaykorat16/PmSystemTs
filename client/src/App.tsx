import AdminRoutes from './components/Routes/AdminRoutes';
import DefaultLayout from './page/DefaultLayout';
import DepartmentCreate from './page/admin/DepartmentCreate';
import DepartmentList from './page/admin/DepartmentList';
import DepartmentUpdate from './page/admin/DepartmentUpdate';
import LeaveCreate from './page/LeaveCreate';
import LeaveList from './page/LeaveList';
import LeaveUpdate from './page/LeaveUpdate';
import Login from './page/Login';
import UserCreate from './page/admin/UserCreate';
import UserList from './page/UserList';
import UserUpdate from './page/admin/UserUpdate';
import UserProfile from './page/user/UserProfile'
import AdminProfile from './page/admin/AdminProfile';
import './scss/style.scss';
import { Routes, Route } from 'react-router-dom';
import UserRoutes from './components/Routes/UserRoutes';
import ResetPassword from './page/ResetPassword';
import "primereact/resources/themes/rhea/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import ManageMonthlyLeave from './page/admin/ManageMonthlyLeaveList';
import EmployeeByBirthMonth from './page/EmployeeByBirthMonth';
import ProjectCreate from './page/admin/ProjectCreate';
import ProjectList from './page/ProjectList';
import ProjectUpdate from './page/admin/ProjectUpdate';
import WorkLogCreate from './page/user/WorkLogCreate';
import UserWorkLogList from './page/user/UserWorkLogList';
import AdminWorkLogList from './page/admin/AdminWorkLogList';
import WorkLogUpdate from './page/user/WorkLogUpdate';
import CredentialCreate from './page/CredentialCreate';
import CredentialList from './page/CredentialList';
import CredentialUpdate from './page/CredentialUpdate';
import CredentialView from './page/CredentialView';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AdminRoutes />}>
          <Route path="admin" element={<DefaultLayout />} />
          <Route path="user/list" element={<UserList title="User List" />} />
          <Route path="user/create" element={<UserCreate title="User Create" />} />
          <Route path="user/update/:id" element={<UserUpdate title="User Update" />} />
          <Route path="user/birthday/list" element={<EmployeeByBirthMonth title="Employee By Birth Month" />} />
          <Route path="user/admin-profile/:id" element={<AdminProfile title="Profile" />} />
          <Route path="user/resetPassword" element={<ResetPassword title="Reset Password" />} />
          <Route path="leave/list" element={<LeaveList title="Leave List" />} />
          <Route path="leave/create" element={<LeaveCreate title="Leave Create" />} />
          <Route path="leave/update/:id" element={<LeaveUpdate title="Leave Update" />} />
          <Route path="manageMonthlyLeave/list" element={<ManageMonthlyLeave title="Manage Monthly Leave" />} />
          <Route path="department/list" element={<DepartmentList title="Department List" />} />
          <Route path="department/create" element={<DepartmentCreate title="Create Department" />} />
          <Route path="department/update/:id" element={<DepartmentUpdate title="Department Update" />} />
          <Route path="project/list" element={<ProjectList title="Project List" />} />
          <Route path="project/create" element={<ProjectCreate title="Create Project " />} />
          <Route path="project/update/:id" element={<ProjectUpdate title="Update Project" />} />
          <Route path="workLog/list" element={<AdminWorkLogList title="Work Log List" />} />
          <Route path="credential/list" element={<CredentialList title="Credential List" />} />
          <Route path="credential/view/:id" element={<CredentialView title="Credential Detail" />} />
          <Route path="credential/update/:id" element={<CredentialUpdate title="Update Credentials" />} />
          <Route path="credential/create" element={<CredentialCreate title="Create Credentials" />} />
        </Route>
        <Route path='/dashboard-user' element={<UserRoutes />}>
          <Route path="employee" element={<DefaultLayout />} />
          <Route path="employee/list" element={<UserList title="Employee List" />} />
          <Route path="employee/birthday/list" element={<EmployeeByBirthMonth title="Employee By Birth Month" />} />
          <Route path="user/resetPassword" element={<ResetPassword title="Reset Password" />} />
          <Route path="user/user-profile/:id" element={<UserProfile title="Profile" />} />
          <Route path="leave/list" element={<LeaveList title="Leave List" />} />
          <Route path="leave/create" element={<LeaveCreate title="Leave Create" />} />
          <Route path="leave/update/:id" element={<LeaveUpdate title="Leave Update" />} />
          <Route path="project/list" element={<ProjectList title="Your Projects" />} />
          <Route path="workLog/list" element={<UserWorkLogList title="Work Log List" />} />
          <Route path="workLog/create" element={<WorkLogCreate title="Create Work Log " />} />
          <Route path="workLog/update/:id" element={<WorkLogUpdate title="Update Work Log" />} />
          <Route path="credential/list" element={<CredentialList title="Credential List" />} />
          <Route path="credential/view/:id" element={<CredentialView title="Credential Detail" />} />
          <Route path="credential/update/:id" element={<CredentialUpdate title="Update Credentials" />} />
          <Route path="credential/create" element={<CredentialCreate title="Create Credentials" />} />
        </Route>
      </Routes>
    </>
  );
} 

export default App;
