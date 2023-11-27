import React, { useState } from 'react';
import {
    CButton,
    CCol,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

const ResetPassword: React.FC<{ title: string }> = ({ title }) => {
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const { toast, logout } = useAuth();
    const { resetPassword } = useUser();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (password !== confirmPassword) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Password',
                    detail: 'Password and Confirm Password must be the same',
                    life: 3000,
                });
            } else {
                const data = await resetPassword(password);
                if (!data.error) {
                    logout();
                    navigate('/');
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Layout title={title}>
            <CForm onSubmit={handleSubmit}>
                <h1 className="mb-4">Reset Password</h1>
                <CCol md={4}>
                    <CInputGroup className="mb-4">
                        <CInputGroupText>
                            <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                            type="password"
                            placeholder="New Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </CInputGroup>
                </CCol>
                <CCol md={4}>
                    <CInputGroup className="mb-4">
                        <CInputGroupText>
                            <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                            type="password"
                            placeholder="Confirm Password"
                            autoComplete="current-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </CInputGroup>
                </CCol>
                <CRow>
                    <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit">
                            Reset
                        </CButton>
                    </CCol>
                </CRow>
            </CForm>
        </Layout>
    );
};

export default ResetPassword;
