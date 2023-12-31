import React, { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { CCol, CFormInput, CButton, CForm } from "@coreui/react";
import { MultiSelect } from "primereact/multiselect";
import { Editor } from 'primereact/editor';
import { Calendar } from "primereact/calendar";
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "../../contexts/UserContext";
import { useProject } from "../../contexts/ProjectContext";
import { useHelper } from "../../contexts/Helper";
import Layout from "../Layout";

interface ProjectUpdateProps {
    title: string;
}

const ProjectUpdate: React.FC<ProjectUpdateProps> = ({ title }) => {
    const { toast } = useAuth();
    const { fetchUsers } = useUser();
    const { formatDate, onShow } = useHelper();
    const { getSingleProject, updateProject } = useProject();
    const [users, setUsers] = useState<any[]>([]);
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<any>("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [developers, setDevelopers] = useState<string[]>([]);
    const navigate = useNavigate();
    const params = useParams<{ id: any }>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let { project } = await getSingleProject(params.id);
                setName(project.name);
                setStartDate(new Date(project.startDate));
                setDescription(project.description);
                if (project.developers && project.developers.length > 0) {
                    setDevelopers(project.developers.map((e: any) => e.id._id));
                } else {
                    setDevelopers([]);
                }
            } catch (error: any) {
                console.log(error.message);
            }
        };
        fetchData();
    }, [params.id, getSingleProject]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let project = { name, description, startDate: formatDate(startDate), developers: developers };
            let id: any = params.id;

            const data = await updateProject(project, id);
            if (data.error) {
                toast.current?.show({ severity: 'error', summary: 'Project', detail: data.message, life: 3000 });
            } else {
                navigate('/dashboard/project/list');
            }
        } catch (error) {
            console.log(error);
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
                <h2 className="mb-5 mt-2">Update Project</h2>
            </div>
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={6}>
                    <CFormInput id="inputName" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                </CCol>
                <CCol md={6}>
                    <label className="form-label">Date</label>
                    <Calendar
                        value={startDate}
                        dateFormat="dd-mm-yy"
                        onChange={(e) => setStartDate(e.value as Date)}
                        maxDate={new Date()}
                        showIcon
                        id="date"
                    />
                </CCol>
                <CCol xs={12}>
                    <label htmlFor="developerSelect" className="form-label">Developers</label>
                    <MultiSelect
                        value={developers}
                        onChange={(e) => setDevelopers(e.value as string[])}
                        options={users}
                        size={6}
                        style={{ border: "1px solid var(--cui-input-border-color, #b1b7c1)", borderRadius: "6px" }}
                        optionLabel="fullName"
                        placeholder="Select Users"
                        optionValue='_id'
                        id="developerSelect"
                        className="form-control"
                        onShow={onShow}
                    />
                </CCol>
                <CCol md={12}>
                    <label className='mb-2'>Description</label>
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

export default ProjectUpdate;
