import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Loader from "../components/Loader";
import { Dropdown } from "primereact/dropdown";
import Layout from "./Layout";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import "../styles/Styles.css";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";
import { useUser } from "../contexts/UserContext";

interface EmployeeByBirthMonthProps {
title: string;
}

interface UserData {
_id: string;
photo: string;
employeeNumber: number;
fullName: string;
email: string;
address: string;
phone: string;
dateOfBirth: string;
department: string;
dateOfJoining: string;
}

const EmployeeByBirthMonth: React.FC<EmployeeByBirthMonthProps> = ({ title }) => {
const { getAllUsersByBirthMonth } = useUser();
const [isLoading, setIsLoading] = useState<boolean>(true);
const [userList, setUserList] = useState<UserData[]>([]);
const [totalRecords, setTotalRecords] = useState<number>(0);
const [currentPage, setCurrentPage] = useState<number>(1);
const [rowsPerPage, setRowsPerPage] = useState<number>(10);
const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
const [visible, setVisible] = useState<boolean>(false);
const [photo, setPhoto] = useState<string>("");
const [phone, setPhone] = useState<string>("");
const [fullName, setFullName] = useState<string | undefined>();
const [email, setEmail] = useState<string>("");
const [address, setAddress] = useState<string>("");
const [departments, setDepartments] = useState<string>("");
const [dateOfBirth, setDateOfBirth] = useState<string>("");
const [dateOfJoining, setDateOfJoining] = useState<string>("");

const fetchUsers = async (query?: string) => {
setIsLoading(true);
let usertData;
if (!query) {
usertData = await getAllUsersByBirthMonth(currentPage, rowsPerPage);
} else {
let month = parseInt(query, 10);
usertData = await getAllUsersByBirthMonth(currentPage, rowsPerPage, month);
}

const totalRecordsCount = usertData.totalUsers;
setTotalRecords(totalRecordsCount);
setUserList(usertData.users);
setIsLoading(false);
};

useEffect(() => {
fetchUsers(globalFilterValue);
}, [currentPage, rowsPerPage, globalFilterValue]);

useEffect(() => {
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
setGlobalFilterValue(currentMonth.toString());
fetchUsers(currentMonth.toString());
}, []);

const onPageChange = (event: { first: number; rows: number }) => {
const currentPage = Math.floor(event.first / event.rows) + 1;
setCurrentPage(currentPage);
const newRowsPerPage = event.rows;
setRowsPerPage(newRowsPerPage);
};

const handleViewEmployeeProfile = async (user: UserData) => {
setVisible(true);
setFullName(user.fullName);
setEmail(user.email);
setAddress(user?.address);
setDepartments(user.department);
setDateOfBirth(user.dateOfBirth);
setDateOfJoining(user.dateOfJoining);
setPhoto(user.photo);
setPhone(user.phone);
};

const months = [
"January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];

return (
<Layout title={title}>
{isLoading ? (
<Loader />
) : (
<>
<CModal
alignment="center" visible={visible} onClose={() => setVisible(false)} className='mainBody'
>
<CModalHeader>
<CModalTitle><strong>{fullName}</strong></CModalTitle>
</CModalHeader>
<CModalBody>
<div className="row">
<div className="col d-flex justify-content image-container mb-3">
<>
<Avatar
image={photo}
icon={!photo ? 'pi pi-user' : undefined}
size={!photo ? 'xlarge' : undefined}
shape="circle"
style={{
width: '250px',
height: '250px',
backgroundColor: !photo ? '#2196F3' : undefined,
color: !photo ? '#ffffff' : undefined
}}
/>
</>
</div>
<div className="col userInfo">
<div className='detail'>
<div className='row userDetail'>
<div className='col'><strong> Email </strong> </div>
<div className='col'>{email}</div>
</div>
<div className='row userDetail'>
<div className='col'><strong> Department </strong> </div>
<div className='col'>{departments}</div>
</div>
<div className='row userDetail'>
<div className='col'><strong> Phone </strong> </div>
<div className='col'>{phone}</div>
</div>
<div className='row userDetail'>
<div className='col'><strong>Date Of Birth</strong></div>
<div className='col'>{dateOfBirth}</div>
</div>
<div className='row userDetail'>
<div className='col'> <strong> Date Of Joining </strong></div>
<div className='col'>{dateOfJoining}</div>
</div>
<div className='row userDetail'>
<div className='col'><strong> Address </strong> </div>
<div className='col'>{address}</div>
</div>
</div>
</div>
</div>
</CModalBody>
<CModalFooter>
<CButton color="primary" onClick={() => setVisible(false)}>
Ok
</CButton>
</CModalFooter>
</CModal>
<div className="card mb-5">
<div className="mainHeader d-flex align-items-center justify-content-between">
<div>
<h4>Employee</h4>
</div>
<div>
<select className="box" value={globalFilterValue} onChange={(e) => setGlobalFilterValue(e.target.value)}>
{months.map((month, index) => (
<option key={index} value={index + 1}>
{month}
</option>
))}
</select>
</div>
</div>
<DataTable
totalRecords={totalRecords}
lazy
paginator
rows={rowsPerPage}
value={userList}
first={(currentPage - 1) * rowsPerPage}
onPage={onPageChange}
dataKey="_id"
emptyMessage="No data found."
paginatorLeft={
<Dropdown
value={rowsPerPage}
options={[10, 25, 50]}
onChange={(e) => setRowsPerPage(e.value)}
/>
}
>
<Column
header="#"
filterField="representative"
body={(rowData) => (
<div className="flex align-items-center gap-2">
{rowData.photo ? (
<Avatar image={`${rowData.photo}`} size="large" shape="circle" />
) : (
<Avatar icon="pi pi-user" className="avatar" size="large" shape="circle" />
)}
</div>
)}
align="center"
/>
<Column field="employeeNumber" header="Emp. ID." filterField="employeeNumber" align="center" />
<Column field="fullName" header="Name" filterField="firstname" align="center" />
<Column field="email" header="Email" filterField="email" align="center" />
<Column field="phone" header="Phone" filterField="phone" align="center" />
<Column field="dateOfBirth" header="DOB" filterField="dateOfBirth" align="center" />
<Column field="department" header="Department" filterField="department" align="center" />
<Column
field="action"
header="Action"
body={(rowData) => (
<div>
<>
<Button icon="pi pi-eye" title="View Profile" rounded severity="success" aria-label="edit" onClick={() => handleViewEmployeeProfile(rowData)} />
</>
</div>
)}
align="center"
/>
</DataTable>
</div>
</>
)}
</Layout>
);
};

export default EmployeeByBirthMonth;

