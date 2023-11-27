import React, { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { CButton, CCol, CForm, CFormInput, CFormSelect } from '@coreui/react';
import { Calendar } from 'primereact/calendar';
import { Editor } from 'primereact/editor';
import { useNavigate } from 'react-router-dom';
import { useWorkLog } from '../../contexts/WorkLogContext';
import { useProject } from '../../contexts/ProjectContext';
import { useHelper } from '../../contexts/Helper';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../Layout';

interface WorkLogCreateProps {
    title: string;
}

const WorkLogCreate: React.FC<WorkLogCreateProps> = ({ title }) => {
    const navigate = useNavigate();
    const { createWorkLog } = useWorkLog();
    const { getUserProject } = useProject();
    const { formatDate } = useHelper();
    const { toast } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [selectproject, setSelectProject] = useState<string>('');
    const [description, setDescription] = useState<string | null>(null);
    const [logDate, setLogDate] = useState<Date>(new Date());
    const [time, setTime] = useState<string>('');

    const getProjects = async () => {
        const { project } = await getUserProject();
        setProjects(project);
    };

    useEffect(() => {
        getProjects();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const addWorkLog = { project: selectproject, description, logDate: formatDate(logDate), time };
            const data = await createWorkLog(addWorkLog);
            if (typeof data !== 'undefined' && data.error === false) {
                navigate('/dashboard-user/workLog/list');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Layout title={title} toast={toast}>
            <div className="mb-3">
                <h2 className="mb-5 mt-2">Create Work Log</h2>
            </div>
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol xs={4}>
                    <CFormSelect
                        id="inputProject"
                        label="Project"
                        value={selectproject}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectProject(e.target.value)}
                    >
                        <option value="" disabled>
                            Select a project
                        </option>
                        {projects.map((p) => (
                            <option key={p._id} value={p._id}>
                                {p.name}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={4}>
                    <CFormInput id="inputTime" label="Time" type="number" value={time} min={0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)} />
                </CCol>
                <CCol md={4}>
                    <label className="form-label">Log Date</label>
                    <Calendar
                        value={logDate}
                        dateFormat="dd-mm-yy"
                        onChange={(e) => setLogDate(e.target.value as Date)}
                        maxDate={new Date()}
                        showIcon
                        id="date"
                    />
                </CCol>
                <CCol md={12}>
                    <label className="mb-2">Description</label>
                    <div className="card">
                        <Editor value={description || ''} onTextChange={(e) => setDescription(e.htmlValue)} className="editorContainer" />
                    </div>
                </CCol>
                <CCol xs={12}>
                    <CButton type="submit">Submit</CButton>
                </CCol>
            </CForm>
        </Layout>
    );
};

export default WorkLogCreate;
