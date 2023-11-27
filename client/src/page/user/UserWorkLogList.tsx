import React, { useEffect, useState } from "react";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable, DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ScrollPanel } from "primereact/scrollpanel";
import { useNavigate } from "react-router-dom";
import { useWorkLog } from "../../contexts/WorkLogContext";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../../components/Loader";
import Layout from "../Layout";
import "../../styles/Styles.css";

interface UserWorkLogListProps {
    title: string;
}

const UserWorkLogList: React.FC<UserWorkLogListProps> = ({ title }) => {
    const navigate = useNavigate();
    const { toast } = useAuth();
    const { getWorkLog, deleteWorkLog } = useWorkLog();
    const [isLoading, setIsLoading] = useState(true);
    const [worklogList, setWorklogList] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [sortField, setSortField] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<any>(-1);
    const [visible, setVisible] = useState(false);
    const [worklog, setWorklog] = useState<any>({ project: "", description: "", logDate: "", time: "" });

    const fetchWorklog = async (currentPage: number, rowsPerPage: number, query: string, sortField: string, sortOrder: string) => {
        setIsLoading(true);
        let worklogData = await getWorkLog(currentPage, rowsPerPage, query, sortField, sortOrder);

        const totalRecordsCount = worklogData.totalWorklog;
        setTotalRecords(totalRecordsCount);
        setWorklogList(worklogData.worklog);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchWorklog(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
    }, [currentPage, rowsPerPage, sortField, sortOrder]);

    const handleSubmit = async () => {
        setCurrentPage(1);
        fetchWorklog(1, rowsPerPage, globalFilterValue, sortField, sortOrder);
    };

    useEffect(() => {
        if (globalFilterValue.trim() === "") {
            fetchWorklog(currentPage, rowsPerPage, "", sortField, sortOrder);
        }
    }, [globalFilterValue]);

    const handleDelete = async (id: string) => {
        confirmDialog({
            message: 'Are you sure you want to delete this worklog?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            position: 'top',
            accept: async () => {
                await deleteWorkLog(id);
                fetchWorklog(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
            },
        });
    };

    const handleUpdate = async (id: string) => {
        navigate(`/dashboard-user/workLog/update/${id}`);
    };

    const onPageChange = (event: { first: number; rows: number }) => {
        const newCurrentPage = Math.floor(event.first / event.rows) + 1;
        setCurrentPage(newCurrentPage);
        const newRowsPerPage = event.rows;
        setRowsPerPage(newRowsPerPage);
    };

    const handleSorting = async (e: DataTableStateEvent) => {
        const field = e.sortField;
        const order = e.sortOrder ?? "";
        setSortField(field);
        setSortOrder(order);
        fetchWorklog(currentPage, rowsPerPage, globalFilterValue, field, order.toString());
    };

    const handleWorklogDetail = async (worklog: any) => {
        setVisible(true)
        setWorklog({
            userId: worklog.userId.fullName,
            project: worklog.project.name,
            description: worklog.description,
            logDate: worklog.logDate,
            time: worklog.time
        });
    }

    return (
        <Layout title={title} toast={toast}>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <ConfirmDialog />
                    <CModal
                        alignment="center"
                        visible={visible}
                        onClose={() => setVisible(false)}
                        className='mainBody'
                    >
                        <CModalHeader>
                            <CModalTitle><strong>{worklog.project}</strong></CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <div className='description'>
                                <ScrollPanel style={{ width: '100%', height: '20rem' }} className="custom">
                                    <div className="description" dangerouslySetInnerHTML={{ __html: worklog.description }} />
                                </ScrollPanel>
                            </div>
                            <div className='d-flex justify-content-end mt-3'>
                                <p>
                                    <strong>{worklog.logDate}</strong>
                                </p>
                            </div>
                            <div className='d-flex justify-content-end '>
                                <p>
                                    <strong>Time: {worklog.time} h</strong>
                                </p>
                            </div>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" onClick={() => setVisible(false)}>
                                Ok
                            </CButton>
                        </CModalFooter>
                    </CModal>
                    <div className="card mb-5">
                        <div className="mainHeader d-flex align-items-center justify-content-between">
                            <div>
                                <h4>Work Log</h4>
                            </div>
                            <div className="d-flex">
                                <form onSubmit={handleSubmit}>
                                    <div className="p-inputgroup ">
                                        <span className="p-inputgroup-addon">
                                            <i className="pi pi-search" />
                                        </span>
                                        <InputText type="search" value={globalFilterValue} onChange={(e) => setGlobalFilterValue(e.target.value)} placeholder="Search" />
                                    </div>
                                </form>
                                <div className="ms-3">
                                    <CButton
                                        onClick={() => navigate('/dashboard-user/workLog/create')}
                                        title="Create Work Log"
                                        className="btn btn-light"
                                        style={{ height: "40px" }}
                                    >
                                        <i className="pi pi-plus" />
                                    </CButton>
                                </div>
                            </div>
                        </div>
                        <DataTable
                            totalRecords={totalRecords}
                            lazy
                            paginator
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onSort={handleSorting}
                            rows={rowsPerPage}
                            value={worklogList}
                            first={(currentPage - 1) * rowsPerPage}
                            onPage={onPageChange}
                            dataKey="_id"
                            emptyMessage="No work log found."
                            paginatorLeft={
                                <Dropdown value={rowsPerPage} options={[10, 25, 50]} onChange={(e) => setRowsPerPage(e.value)} />
                            }
                        >
                            <Column field="project.name" sortField="project" header="Project Name" sortable filterField="Project" align="center" />
                            <Column field="logDate" sortable header="Log Date" filterField="logDate" align="center" />
                            <Column field="time" sortable header="Time" filterField="time" align="center" />
                            <Column
                                field="action"
                                header="Action"
                                body={(rowData) => (
                                    <div>
                                        <>
                                            <Button icon="pi pi-eye" title="View Work Log" rounded severity="info" aria-label="view" onClick={() => handleWorklogDetail(rowData)} />
                                            <Button icon="pi pi-pencil" title="Edit" rounded className="ms-2" severity="success" aria-label="edit" onClick={() => handleUpdate(rowData._id)} />
                                            <Button icon="pi pi-trash" title="Delete" rounded severity="danger" className="ms-2" aria-label="delete" onClick={() => handleDelete(rowData._id)} />
                                        </>
                                    </div>
                                )}
                                align="center"
                            />
                        </DataTable>
                    </div>
                </>
            )}
        </Layout>
    );
}

export default UserWorkLogList;
