import React, { useEffect, useState, FormEvent } from "react";
import "react-quill/dist/quill.snow.css";
import {
    CCol,
    CFormInput,
    CButton,
    CForm,
} from "@coreui/react";
import { MultiSelect } from "primereact/multiselect";
import { Editor } from 'primereact/editor';
import { useNavigate } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import { useUser } from "../../contexts/UserContext";
import { useProject } from "../../contexts/ProjectContext";
import { useAuth } from "../../contexts/AuthContext";
import Layout from "../Layout";

interface ProjectCreateProps {
    title: string;
}

const ProjectCreate: React.FC<ProjectCreateProps> = ({ title }) => {
    const { fetchUsers } = useUser();
    // const { formatDate, onShow } = useHelper();
    const { createProject } = useProject();
    const { toast } = useAuth();
    const [users, setUsers] = useState<any[]>([]); // You may need to replace 'any' with a more specific type
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<any>("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [developers, setDevelopers] = useState<any[]>([]); // You may need to replace 'any' with a more specific type
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const addProject = {
                name,
                description,
                // startDate: startDate ? formatDate(startDate) : null,
                startDate: startDate,
                developers: developers.map((dev) => ({ id: dev._id })),
            };
            const data = await createProject(addProject);
            if (typeof data !== 'undefined' && data.error === false) {
                navigate('/dashboard/project/list');
            }
        } catch (error: any) {
            console.log(error.message);
        }
    };

    const getUsers = async () => {
        const { getAllUsers } = await fetchUsers();
        setUsers(getAllUsers);
    };

    useEffect(() => {
        getUsers();
    }, []);

    return (
        <Layout title={title}>
            <div className="mb-3">
                <h2 className="mb-5 mt-2">Create Project</h2>
            </div>
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={6}>
                    <CFormInput
                        id="inputName"
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </CCol>
                <CCol md={6}>
                    <label className="form-label">Date</label>
                    <Calendar
                        value={startDate}
                        dateFormat="dd-mm-yy"
                        onChange={(e) => setStartDate(e.value || null)}
                        maxDate={new Date()}
                        showIcon
                        id="date"
                    />
                </CCol>
                <CCol xs={12}>
                    <label htmlFor="developerSelect" className="form-label">
                        Developers
                    </label>
                    <MultiSelect
                        value={developers}
                        onChange={(e) => setDevelopers(e.value)}
                        options={users}
                        size={6}
                        style={{
                            border:
                                "1px solid var(--cui-input-border-color, #b1b7c1)",
                            borderRadius: "6px",
                        }}
                        optionLabel="fullName"
                        placeholder="Select Users"
                        id="developerSelect"
                        className="form-control"
                    // onShow={onShow}
                    />
                </CCol>
                <CCol md={12}>
                    <label className="mb-2">Description</label>
                    <div className="card">
                        <Editor
                            value={description}
                            onTextChange={(e) => setDescription(e.htmlValue)}
                            className="editorContainer"
                        />
                    </div>
                </CCol>
                <CCol xs={12}>
                    <CButton type="submit">Submit</CButton>
                </CCol>
            </CForm>
        </Layout>
    );
};

export default ProjectCreate;
