import React, { createContext, useContext, ReactNode } from "react";
import { baseURL } from "../lib";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface WorkLogContextType {
    getWorkLog: (page?: number, limit?: number, query?: any, sortField?: string, sortOrder?: string) => Promise<any>;
    getAdminWorkLog: (page?: number, limit?: number, filter?: any, sortField?: string, sortOrder?: string) => Promise<any>;
    getSingleWorkLog: (id: string) => Promise<any>;
    createWorkLog: (addWorkLog: any) => Promise<any>;
    updateWorkLog: (workLog: any, id: string) => Promise<any>;
    deleteWorkLog: (id: string) => Promise<void>;
}

const WorkLogContext = createContext<WorkLogContextType | undefined>(undefined);

interface WorkLogProviderProps {
    children: ReactNode;
}

const WorkLogProvider: React.FC<WorkLogProviderProps> = ({ children }) => {
    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth?.token,
    };

    // get Work Log
    const getWorkLog = async (page?: number, limit?: number, query?: any, sortField?: string, sortOrder?: string): Promise<any> => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/worklog/search-worklog`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers: headers });
            } else {
                res = await axios.get(`${baseURL}/worklog/user-worklog`, { params: { page, limit, sortField, sortOrder }, headers });
            }
            if (res.data.error === false) {
                return res.data;
            }
        } catch (error) {
            console.log(error);
        }
    };

    // get admin Work Log
    const getAdminWorkLog = async (page?: number, limit?: number, filter?: any, sortField?: string, sortOrder?: string): Promise<any> => {
        try {
            let res;
            if (filter) {
                res = await axios.post(`${baseURL}/worklog/admin-search-worklog?page=${page}&limit=${limit}`, { filter }, { headers });
            } else {
                res = await axios.get(`${baseURL}/worklog`, { params: { page, limit, sortField, sortOrder }, headers });
            }
            if (res.data.error === false) {
                return res.data;
            }
        } catch (error) {
            console.log(error);
        }
    };

    // get single Work Log
    const getSingleWorkLog = async (id: string): Promise<any> => {
        try {
            const { data } = await axios.get(`${baseURL}/worklog/single-worklog/${id}`, { headers });
            return data;
        } catch (error) {
            console.log(error);
        }
    };

    // add Work Log
    const createWorkLog = async (addWorkLog: any): Promise<any> => {
        try {
            const { data } = await axios.post(`${baseURL}/worklog/create`, addWorkLog, { headers });

            if (data.error === false) {
                // getWorkLog(0, 10, null, 'createdAt', 'desc');
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Worklog', detail: data.message, life: 3000 });
                }, 1000);
                return data;
            } else {
                toast.current?.show({ severity: 'info', summary: 'Worklog', detail: data.message, life: 3000 });
            }
        } catch (error: any) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Worklog', detail: "Please fill all fields.", life: 3000 });
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Worklog', detail: errors[0].msg, life: 3000 });
                    }
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Worklog', detail: 'An error occurred. Please try again later.', life: 3000 });
            }
        }
    };

    // update Work Log
    const updateWorkLog = async (workLog: any, id: string): Promise<any> => {
        try {
            const { data } = await axios.put(`${baseURL}/worklog/update-worklog/${id}`, workLog, { headers });

            if (data.error === false) {
                // getWorkLog(0, 10, null, 'createdAt', 'desc');
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Worklog', detail: data.message, life: 3000 });
                }, 1000);
                return data;
            } else {
                toast.current?.show({ severity: 'info', summary: 'Worklog', detail: data.message, life: 3000 });
            }
        } catch (error) {
            console.log(error);
        }
    };

    // delete Work Log
    const deleteWorkLog = async (id: string): Promise<void> => {
        try {
            const { data } = await axios.delete(`${baseURL}/worklog/delete-worklog/${id}`, { headers });
            if (data.error === false) {
                // getWorkLog(0, 10, null, 'createdAt', 'desc');
                toast.current?.show({ severity: 'success', summary: 'Worklog', detail: data.message, life: 3000 });
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <WorkLogContext.Provider value={{ getWorkLog, createWorkLog, deleteWorkLog, getAdminWorkLog, getSingleWorkLog, updateWorkLog }}>
            {children}
        </WorkLogContext.Provider>
    );
};

// custom hook
const useWorkLog = (): WorkLogContextType => {
    const context = useContext(WorkLogContext);
    if (context === undefined) {
        throw new Error("useWorklog must be used within a WorklogProvider");
    }
    return context;
};

export { useWorkLog, WorkLogProvider };
