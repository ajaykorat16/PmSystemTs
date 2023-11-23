import React, { useState, useEffect, useRef } from 'react';
import { CForm, CCol, CFormInput, CFormSelect, CButton, CFormTextarea } from '@coreui/react';
import { Calendar } from 'primereact/calendar';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { useUser } from '../../contexts/UserContext';
import { useDepartment } from '../../contexts/DepartmentContext';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from 'primereact/toast';
import { useHelper } from '../../contexts/Helper';

interface UserCreateProps {
title: string;
}

const UserCreate: React.FC<UserCreateProps> = ({ title }) => {
const [employeeNumber, setEmployeeNumber] = useState<string>("");
const [firstname, setFirstname] = useState<string>("");
const [lastname, setLastname] = useState<string>("");
const [email, setEmail] = useState<string>("");
const [password, setPassword] = useState<string>("");
const [confirmPassword, setConfirmPassword] = useState<string>("");
const [phone, setPhone] = useState<string>("");
const [address, setAddress] = useState<string>("");
const [departments, setDepartments] = useState<string>("");
const [departmentsList, setDepartmentsList] = useState<any[]>([]);
const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
const [dateOfJoining, setDateOfJoining] = useState<Date | null>(null);
const toastRef = useRef<Toast | null>(null);

const { createUser } = useUser();
const { toast } = useAuth();
const { formatDate } = useHelper();
const { getDepartmentList } = useDepartment();
const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
e.preventDefault();
try {
if (password !== confirmPassword) {
toast?.current?.show({ severity: 'error', summary: 'User', detail: "Password and Confirm Password must be same.", life: 3000 });
} else {
let addUser = {
employeeNumber,
firstname,
lastname,
email,
password,
phone,
address,
dateOfBirth: formatDate(dateOfBirth),
department: departments,
dateOfJoining: formatDate(dateOfJoining)
};

const data = await createUser(addUser);

if (typeof data !== 'undefined' && data.error === false) {
navigate('/dashboard/user/list');
}
}
} catch (error: any) {
console.log(error.message);
}
};

const fetchDepartment = async () => {
const { departments } = await getDepartmentList();
setDepartmentsList(departments);
};

useEffect(() => {
fetchDepartment();
}, []);

return (
<Layout title={title} toast={toastRef}>
<div className="mb-3">
<h2 className='mb-5 mt-2'>Create User</h2>
</div>
<CForm className="row g-3" onSubmit={handleSubmit}>
<CCol md={6}>
<CFormInput id="inputEmployeeNo" label="Employee Number" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} />
</CCol>
<CCol md={6}>
<CFormInput type="email" id="inputEmail4" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
</CCol>
<CCol md={6}>
<CFormInput id="inputFirstName" label="First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
</CCol>
<CCol md={6}>
<CFormInput id="inputLastName" label="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} />
</CCol>
<CCol md={6}>
<CFormInput type="password" id="inputPassword4" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
</CCol>
<CCol md={6}>
<CFormInput type="password" id="inputConfirmPassword" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
</CCol>
<CCol md={6}>
<CFormInput type="number" id="inputPhone" label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
</CCol>
<CCol xs={6}>
<CFormTextarea id="inputAddress" label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
</CCol>
<CCol md={4}>
<CFormSelect id="inputDepartment" label="Department" value={departments} onChange={(e) => setDepartments(e.target.value)}>
<option value="" disabled>Select a department</option>
{departmentsList.map((d) => (
<option key={d._id} value={d._id}>{d.name}</option>
))}
</CFormSelect>
</CCol>
<CCol xs={4}>
<label className="form-label">Date Of Joining</label>
<Calendar
value={dateOfJoining}
dateFormat="dd-mm-yy"
onChange={(e) => setDateOfJoining(e.target.value as Date)}
showIcon
id="date"
className="form-control"
/>
</CCol>
<CCol xs={4}>
<label className="form-label">Date Of Birth</label>
<Calendar
value={dateOfBirth}
dateFormat="dd-mm-yy"
onChange={(e) => setDateOfBirth(e.target.value as any)}
maxDate={new Date()}
showIcon
id="date"
className="form-control"
/>
</CCol>
<CCol xs={12}>
<CButton type="submit" className="me-md-2">Submit</CButton>
</CCol>
</CForm>
</Layout>
);
};

export default UserCreate;

