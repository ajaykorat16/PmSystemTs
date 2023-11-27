import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from 'axios';

interface UserContextType {
    fetchUsers: () => Promise<any>;
    createUser: (addUser: any) => Promise<any>;
    updateUser: (updateUsers: any, id: string) => Promise<any>;
    deleteUser: (id: string) => Promise<void>;
    getUserProfile: (id: string) => Promise<any>;
    updateProfile: (updateUsers: any) => Promise<any>;
    resetPassword: (password: string) => Promise<any>;
    getAllUsers: (page: number, limit: number, query: any, sortField: string, sortOrder: number) => Promise<any>;
    getAllEmployee: (page?: number, limit?: number, query?: any, sortField?: string, sortOrder?: number) => Promise<any>;
    getAllUsersByBirthMonth: (page?: number, limit?: number, query?: any) => Promise<any>;
    userForCredential: () => Promise<any>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth?.token
    };
    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${baseURL}/user/userList`, { headers });
            if (res.data.error === false) {
                return res.data;
            }
        } catch (error) {
            console.log(error);
        }
    };

    const createUser = async (addUser: any) => {
        try {
            const { data } = await axios.post(`${baseURL}/user/addUser`, addUser, { headers });
            if (data.error === false) {
                fetchUsers();
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'User', detail: data.message, life: 3000 });
                }, 1000);
                return data;
            } else {
                toast.current?.show({ severity: 'error', summary: 'User', detail: data.message, life: 3000 });
            }
        } catch (error: any) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'User', detail: "Please fill all fields.", life: 3000 });
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'User', detail: errors[0].msg, life: 3000 });
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'User', detail: 'An error occurred. Please try again later.', life: 3000 });
            }
        }
    };

    const updateUser = async (updateUsers: any, id: string) => {
        try {
            let { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, department, dateOfJoining, photo, projects } = updateUsers;

            const editUser = new FormData();
            editUser.append("employeeNumber", employeeNumber);
            editUser.append("firstname", firstname);
            editUser.append("lastname", lastname);
            editUser.append("email", email);
            editUser.append("phone", phone);
            editUser.append("address", address);
            editUser.append("department", department);
            editUser.append("dateOfJoining", dateOfJoining);
            editUser.append("dateOfBirth", dateOfBirth);
            editUser.append("projects", JSON.stringify(projects));
            photo && editUser.append("photo", photo);

            const { data } = await axios.put(`${baseURL}/user/updateProfile/${id}`, editUser, { headers });
            if (data.error === false) {
                fetchUsers();
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'User', detail: 'User detail is updated successfully.', life: 3000 });
                }, 1000);
                return data;
            } else {
                toast.current?.show({ severity: 'error', summary: 'User', detail: data.message, life: 3000 });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const deleteUser = async (id: string) => {
        try {
            const { data } = await axios.delete(`${baseURL}/user/deleteProfile/${id}`, { headers });
            if (data.error === false) {
                fetchUsers();
                toast.current?.show({ severity: 'success', summary: 'User', detail: data.message, life: 3000 });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getUserProfile = async (id: string) => {
        try {
            const { data } = await axios.get(`${baseURL}/user/getUserProfile/${id}`, { headers });
            return data;
        } catch (error) {
            console.log(error);
        }
    };

    const updateProfile = async (updateUsers: any) => {
        try {
            let { firstname, lastname, phone, address, dateOfBirth, photo } = updateUsers;

            const editUser = new FormData();
            editUser.append("firstname", firstname);
            editUser.append("lastname", lastname);
            editUser.append("phone", phone);
            editUser.append("address", address);
            editUser.append("dateOfBirth", dateOfBirth);
            photo && editUser.append("photo", photo);

            const { data } = await axios.put(`${baseURL}/user/updateProfile`, editUser, { headers });
            if (data.error === false) {
                toast.current?.show({ severity: 'success', summary: 'Profile', detail: 'Your profile is updated successfully.', life: 3000 });
                return data;
            }
        } catch (error) {
            console.log(error);
        }
    };

    const resetPassword = async (password: string) => {
        try {
            const { data } = await axios.put(`${baseURL}/user/resetPassword`, { password }, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Password', detail: data.message, life: 3000 });
                }, 500);
                return data;
            } else {
                toast.current?.show({ severity: 'error', summary: 'Password', detail: data.message, life: 3000 });
            }
        } catch (error: any) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Password', detail: "Please fill all fields.", life: 3000 });
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Password', detail: errors[0].msg, life: 3000 });
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Password', detail: 'An error occurred. Please try again later.', life: 3000 });
            }
        }
    };

    const getAllUsers = async (page: number, limit: number, query: any, sortField: string, sortOrder: number) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/user/user-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers });
            } else {
                res = await axios.get(`${baseURL}/user`, { params: { page, limit, sortField, sortOrder }, headers });
            }
            if (res.data.error === false) {
                return res.data;
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getAllEmployee = async (page?: number, limit?: number, query?: any, sortField?: string, sortOrder?: number) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/user/user-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers });
            } else {
                res = await axios.get(`${baseURL}/user/employeeList`, { params: { page, limit, sortField, sortOrder }, headers });
            }
            if (res.data.error === false) {
                return res.data;
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getAllUsersByBirthMonth = async (page?: number, limit?: number, query?: any) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/user/getUserByBirthDayMonth-search`, { filter: query }, { params: { page, limit }, headers });
            } else {
                res = await axios.get(`${baseURL}/user/getUserByBirthDayMonth`, { params: { page, limit }, headers });
            }
            if (res.data.error === false) {
                return res.data;
            }
        } catch (error) {
            console.log(error);
        }
    };

    const userForCredential = async () => {
        try {
            const res = await axios.get(`${baseURL}/user/credentialUser`, { headers });
            if (res.data.error === false) {
                return res.data;
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <UserContext.Provider value={{ fetchUsers, createUser, updateUser, deleteUser, getUserProfile, updateProfile, resetPassword, getAllUsers, getAllEmployee, getAllUsersByBirthMonth, userForCredential }}>
            {children}
        </UserContext.Provider>
    );
};

const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export { useUser, UserProvider };

