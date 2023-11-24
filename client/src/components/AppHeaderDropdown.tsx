import React, { useState, useEffect } from 'react';
import { CImage, CDropdown, CDropdownDivider, CDropdownHeader, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { MdOutlineLockReset } from 'react-icons/md';
import { Avatar } from 'primereact/avatar';
import { RiAdminLine, RiLoginBoxLine, RiLogoutBoxLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";

interface LeaveBalanceDisplayProps {
    leaveBalance: number | null;
}

const LeaveBalanceDisplay: React.FC<LeaveBalanceDisplayProps> = ({ leaveBalance }) => {
    return (
        <div className='balance'>
            Leave Balance: {leaveBalance}
        </div>
    );
};

const AppHeaderDropdown: React.FC = () => {
    const [photo, setPhoto] = useState<string>('');
    const { logout, auth, adminAuth, backToAdmin } = useAuth();
    const { getUserProfile } = useUser();
    const [getAuth, setGetAuth] = useState<any | null>("");
    const [isPhoto, setIsPhoto] = useState<boolean>(false);
    const navigate = useNavigate();
    const [leaveBalance, setLeaveBalance] = useState<number | null>(null);

    const handleLogout = () => {
        try {
            logout();
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogin = () => {
        try {
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    const fetchData = async () => {
        try {
            if (getAuth && getAuth.user) {
                const { getProfile } = await getUserProfile(getAuth.user?._id);
                setLeaveBalance(getProfile.leaveBalance);
                if (getProfile?.photo === null) {
                    setPhoto('');
                    setIsPhoto(false);
                } else {
                    setPhoto(getProfile.photo);
                    setIsPhoto(true);
                }
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    useEffect(() => {
        let authdata = JSON.parse(localStorage.getItem('auth') || '{}');
        setGetAuth(authdata);
    }, []);

    useEffect(() => {
        if (getAuth && getAuth.user) {
            fetchData();
        }
    }, [getAuth]);

    const handleBackToAdmin = async () => {
        await backToAdmin();
        navigate("/");
    };

    const redirectPath = auth?.user?.role === "admin" ? `/dashboard/user/admin-profile/${auth?.user?._id}` : `/dashboard-user/user/user-profile/${auth?.user?._id}`;
const path = auth?.user?.role === "admin" ? `/dashboard/user/resetPassword` : `/dashboard-user/user/resetPassword`;
    return (
        <>
            {auth?.user?.role === "user" &&
                <LeaveBalanceDisplay leaveBalance={leaveBalance} />
            }
            <CDropdown variant="nav-item">
                <CDropdownToggle className="py-0" caret={false}>
                    {isPhoto ?
                        <CImage align="start" rounded src={photo} width={30} height={30} alt="User Avatar" />
                        :
                        <Avatar icon="pi pi-user" style={{ backgroundColor: '#2196F3', color: '#ffffff', borderRadius: "5px" }} />
                    }
                </CDropdownToggle>
                <CDropdownMenu className="pt-0 dropdown" >
                    <CDropdownHeader className="bg-light fw-semibold py-2">Settings</CDropdownHeader>
                    {getAuth &&
                        <>
                            <CDropdownItem onClick={() => navigate(redirectPath)}>
                                <CgProfile className="me-1" fontSize={20} />
                                Profile
                            </CDropdownItem>
                            <CDropdownItem onClick={() => navigate(path)}>
                                <MdOutlineLockReset className="me-1" fontSize={20} />
                                Reset Password
                            </CDropdownItem>
                            <CDropdownDivider />
                        </>
                    }
                    {adminAuth.token !== '' &&
                        <>
                            <CDropdownItem onClick={handleBackToAdmin}>
                                <RiAdminLine fontSize={20} className='me-1' />
                                Back To Admin
                            </CDropdownItem>
                        </>
                    }
                    {getAuth ?
                        <CDropdownItem onClick={handleLogout}>
                            <RiLogoutBoxLine fontSize={20} className='me-1' />
                            Logout
                        </CDropdownItem> :
                        <CDropdownItem onClick={handleLogin}>
                            <RiLoginBoxLine fontSize={20} className='me-1' />
                            Login
                        </CDropdownItem>
                    }
                </CDropdownMenu>
            </CDropdown>
        </>
    );
};

export default AppHeaderDropdown;
