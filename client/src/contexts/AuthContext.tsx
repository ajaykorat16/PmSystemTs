import React, { useState, useEffect, createContext, ReactNode, useRef, useContext } from "react";
import { baseURL } from "../lib";
import { Types } from "mongoose";
import axios from 'axios';

enum Role {
    Admin = 'admin',
    User = 'user'
}

interface IProject {
    id: Types.ObjectId;
}

interface AuthUser {
    _id?: string;
    employeeNumber: number;
    firstname: string;
    lastname: string;
    fullName: string;
    email: string;
    password: string;
    phone: number;
    address: string;
    dateOfBirth: Date;
    department: Types.ObjectId;
    dateOfJoining: Date;
    status?: string;
    leaveBalance?: number;
    photo?: {
        data: Buffer | null;
        contentType: string | null;
    };
    role?: Role;
    carryForward?: number;
    projects?: IProject[];
}


interface AuthState {
    user: AuthUser | null;
    token: string | '';
}

interface AuthContextType {
    auth: AuthState;
    adminAuth: AuthState;
    isLoggedIn: boolean;
    toast: React.MutableRefObject<null | ToastType>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loginUserByAdmin: (email: string) => Promise<void>;
    backToAdmin: () => Promise<void>;
}

interface ToastType {
    show: (options: {
        severity: string;
        summary: string;
        detail: string;
        life: number;
    }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [auth, setAuth] = useState<AuthState>({
        user: null,
        token: ""
    });

    const [adminAuth, setAdminAuth] = useState<AuthState>({
        user: null,
        token: ""
    });

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const toast = useRef<any>();

    const logout = () => {
        try {
            const data = localStorage.getItem('auth');
            if (data) {
                localStorage.removeItem("auth");
                setAuth({
                    user: null,
                    token: ""
                });
                setIsLoggedIn(false);
            }

            const adminAuth = localStorage.getItem("adminAuth");
            if (adminAuth) {
                localStorage.removeItem("adminAuth");
                setAdminAuth({
                    user: null,
                    token: ""
                });
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    axios.defaults.headers.common["Authorization"] = auth?.token;

    const login = async (email: string, password: string) => {
        try {
            console.log(baseURL)
            const { data } = await axios.post(`${baseURL}/user/login`, { email, password });

            if (data.error === false) {
                setIsLoggedIn(true);
                setTimeout(function () {
                    toast.current?.show({ severity: 'success', summary: data.user.fullName, detail: data.message, life: 3000 });
                }, 500);
                setAuth({
                    ...auth,
                    user: data.user,
                    token: data.token
                });
                localStorage.setItem('auth', JSON.stringify(data));
            }
        } catch (error: any) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    toast.current?.show({ severity: 'error', summary: 'Login', detail: "Please fill all fields.", life: 3000 });
                } else {
                    const errorMessage = error.response.data.message;
                    toast.current?.show({ severity: 'error', summary: 'Login', detail: errorMessage, life: 3000 });
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Login', detail: 'An error occurred. Please try again later.', life: 3000 });
            }
        }
    };

    const loginUserByAdmin = async (email: string) => {
        try {
            const { data } = await axios.post(`${baseURL}/user/loginByAdmin`, { email });
            if (data.error === false) {
                setIsLoggedIn(true);

                let auth = localStorage.getItem('auth');
                if (auth) {
                    localStorage.setItem('adminAuth', auth);
                    const parseData = JSON.parse(auth);
                    setAdminAuth({
                        ...adminAuth,
                        user: parseData.user,
                        token: parseData.token
                    });
                    localStorage.removeItem("auth");

                    setAuth((prevAuth) => ({
                        ...prevAuth,
                        user: data.user,
                        token: data.token
                    }));

                    localStorage.setItem('auth', JSON.stringify(data));
                }
            }
        } catch (error: any) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    toast.current?.show({ severity: 'error', summary: 'Login', detail: "Please fill all fields.", life: 3000 });
                } else {
                    const errorMessage = error.response.data.message;
                    toast.current?.show({ severity: 'error', summary: 'Login', detail: errorMessage, life: 3000 });
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Login', detail: 'An error occurred. Please try again later.', life: 3000 });
            }
        }
    };

    const backToAdmin = async () => {
        try {
            let auth = localStorage.getItem('adminAuth');
            let parseData: any;
            if (auth !== null) {
                parseData = JSON.parse(auth);
            }

            const { data } = await axios.post(`${baseURL}/user/loginByAdmin`, { email: parseData?.user.email });
            if (data.error === false) {
                setIsLoggedIn(true);

                if (auth) {
                    localStorage.removeItem("adminAuth");
                    setAdminAuth({
                        ...adminAuth,
                        user: null,
                        token: ''
                    });
                    setAuth((prevAuth) => ({
                        ...prevAuth,
                        user: data.user,
                        token: data.token
                    }));

                    localStorage.setItem('auth', JSON.stringify(data));
                }
            }
        } catch (error: any) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    toast.current?.show({ severity: 'error', summary: 'Login', detail: "Please fill all fields.", life: 3000 });
                } else {
                    const errorMessage = error.response.data.message;
                    toast.current?.show({ severity: 'error', summary: 'Login', detail: errorMessage, life: 3000 });
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Login', detail: 'An error occurred. Please try again later.', life: 3000 });
            }
        }
    };

    useEffect(() => {
        const data = localStorage.getItem('auth');
        if (data) {
            const parseData = JSON.parse(data);
            setAuth({
                ...auth,
                user: parseData.user,
                token: parseData.token
            });
        }

        const adminData = localStorage.getItem('adminAuth');
        if (adminData) {
            const parseData = JSON.parse(adminData);
            setAdminAuth({
                ...adminAuth,
                user: parseData.user,
                token: parseData.token
            });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ auth, login, logout, isLoggedIn, adminAuth, loginUserByAdmin, backToAdmin, toast }}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = () => {
    const authConsumer = useContext(AuthContext);
    if (!authConsumer) {
        throw new Error("Error in Authprovider");

    }
    return authConsumer;
}