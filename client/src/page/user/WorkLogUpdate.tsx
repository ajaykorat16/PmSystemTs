import React, { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { CButton, CCol, CForm, CFormInput, CFormSelect } from '@coreui/react';
import { Calendar } from 'primereact/calendar';
import { Editor } from 'primereact/editor';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkLog } from '../../contexts/WorkLogContext';
import { useHelper } from '../../contexts/Helper';
import { useProject } from '../../contexts/ProjectContext';
import Layout from '../Layout';

interface UserWorkLogUpdateProps {
    title: string;
}

const WorkLogUpdate: React.FC<UserWorkLogUpdateProps> = ({ title }) => {
    const navigate = useNavigate();
    const params = useParams<{ id: any }>();
    const { updateWorkLog, getSingleWorkLog } = useWorkLog();
    const { fetchProjects } = useProject();
    const { formatDate } = useHelper();
    const { toast } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [selectproject, setSelectProject] = useState<string>('');
    const [description, setDescription] = useState<string | null>(null);
    const [logDate, setLogDate] = useState<Date | null>(null);
    const [time, setTime] = useState<string>('');

    const getProjects = async () => {
        const { getAllProjects } = await fetchProjects();
        setProjects(getAllProjects);
    };

    useEffect(() => {
        getProjects();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { worklog } = await getSingleWorkLog(params.id);
                if (worklog) {
                    setSelectProject(worklog.project ? worklog.project._id : '');
                    setDescription(worklog.description);
                    setLogDate(new Date(worklog.logDate));
                    setTime(worklog.time);
                }
            } catch (error: any) {
                console.log(error.message);
            }
        };
        fetchData();
    }, [params.id, getSingleWorkLog]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const worklog = { project: selectproject, description, logDate: formatDate(logDate), time };
            const id = params.id;
            const data = await updateWorkLog(worklog, id);
            if (data.error) {
                toast.current?.show({ severity: 'error', summary: 'Worklog', detail: data.message, life: 3000 })
            } else {
                navigate('/dashboard-user/workLog/list');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Layout title={title} toast={toast}>
            <div className="mb-3">
                <h2 className="mb-5 mt-2">Update Work Log</h2>
            </div>
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol xs={4}>
                    <CFormSelect
                        id="inputProject"
                        label="Project"
                        value={selectproject}
                        onChange={(e) => setSelectProject(e.target.value)}
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
                    <CFormInput id="inputTime" label="Time" type="number" value={time} onChange={(e) => setTime(e.target.value)} />
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

export default WorkLogUpdate;
