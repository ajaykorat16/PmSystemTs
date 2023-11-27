import React, { useContext, createContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { baseURL } from "../lib";
import axios from 'axios';

interface Credentials {
    title: string;
    description: string;
    photo?: string[];
    createdBy?: string;
    users: any[]
}

interface CredentialsContextProps {
    addCredentials: (credentials: Credentials) => Promise<any>;
    getAllCredentials: (page?: number, limit?: number, query?: string, sortField?: string, sortOrder?: number) => Promise<any>;
    deleteCredentials: (id: string) => Promise<void>;
    updateCredential: (credentialData: Credentials, id: string) => Promise<any>;
    getSingleCredential: (id: string) => Promise<any | undefined>;
}

const CredentialsContext = createContext<CredentialsContextProps | undefined>(undefined);

interface CredentialProviderProps {
    children: ReactNode;
}

const CredentialProvider: React.FC<CredentialProviderProps> = ({ children }) => {
    const { auth, toast } = useAuth();
    const headers = {
        Authorization: auth.token
    };

    // Create credentials
    const addCredentials = async (credentials: Credentials): Promise<any> => {
        try {
            const { data } = await axios.post(`${baseURL}/credential/create`, credentials, { headers });

            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Credential', detail: data.message, life: 3000 })
                }, 1000);

                return data;
            } else {
                toast.current?.show({ severity: 'info', summary: 'Credential', detail: data.message, life: 3000 })
            }
        } catch (error) {
            handleRequestError(error);
        }
    }

    // Get All Credentials
    const getAllCredentials = async (page?: number, limit?: number, query?: string, sortField?: string, sortOrder?: number): Promise<any> => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/credential/search-credential`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers: headers });
            } else {
                res = await axios.get(`${baseURL}/credential`, { params: { page, limit, sortField, sortOrder }, headers });
            }

            if (res.data.error === false) {
                return res.data;
            }
        } catch (error) {
            handleRequestError(error);
        }
    }

    // Delete Credentials
    const deleteCredentials = async (id: string): Promise<void> => {
        try {
            const { data } = await axios.delete(`${baseURL}/credential/delete/${id}`, { headers });

            if (data.error === false) {
                getAllCredentials()
                toast.current?.show({ severity: 'success', summary: 'Credential', detail: data.message, life: 3000 })
            }
        } catch (error) {
            handleRequestError(error);
        }
    }

    // Update Credentials
    const updateCredential = async (credentialData: Credentials, id: string): Promise<any> => {
        try {
            const { data } = await axios.put(`${baseURL}/credential/update/${id}`, credentialData, { headers })

            if (data.error === false) {
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Credential', detail: data.message, life: 3000 })
                }, 1000);

                return data
            } else {
                toast.current?.show({ severity: 'info', summary: 'Credential', detail: data.message, life: 3000 })
            }
        } catch (error) {
            handleRequestError(error);
        }
    }

    // Get single Credentials
    const getSingleCredential = async (id: string): Promise<any | undefined> => {
        try {
            const { data } = await axios.get(`${baseURL}/credential/single-credential/${id}`, { headers });
            return data.credential;
        } catch (error) {
            handleRequestError(error);
        }
    };

    const handleRequestError = (error: any) => {
        if (error.response) {
            const errors = error.response.data.errors;
            if (errors && Array.isArray(errors) && errors.length > 0) {
                if (errors.length > 1) {
                    toast?.current?.show({ severity: 'error', summary: 'Credential', detail: "Please fill all fields.", life: 3000 })
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Credential', detail: errors[0].msg, life: 3000 })
                }
            }
        } else {
            toast.current?.show({ severity: 'error', summary: 'Credential', detail: 'An error occurred. Please try again later.', life: 3000 })
        }
    }

    return (
        <CredentialsContext.Provider value={{ addCredentials, getAllCredentials, getSingleCredential, updateCredential, deleteCredentials }}>
            {children}
        </CredentialsContext.Provider>
    );
}

const useCredential = (): CredentialsContextProps => {
    const context = useContext(CredentialsContext);
    if (!context) {
        throw new Error("useCredential must be used within a CredentialProvider");
    }
    return context;
}

export { useCredential, CredentialProvider };
