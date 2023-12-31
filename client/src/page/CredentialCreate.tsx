import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { CButton, CCol, CForm, CFormInput } from '@coreui/react';
import { MultiSelect } from 'primereact/multiselect';
import { Editor } from 'primereact/editor';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useCredential } from '../contexts/CredentialContext';
import { useAuth } from '../contexts/AuthContext';
import { useHelper } from '../contexts/Helper';

interface CredentialCreateProps {
  title: string;
}

const CredentialCreate: React.FC<CredentialCreateProps> = ({ title }) => {
  const { userForCredential } = useUser();
  const { addCredentials } = useCredential();
  const { auth, toast } = useAuth();
  const { onShow } = useHelper();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [credentialTitle, setCredentialTitle] = useState<string>("");
  const [description, setDescription] = useState<any>("");
  const [developers, setDevelopers] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const credentials = {
        title: credentialTitle,
        description,
        users: developers.map((dev) => ({ id: dev._id })),
      };
      const data = await addCredentials(credentials);
      if (typeof data !== 'undefined' && data.error === false) {
        const redirectPath = auth?.user?.role === 'admin' ? `/dashboard/credential/list` : `/dashboard-user/credential/list`;
        navigate(redirectPath);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const getUsers = async () => {
    const { getAllUsers } = await userForCredential();
    setUsers(getAllUsers);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Layout title={title} toast={toast}>
      <div className="mb-3">
        <h2 className="mb-5 mt-2">Create Credentials</h2>
      </div>
      <CForm className="row g-3" onSubmit={handleSubmit}>
        <CCol md={12}>
          <CFormInput id="inputTitle" label="Title" value={credentialTitle} onChange={(e) => setCredentialTitle(e.target.value)} />
        </CCol>
        <CCol xs={12}>
          <label htmlFor="developerSelect" className="form-label">
            Users
          </label>
          <MultiSelect
            value={developers}
            onChange={(e) => setDevelopers(e.value as any[])}
            options={users}
            size={6}
            style={{ border: '1px solid var(--cui-input-border-color, #b1b7c1)', borderRadius: '6px' }}
            optionLabel="fullName"
            placeholder="Select Users"
            id="developerSelect"
            className="form-control"
            onShow={onShow}
          />
        </CCol>
        <CCol md={12}>
          <label className="mb-2">Description</label>
          <div className="card">
            <Editor value={description} onTextChange={(e) => setDescription(e.htmlValue)} className="editorContainer" />
          </div>
        </CCol>
        <CCol xs={12}>
          <CButton type="submit">Submit</CButton>
        </CCol>
      </CForm>
    </Layout>
  );
};

export default CredentialCreate;
