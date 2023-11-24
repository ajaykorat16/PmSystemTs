import React, { useState, useEffect } from 'react';
import { CForm, CCol, CFormInput } from '@coreui/react';
import { useParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import Loader from '../../components/Loader';
import Layout from '../Layout';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import moment from 'moment';
import { Calendar } from 'primereact/calendar';
import { useHelper } from '../../contexts/Helper';
import { useAuth } from '../../contexts/AuthContext';

// interface UserProfile {
//   _id: string;
//   employeeNumber: string;
//   firstname: string;
//   lastname: string;
//   email: string;
//   phone: string;
//   address: string;
//   department: {
//     name: string;
//   };
//   dateOfBirth: Date;
//   dateOfJoining: Date;
//   photo: string;
// }

const AdminProfile: React.FC<{ title: string }> = ({ title }) => {
  const [employeeNumber, setEmployeeNumber] = useState<string>('');
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [departments, setDepartments] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [dateOfJoining, setDateOfJoining] = useState<Date | undefined>(undefined);
  const [photo, setPhoto] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { updateProfile, getUserProfile } = useUser();
  const { toast } = useAuth();
  const { formatDate } = useHelper();
  const params = useParams<{ id: any }>();

  const doj = moment(dateOfJoining).format('DD-MM-YYYY');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { getProfile } = await getUserProfile(params.id);
        if (getProfile) {
          setEmployeeNumber(getProfile.employeeNumber);
          setFirstname(getProfile.firstname);
          setLastname(getProfile.lastname);
          setEmail(getProfile.email);
          setAddress(getProfile.address);
          setPhone(getProfile.phone);
          setDepartments(getProfile.department ? getProfile.department.name : '');
          setDateOfBirth(new Date(getProfile.dateOfBirth));
          setDateOfJoining(new Date(getProfile.dateOfJoining));
          setPhoto(getProfile.photo);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchData();
  }, [params.id, getUserProfile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const updateUsers = {
        firstname,
        lastname,
        phone,
        address,
        dateOfBirth: formatDate(dateOfBirth),
        photo: newPhoto || photo,
      };
      const data = await updateProfile(updateUsers);
      if (data.error) {
        toast.current?.show({
          severity: 'error',
          summary: 'User',
          detail: data.message,
          life: 3000,
        });
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

  return (
    <Layout title={title} >
      {isLoading === true && <Loader />}
      {isLoading === false && (
        <>
          <CForm onSubmit={handleSubmit}>
            <div className="mainBody me-3">
              <div className="row">
                <div className="userBlock">
                  <CCol className="mb-3">
                    <div className="mt-3 d-flex justify-content image-container">
                      <Avatar
                        image={newPhoto ? URL.createObjectURL(newPhoto) : photo || undefined}
                        icon={!photo && !newPhoto ? 'pi pi-user' : undefined}
                        size={!photo && !newPhoto ? 'xlarge' : undefined}
                        shape="circle"
                        style={{
                          width: '300px',
                          height: '300px',
                          backgroundColor: !photo && !newPhoto ? '#2196F3' : undefined,
                          color: !photo && !newPhoto ? '#ffffff' : undefined,
                        }}
                      />
                    </div>
                  </CCol>
                  <div>
                    <p className="title">PROFILE</p>
                  </div>
                  <div className="userInfo mb-3">
                    <div className="detail">
                      <div className="row userDetail">
                        <div className="col">
                          <strong> Employee Id </strong>
                        </div>
                        <div className="col">{employeeNumber}</div>
                      </div>
                      <div className="row userDetail">
                        <div className="col">
                          <strong> Name </strong>
                        </div>
                        <div className="col">
                          {firstname} {lastname}
                        </div>
                      </div>
                      <div className="row userDetail">
                        <div className="col">
                          <strong> Department </strong>
                        </div>
                        <div className="col">{departments}</div>
                      </div>
                      <div className="row userDetail">
                        <div className="col">
                          <strong> Email </strong>
                        </div>
                        <div className="col">{email}</div>
                      </div>
                      <div className="row userDetail">
                        <div className="col">
                          <strong> Date Of Joining </strong>
                        </div>
                        <div className="col">{doj}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="editUser">
                  <div className="row">
                    <div className="col">
                      <p className="title">EDIT USER</p>
                    </div>
                    <div className="col">
                      <div className="btn-sm float-end submitButton">
                        <CCol>
                          <Button icon="pi pi-check" type="submit" rounded aria-label="Filter" />
                        </CCol>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <CCol>
                        <CFormInput
                          id="inputFirstName"
                          label="First Name"
                          value={firstname}
                          className="mb-3"
                          onChange={(e) => setFirstname(e.target.value)}
                        />
                      </CCol>
                    </div>
                    <div className="col">
                      <CCol>
                        <CFormInput
                          id="inputLastName"
                          label="Last Name"
                          className="mb-3"
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                        />
                      </CCol>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <CCol>
                        <CFormInput
                          id="inputAddress"
                          label="Address"
                          placeholder="Enter your address"
                          className="mb-3"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </CCol>
                    </div>
                    <div className="col">
                      <CCol>
                        <CFormInput
                          type="number"
                          id="inputPhone"
                          label="Phone Number"
                          className="mb-3"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </CCol>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <CCol>
                        <label className="form-label">Date Of Birth</label>
                        <Calendar
                          value={dateOfBirth}
                          dateFormat="dd-mm-yy"
                          onChange={(e) => setDateOfBirth(e.target.value as Date)}
                          maxDate={new Date()}
                          showIcon
                          id="date"
                        />
                      </CCol>
                    </div>
                    <div className="col">
                      <CCol>
                        <CFormInput
                          type="file"
                          className="form-control mb-3"
                          label="Upload Photo"
                          id="inputGroupFile04"
                          accept="image/*"
                          aria-describedby="inputGroupFileAddon04"
                          aria-label="Upload"
                          onChange={handlePhoto}
                        />
                      </CCol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CForm>
        </>
      )}
    </Layout>
  );
};

export default AdminProfile;
