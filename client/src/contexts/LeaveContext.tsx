import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from 'axios';

interface LeaveContextType {
    getLeaves: (page: number, limit: number, query: any, sortField: string, sortOrder: string) => Promise<any>;
    addLeave: (leaveData: any) => Promise<any>;
    deleteLeave: (id: string) => Promise<void>;
    updateLeave: (leaveData: any, id: string) => Promise<any>;
    updateStatus: (status: string, id: string, reasonForLeaveReject?: string) => Promise<void>;
    getLeaveById: (id: string) => Promise<any>;
    getUserLeave: (page?: number, limit?: number, query?: any, sortField?: string, sortOrder?: string) => Promise<any>;
    addUserLeave: (leaveData: any) => Promise<any>;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

interface LeaveProviderProps {
    children: ReactNode;
}

const LeaveProvider: React.FC<LeaveProviderProps> = ({ children }) => {
    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth?.token
    };

    //Get Leaves
    const getLeaves = async (page: number, limit: number, query: any, sortField: string, sortOrder: string) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/leaves/leavelist-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers });
            } else {
                res = await axios.get(`${baseURL}/leaves/leavelist`, { params: { page, limit, sortField, sortOrder }, headers });
            }
            if (res.data.error === false) {
                return res.data;
            }
        } catch (error) {
            console.error(error);
        }
    };

    //Add Leave
    const addLeave = async (leaveData: any) => {
        try {
            const { data } = await axios.post(`${baseURL}/leaves/createLeaveAdmin`, leaveData, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Leave', detail: data.message, life: 3000 });
                }, 1000);
                return data;
            } else {
                toast.current?.show({ severity: 'info', summary: 'Leave', detail: data.message, life: 3000 });
            }
        } catch (error: any) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Leave', detail: "Please fill all fields.", life: 3000 })
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Leave', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Leave', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    };

    //Delete Leave
    const deleteLeave = async (id: string) => {
        try {
            const { data } = await axios.delete(`${baseURL}/leaves/deleteLeave/${id}`, { headers });
            if (data.error === false) {
                // getUserLeave();
                toast.current?.show({ severity: 'success', summary: 'Leave', detail: data.message, life: 3000 })
            }
        } catch (error) {
            console.log(error);
        }
    }

    //Update Leave
    const updateLeave = async (leaveData: any, id: string) => {
        try {
            const { data } = await axios.put(`${baseURL}/leaves/updateLeave/${id}`, leaveData, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Leave', detail: data.message, life: 3000 })
                }, 1000);
                return data
            }
        } catch (error) {
            console.log(error);
        }
    }

    //Update Leave Status
    const updateStatus = async (status: string, id: string, reasonForLeaveReject?: string) => {
        try {
            const { data } = await axios.put(`${baseURL}/leaves/updateStatus/${id}`, { status, reasonForLeaveReject }, { headers })
            if (data.error === false) {
                // getLeaves()
            }
        } catch (error) {
            console.log(error);
        }
    }

    //Get User Leave
    const getUserLeave = async (page?: number, limit?: number, query?: any, sortField?: string, sortOrder?: string) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/leaves/userLeaves-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers });
            } else {
                res = await axios.get(`${baseURL}/leaves/userLeaves`, { params: { page, limit, sortField, sortOrder }, headers });
            }
            if (res.data.error === false) {
                return res.data;
            }
        } catch (error) {
            console.log(error);
        }
    }

    //Add User Leave
    const addUserLeave = async (leaveData: any) => {
        try {
            const { data } = await axios.post(`${baseURL}/leaves/createLeave`, leaveData, { headers });
            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Leave', detail: data.message, life: 3000 })
                }, 1000);
                return data;
            } else {
                toast.current?.show({ severity: 'warn', summary: 'Leave', detail: data.message, life: 3000 })
            }
        } catch (error: any) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Leave', detail: "Please fill all fields.", life: 3000 })
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Leave', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Leave', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    // get Single Leave
    const getLeaveById = async (id: string) => {
        try {
            const { data } = await axios.get(`${baseURL}/leaves/getLeaveById/${id}`, { headers });
            return data.leaves;
        } catch (error) {
            console.log(error);            
        }
    }

    return (
        <LeaveContext.Provider value={{ getLeaves, addLeave, deleteLeave, updateLeave, updateStatus, getUserLeave, addUserLeave, getLeaveById }}>
            {children}
        </LeaveContext.Provider>
    );
};

const useLeave = (): LeaveContextType => {
    const context = useContext(LeaveContext);
    if (context === undefined) {
        throw new Error('useLeave must be used within a LeaveProvider');
    }
    return context;
};

export { useLeave, LeaveProvider };
