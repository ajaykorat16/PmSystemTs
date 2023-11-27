import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CNavLink, CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler } from '@coreui/react';
import { AppSidebarNav, NavItem } from './AppSidebarNav';
import SimpleBar from 'simplebar-react';
import { useAuth } from '../contexts/AuthContext';
import adminNavigation from './AdminNav';
import userNavigation from './UserNav';
import { NavLink } from 'react-router-dom';
// import 'simplebar/dist/simplebar.min.css';
import { Avatar } from 'primereact/avatar';

const AppSidebar: React.FC = () => {
    const dispatch = useDispatch();
    const unfoldable = useSelector((state: any) => state.sidebarUnfoldable);
    const sidebarShow = useSelector((state: any) => state.sidebarShow);
    const { auth } = useAuth();
    const [role, setRole] = useState<string | undefined>("");

    useEffect(() => {
        if (auth?.user?.role) {
            setRole(auth?.user?.role);
        }
    }, [auth]);

    const userRole = auth?.user?.role;

    return (
        <CSidebar
            position="fixed"
            unfoldable={unfoldable}
            visible={sidebarShow}
            onVisibleChange={(visible) => {
                dispatch({ type: 'set', sidebarShow: visible });
            }}
        >
            <CSidebarBrand className="d-none d-md-flex pmSystem">
                <CNavLink to={userRole === "user" ? '/dashboard-user/employee' : "/dashboard/admin"} component={NavLink} className="d-none d-md-flex">
                    <Avatar
                        image='/kr_logo.ico'
                        shape="circle"
                        className='logo p-1'
                    />  PM SYSTEM
                </CNavLink>
            </CSidebarBrand>
            <CSidebarNav>
                <SimpleBar>
                    {role && role === "admin" && <AppSidebarNav items={adminNavigation as NavItem[]} />}
                    {role && role === "user" && <AppSidebarNav items={userNavigation as NavItem[]} />}
                    {role === "" && <AppSidebarNav items={userNavigation as NavItem[]} />}
                </SimpleBar>
            </CSidebarNav>
            <CSidebarToggler
                className="d-none d-lg-flex"
                onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
            />
        </CSidebar>
    );
};

export default React.memo(AppSidebar);
