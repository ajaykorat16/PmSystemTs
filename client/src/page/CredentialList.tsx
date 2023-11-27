import React, { useEffect, useState } from "react";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable, DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { CButton } from "@coreui/react";
import { DOMParser } from 'xmldom';
import { useCredential } from "../contexts/CredentialContext";
import { useAuth } from "../contexts/AuthContext";
import Layout from "./Layout";
import Loader from "../components/Loader";
import "../styles/Styles.css";

interface CredentialListProps {
    title: string;
}

const CredentialList: React.FC<CredentialListProps> = ({ title }) => {
    const { getAllCredentials, deleteCredentials } = useCredential();
    const [isLoading, setIsLoading] = useState(true);
    const { auth, toast } = useAuth();
    const [credentialList, setCredentialList] = useState<Credential[]>([]); // Specify the type for Credential
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
    const [sortField, setSortField] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<any>(-1);
    const navigate = useNavigate();
    

    const fetchCredential = async (currentPage: number, rowsPerPage: number, query: string, sortField: string, sortOrder: number) => {
        setIsLoading(true);
        let credentialData = await getAllCredentials(currentPage, rowsPerPage, query, sortField, sortOrder);

        const totalRecordsCount = credentialData?.totalCredential;
        setTotalRecords(totalRecordsCount);
        setCredentialList(credentialData?.credential);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCredential(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
    }, [currentPage, rowsPerPage, sortField, sortOrder]);

    const handleSubmit = async () => {
        setCurrentPage(1);
        fetchCredential(1, rowsPerPage, globalFilterValue, sortField, sortOrder);
    };

    useEffect(() => {
        if (globalFilterValue.trim() === "") {
            setCurrentPage(1);
            fetchCredential(1, rowsPerPage, "", sortField, sortOrder);
        }
    }, [globalFilterValue, rowsPerPage, sortField, sortOrder]);

    const handleDelete = async (id: string) => {
        confirmDialog({
            message: 'Are you sure you want to delete this Credentials?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            position: 'top',
            accept: async () => {
                await deleteCredentials(id);
                await fetchCredential(currentPage, rowsPerPage, globalFilterValue, sortField, sortOrder);
            },
        });
    };

    const handleUpdate = async (id: string) => {
        const redirectPath = auth.user?.role === "admin" ? `/dashboard/credential/update/${id}` : `/dashboard-user/credential/update/${id}`;
        navigate(redirectPath);
    };

    const onPageChange = (event: { first: number; rows: number }) => {
        const newCurrentPage = Math.floor(event.first / event.rows) + 1;
        setCurrentPage(newCurrentPage);
        const newRowsPerPage = event.rows;
        setRowsPerPage(newRowsPerPage);
    };

    const hanldeSorting = async (e: DataTableStateEvent) => {
        const field = e.sortField;
        const order:any = e.sortOrder;
        setSortField(field);
        setSortOrder(order);
        fetchCredential(currentPage, rowsPerPage, globalFilterValue, field, order);
    };

    const handleCredentialDetail = async (id: string) => {
        const redirect = auth?.user?.role === "admin" ? `/dashboard/credential/view/${id}` : `/dashboard-user/credential/view/${id}`;
        navigate(redirect);
    };

    // function parseHtmlToText(html: string): string {
    //     const doc = new DOMParser().parseFromString(html, 'text/html');
    //     return doc.documentElement.textContent || "";
    // }

    return (
        <Layout title={title} toast={toast}>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <ConfirmDialog />
                    <div className="card mb-5">
                        <div className="mainHeader d-flex align-items-center justify-content-between">
                            <div>
                                <h4>Credentials</h4>
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
                                        onClick={() => { auth?.user?.role === "admin" ? navigate('/dashboard/credential/create') : navigate('/dashboard-user/credential/create') }}
                                        title="Create Credentials"
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
                            onSort={hanldeSorting}
                            rows={rowsPerPage}
                            value={credentialList}
                            first={(currentPage - 1) * rowsPerPage}
                            onPage={onPageChange}
                            dataKey="_id"
                            emptyMessage="No credentials found."
                            paginatorLeft={
                                <Dropdown value={rowsPerPage} options={[10, 25, 50]} onChange={(e) => setRowsPerPage(e.value)} />
                            }
                        >
                        <Column field="title" header="Title" sortable filterField="title" align="center" />
                        <Column
                            field="description"
                            header="Description"
                            sortable
                            filterField="description"
                            body={(rowData) => {
                                if (rowData.description !== "") {
                                    // let description = parseHtmlToText(rowData.description);
                                    // if (description.length > 30) {
                                    //     description = description.substring(0, 30) + '...';
                                    // }
                                    // return description;
                                }
                                return null;
                            }}
                            align="center"
                        />
                        <Column
                            field="action"
                            header="Action"
                            body={(rowData) => (
                                <div>
                                    <>
                                        <Button icon="pi pi-pencil" title="Edit" rounded severity="success" aria-label="edit" onClick={() => handleUpdate(rowData._id)} disabled={rowData.createdBy?._id !== auth?.user?._id} />
                                        <Button icon="pi pi-trash" title="Delete" rounded severity="danger" className="ms-2" aria-label="Cancel" onClick={() => handleDelete(rowData._id)} disabled={rowData.createdBy?._id !== auth?.user?._id} />
                                        <Button icon="pi pi-eye" title="View Credentials" rounded severity="info" className="ms-2 viewCredential" aria-label="view" onClick={() => handleCredentialDetail(rowData._id)} />
                                    </>
                                </div>
                            )}
                            align="center"
                        />
                    </DataTable>
                </div>
        </>
    )
}
    </Layout >
  );
};

export default CredentialList;
