import React, { useState, useEffect } from 'react';
import { CForm, CCol, CFormInput, CFormSelect, CButton, CRow, CFormTextarea, CImage } from '@coreui/react';
import { MultiSelect } from 'primereact/multiselect';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar } from 'primereact/calendar';
import { useUser } from '../../contexts/UserContext';
import Layout from '../Layout';
import Loader from '../../components/Loader';
import { useAuth } from '../../contexts/AuthContext';
import { useHelper } from '../../contexts/Helper';
import { useDepartment } from '../../contexts/DepartmentContext';
import { useProject } from '../../contexts/ProjectContext';

const UserUpdate: React.FC<{ title: string }> = ({ title }) => {
    const [employeeNumber, setEmployeeNumber] = useState<string>("");
    const [firstname, setFirstname] = useState<string>("");
    const [lastname, setLastname] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [departments, setDepartments] = useState<string>("");
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [dateOfJoining, setDateOfJoining] = useState<Date | null>(null);
    const [photo, setPhoto] = useState<string>("");
    const [projects, setProjects] = useState<any[]>([]);
    const [newProjects, setNewProjects] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { updateUser, getUserProfile } = useUser();
    const { toast } = useAuth();
    const { getDepartmentList } = useDepartment();
    const [departmentsList, setDepartmentsList] = useState<any[]>([]);
    const { fetchProjects } = useProject();
    const { formatDate, onShow } = useHelper();
    const navigate = useNavigate();
    const params = useParams<{ id: any }>();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                let { getProfile } = await getUserProfile(params?.id);
                if (getProfile) {
                    setEmployeeNumber(getProfile.employeeNumber);
                    setFirstname(getProfile.firstname);
                    setLastname(getProfile.lastname);
                    setEmail(getProfile.email);
                    setAddress(getProfile.address);
                    setPhone(getProfile.phone);
                    setDepartments(getProfile.department ? getProfile.department._id : "");
                    setDateOfBirth(new Date(getProfile.dateOfBirth));
                    setDateOfJoining(new Date(getProfile.dateOfJoining));
                    setPhoto(getProfile.photo);
                    if (getProfile.projects && getProfile.projects.length > 0) {
                        setNewProjects(getProfile.projects.map((e:any) => e.id._id));
                    } else {
                        setNewProjects([]);
                    }
                    setIsLoading(false);
                }
            } catch (error:any) {
                console.log(error.message);
            }
        };
        fetchData();
    }, [params.id, getUserProfile]);

    const fetchDepartment = async () => {
        const { departments } = await getDepartmentList();
        setDepartmentsList(departments);
    };

    useEffect(() => {
        fetchDepartment();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let updateUsers = {
                employeeNumber,
                firstname,
                lastname,
                email,
                phone,
                address,
                dateOfBirth: formatDate(dateOfBirth),
                department: departments,
                dateOfJoining: formatDate(dateOfJoining),
                photo: newPhoto || photo,
                projects: newProjects,
            };
            let id = params?.id;
            const data = await updateUser(updateUsers, id);
            if (data.error) {
                toast?.current?.show({ severity: 'error', summary: 'User', detail: data.message, life: 3000 });
            } else {
                navigate('/dashboard/user/list');
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setNewPhoto(e.target.files[0]);
        }
    };

    const getProjects = async () => {
        const { getAllProjects } = await fetchProjects();
        setProjects(getAllProjects);
    };

    useEffect(() => {
        getProjects();
    }, []);

    return (
        <Layout title={title}>
            {isLoading === true && <Loader />}
            {isLoading === false && (
                <>
                    <div className="mb-3">
                        <h2 className="mb-5 mt-2">Update User</h2>
                    </div>
                    <CForm className="row g-3 mb-3" onSubmit={handleSubmit}>
                        {photo && !newPhoto && (
                            <CCol xs={12}>
                                <CImage align="start" rounded src={photo} width={200} height={200} />
                            </CCol>
                        )}

                        {!photo && newPhoto && (
                            <CCol xs={12}>
                                <CImage align="end" rounded src={URL.createObjectURL(newPhoto)} width={200} height={200} />
                            </CCol>
                        )}

                        {photo && newPhoto && (
                            <CCol xs={12}>
                                <CImage align="end" rounded src={URL.createObjectURL(newPhoto)} width={200} height={200} />
                            </CCol>
                        )}
                        <CRow>
                            <CCol md={4}>
                                <CFormInput
                                    id="inputEmployeeNo"
                                    label="Employee Number"
                                    value={employeeNumber}
                                    onChange={(e) => setEmployeeNumber(e.target.value)}
                                    disabled
                                />
                            </CCol>
                        </CRow>
                        <CCol md={6}>
                            <CFormInput
                                id="inputFirstName"
                                label="First Name"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput
                                id="inputLastName"
                                label="Last Name"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput
                                type="email"
                                id="inputEmail4"
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput
                                type="number"
                                id="inputPhone"
                                label="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </CCol>
                        <CCol xs={6}>
                            <CFormTextarea
                                id="inputAddress"
                                label="Address"
                                placeholder="Enter your address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect
                                id="inputDepartment"
                                label="Department"
                                placeholder="Select Department"
                                value={departments}
                                onChange={(e) => setDepartments(e.target.value)}
                            >
                                <option value="" disabled>
                                    Select a Department
                                </option>
                                {departmentsList.map((d) => (
                                    <option key={d._id} value={d._id}>
                                        {d.name}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol xs={6}>
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
                        <CCol xs={6}>
                            <label className="form-label">Date Of Birth</label>
                            <Calendar
                                value={dateOfBirth}
                                dateFormat="dd-mm-yy"
                                onChange={(e) => setDateOfBirth(e.target.value as Date)}
                                maxDate={new Date()}
                                showIcon
                                id="date"
                                className="form-control"
                            />
                        </CCol>
                        <CCol xs={6}>
                            <CFormInput
                                type="file"
                                className="form-control"
                                label={"Upload Photo"}
                                id="inputGroupFile04"
                                accept="image/*"
                                aria-describedby="inputGroupFileAddon04"
                                aria-label="Upload"
                                onChange={handlePhoto}
                            />
                        </CCol>
                        <CCol xs={6}>
                            <label htmlFor="projectSelect" className="form-label">
                                Project
                            </label>
                            <MultiSelect
                                value={newProjects}
                                onChange={(e) => setNewProjects(e.target.value)}
                                options={projects}
                                size={6}
                                optionLabel="name"
                                optionValue="_id"
                                placeholder="Select Projects"
                                id="date"
                                className="form-control"
                                onShow={onShow}
                            />
                        </CCol>
                        <CCol xs={12}>
                            <CButton type="submit" className="me-md-2">
                                Submit
                            </CButton>
                        </CCol>
                    </CForm>
                </>
            )}
        </Layout>
    );
};

export default UserUpdate;
