import React, { createContext, useContext, ReactNode } from "react";
import { baseURL } from "../lib";
import { useAuth } from "./AuthContext";
import axios from 'axios';

interface ProjectContextType {
    getProject: (page?: number, limit?: number, query?: any, sortField?: string, sortOrder?: string) => Promise<any>;
    fetchProjects: () => Promise<any>;
    getSingleProject: (id: string) => Promise<any>;
    createProject: (addproject: any) => Promise<any>;
    updateProject: (project: any, id: string) => Promise<any>;
    deleteProject: (id: string) => Promise<void>;
    userProject: (page?: number, limit?: number, query?: any, sortField?: string, sortOrder?: string) => Promise<any>;
    getUserProject: () => Promise<any>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
    children: ReactNode;
}

const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
    const { auth, toast } = useAuth();

    const headers = {
        Authorization: auth?.token
    };

    //get projects
    const fetchProjects = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/projects/project-list`, { headers });
            if (data.error === false) {
                return data
            }
        } catch (error) {
            console.log(error);
        }
    };

    //getProjects
    const getProject = async (page?: number, limit?: number, query?: string, sortField?: string, sortOrder?: string) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/projects/project-search`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers });
            } else {
                res = await axios.get(`${baseURL}/projects`, { params: { page, limit, sortField, sortOrder }, headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    };

    //get single project
    const getSingleProject = async (id: string) => {
        try {
            const { data } = await axios.get(`${baseURL}/projects/single-project/${id}`, { headers });
            return data
        } catch (error) {
            console.log(error);
        }
    }

    //add project
    const createProject = async (addproject: any) => {
        try {
            const { data } = await axios.post(`${baseURL}/projects/create`, addproject, { headers });

            if (data.error === false) {
                // getProject()
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Project', detail: data.message, life: 3000 })
                }, 1000);
                return data;
            } else {
                toast.current?.show({ severity: 'info', summary: 'Project', detail: data.message, life: 3000 })
            }
        } catch (error: any) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    if (errors.length > 1) {
                        toast.current?.show({ severity: 'error', summary: 'Project', detail: "Please fill all fields.", life: 3000 })
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Project', detail: errors[0].msg, life: 3000 })
                    }
                }
            } else {    
                toast.current?.show({ severity: 'error', summary: 'Project', detail: 'An error occurred. Please try again later.', life: 3000 })
            }
        }
    }

    //update project
    const updateProject = async (project: any, id: string) => {
        try {
            const { data } = await axios.put(`${baseURL}/projects/update-project/${id}`, project, { headers });

            if (data.error === false) {
                // getProject()
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: 'Project', detail: data.message, life: 3000 })
                }, 1000);
                return data;
            } else {
                toast.current?.show({ severity: 'info', summary: 'Project', detail: data.message, life: 3000 })
            }
        } catch (error) {
            console.log(error);
        }
    }

    //delete project
    const deleteProject = async (id: string) => {
        try {
            const { data } = await axios.delete(`${baseURL}/projects/delete-project/${id}`, { headers });
            if (data.error === false) {
                // getProject()
                toast.current?.show({ severity: 'success', summary: 'Project', detail: data.message, life: 3000 })
            }
        } catch (error) {
            console.log(error);
        }
    }

    //users project
    const userProject = async (page?: number, limit?: number, query?: string, sortField?: string, sortOrder?: string) => {
        try {
            let res;
            if (query) {
                res = await axios.post(`${baseURL}/projects/search-project-list`, { filter: query }, { params: { page, limit, sortField, sortOrder }, headers });
            } else {
                res = await axios.get(`${baseURL}/projects/developer-project-list`, { params: { page, limit, sortField, sortOrder }, headers });
            }
            if (res.data.error === false) {
                return res.data
            }
        } catch (error) {
            console.log(error);
        }
    }

    //get users project
    const getUserProject = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/projects/user-project-list`, { headers });
            if (data.error === false) {
                return data
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <ProjectContext.Provider value={{ getProject, fetchProjects, getSingleProject, createProject, updateProject, deleteProject, userProject, getUserProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

const useProject = (): ProjectContextType => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};

export { useProject, ProjectProvider };
