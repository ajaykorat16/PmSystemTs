import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CBadge } from '@coreui/react';

interface Badge {
    color: string;
    text: string;
}

export interface NavItem {
    component: React.ComponentType<any>;
    name: string;
    to?: string;
    badge?: Badge;
    icon?: React.ReactNode;
    items?: NavItem[];
}

interface AppSidebarNavProps {
    items: NavItem[];
}

const AppSidebarNav: React.FC<AppSidebarNavProps> = ({ items }) => {
    const location = useLocation();

    const navLink = (name: string, icon?: React.ReactNode, badge?: Badge, to?: string) => (
        <>
            {icon && icon}
            {name && (
                <span className="nav-link-text">
                    <span>{name}</span>
                </span>
            )}
            {badge && (
                <CBadge color={badge.color} className="ms-auto">
                    {badge.text}
                </CBadge>
            )}
            {to && (
                <NavLink to={to} className="nav-link">
                    {/* Add your NavLink styling here */}
                </NavLink>
            )}
        </>
    );

    const navItem = (item: NavItem, index: number) => {
        const { component, name, badge, icon, ...rest } = item;
        const Component = component as React.FC<any>; // Define your own type

        return (
            <Component
                {...(rest.to &&
                    !rest.items && {
                    as: NavLink,
                    to: rest.to,
                })}
                key={index}
                {...rest}
            >
                {navLink(name, icon, badge, rest.to)}
            </Component>
        );
    };

    const navGroup = (item: NavItem, index: number) => {
        const { component, name, icon, to, ...rest } = item;
        const Component = component as React.FC<any>; // Define your own type

        return (
            <Component
                idx={String(index)}
                key={index}
                toggler={navLink(name, icon)}
                visible={location.pathname.startsWith(to || '')}
                {...rest}
            >
                {item.items?.map((item, index) =>
                    item.items ? navGroup(item, index) : navItem(item, index),
                )}
            </Component>
        );
    };

    return (
        <React.Fragment>
            {items &&
                items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
        </React.Fragment>
    );
};

AppSidebarNav.propTypes = {
    items: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export { AppSidebarNav };
