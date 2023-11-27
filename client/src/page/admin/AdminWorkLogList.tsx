import React, { useEffect, useState } from "react";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";
import { DataTable, DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ScrollPanel } from "primereact/scrollpanel";
import { useWorkLog } from "../../contexts/WorkLogContext";
import { useProject } from "../../contexts/ProjectContext";
import { useUser } from "../../contexts/UserContext";
import Layout from "../Layout";
import Loader from "../../components/Loader";

interface AdminWorkLogListProps {
    title: string;
}

const AdminWorkLogList: React.FC<AdminWorkLogListProps> = ({ title }) => {
    const { getAdminWorkLog } = useWorkLog();
    const { fetchProjects } = useProject();
    const { fetchUsers } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [worklogList, setWorklogList] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<any>(-1);
    const [visible, setVisible] = useState(false);
    const [filter, setFilter] = useState<{ userId: string | null, project: string | null, logDate: Date | null }>({ userId: null, project: null, logDate: null });
    const [worklog, setWorklog] = useState({
        userId: "",
        project: "",
        description: "",
        logDate: "",
        time: "",
    });

    const fetchWorklog = async (filter: any, sortField: string, sortOrder: string) => {
        setIsLoading(true);
        let worklogData = await getAdminWorkLog(currentPage, rowsPerPage, filter, sortField, sortOrder);
        const totalRecordsCount = worklogData.totalWorklog;
        setTotalRecords(totalRecordsCount);
        setWorklogList(worklogData.worklog);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchWorklog(filter, sortField, sortOrder);
    }, [currentPage, rowsPerPage, filter, sortField, sortOrder]);

    const getRecords = async () => {
        const { getAllUsers } = await fetchUsers();
        setUsers(getAllUsers);
        const { getAllProjects } = await fetchProjects();
        setProjects(getAllProjects);
    };

    useEffect(() => {
        getRecords();
    }, []);

    const onPageChange = (event: { first: number; rows: number }) => {
        const currentPage = Math.floor(event.first / event.rows) + 1;
        setCurrentPage(currentPage);
        const newRowsPerPage = event.rows;
        setRowsPerPage(newRowsPerPage);
    };

    const hanldeSorting = async (e: DataTableStateEvent) => {
        const field = e.sortField;
        const order = e.sortOrder!;
        setSortField(field);
        setSortOrder(order);
        fetchWorklog(null, field, order.toString());
    };

    const userOptions = users.map((user) => ({ label: user.fullName, value: user._id }));
    const projectOptions = projects.map((project) => ({ label: project.name, value: project._id }));

    const handleWorklogDetail = async (worklog: any) => {
        setVisible(true);
        setWorklog({
            userId: worklog.userId.fullName,
            project: worklog.project.name,
            description: worklog.description,
            logDate: worklog.logDate,
            time: worklog.time,
        });
    };

    const clearFilter = () => {
        setFilter({ userId: null, project: null, logDate: null });
    };

    return (
        <Layout title={title}>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <CModal
                        alignment="center"
                        visible={visible}
                        onClose={() => setVisible(false)}
                        className="mainBody"
                    >
                        <CModalHeader>
                            <CModalTitle>
                                <strong>{worklog.userId}</strong>
                            </CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <div>
                                <p>
                                    <strong>{worklog.project}</strong>
                                </p>
                            </div>
                            <div className="description">
                                <ScrollPanel
                                    className="custom"
                                >
                                    <div className="description" dangerouslySetInnerHTML={{ __html: worklog.description }} />
                                </ScrollPanel>
                            </div>
                            <div className="d-flex justify-content-end">
                                <p>
                                    <strong>{worklog.logDate}</strong>
                                </p>
                            </div>
                            <div className="d-flex justify-content-end">
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
                            <div>
                                <Button type="button" severity="info" icon="pi pi-filter-slash" label="Clear Filters" onClick={clearFilter} rounded raised />
                            </div>
                        </div>
                        <DataTable
                            totalRecords={totalRecords}
                            lazy
                            paginator
                            sortField={sortField}
                            sortOrder={sortOrder}
                            filterDisplay="row"
                            onSort={hanldeSorting}
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
                            <Column
                                field="userId.fullName"
                                header="Developer"
                                showFilterMenu={false}
                                filter
                                filterElement={
                                    <Dropdown value={filter.userId} options={userOptions} onChange={(e) => setFilter({ ...filter, userId: e.value })} showClear />
                                }
                                align="center"
                            />
                            <Column
                                field="project.name"
                                header="Project"
                                showFilterMenu={false}
                                filter
                                filterElement={
                                    <Dropdown value={filter.project} options={projectOptions} onChange={(e) => setFilter({ ...filter, project: e.value })} showClear />
                                }
                                align="center"
                            />
                            <Column
                                field="logDate"
                                header="Log Date"
                                showFilterMenu={false}
                                style={{ maxWidth: "10rem" }}
                                filter
                                filterElement={
                                    <Calendar
                                        value={filter.logDate}
                                        dateFormat="dd-mm-yy"
                                        onChange={(e) => setFilter({ ...filter, logDate: e.value || null })}
                                        maxDate={new Date()}
                                        showIcon
                                        style={{ marginRight: "5px" }}
                                    />
                                }
                                align="center"
                            />
                            <Column field="time" header="Time" filterField="time" align="center" />
                            <Column
                                field="action"
                                header="Action"
                                body={(rowData) => (
                                    <div>
                                        <>
                                            <Button
                                                icon="pi pi-eye"
                                                title="View Work Log"
                                                rounded
                                                severity="success"
                                                className="ms-2"
                                                aria-label="Cancel"
                                                onClick={() => handleWorklogDetail(rowData)}
                                            />
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
};

export default AdminWorkLogList;
