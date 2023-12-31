import React, { useEffect, useState } from "react";
import { CForm, CCol, CFormInput, CFormSelect, CButton } from "@coreui/react";
import { useLeave } from "../contexts/LeaveContext";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import { useHelper } from "../contexts/Helper";
import Loader from "../components/Loader";
import Layout from "./Layout";

interface LeaveUpdateProps {
    title: string;
}

const LeaveUpdate: React.FC<LeaveUpdateProps> = ({ title }) => {
    const [userId, setUserId] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [totalDays, setTotalDays] = useState<string>("");
    const [leaveType, setLeaveType] = useState<string>("");
    const [leaveDayType, setLeaveDayType] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const { updateLeave, getLeaveById } = useLeave();
    const { fetchUsers } = useUser();
    const { auth, toast } = useAuth();
    const { formatDate } = useHelper();
    const params = useParams<{ id: any }>();
    const typeList = ["paid", "lwp"];
    const dayTypeList = ["Single Day", "Multiple Day", "First Half", "Second Half"];
    const navigate = useNavigate();

    useEffect(() => {
        const setValues = async () => {
            const data = await getLeaveById(params.id);
            if (data) {
                setUserId(data.userId ? data.userId._id : "");
                setReason(data.reason);
                setStatus(data.status);
                setStartDate(new Date(data.startDate));
                setEndDate(new Date(data.endDate));
                setTotalDays(data.totalDays);
                setLeaveType(data.leaveType);
                setLeaveDayType(data.leaveDayType);
                setIsLoading(false);
            }
        };
        setValues();
    }, [getLeaveById, params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let leaveData;
            if (auth.user?.role === "admin") {
                leaveData = { reason, startDate: formatDate(startDate), endDate: formatDate(endDate), leaveType, leaveDayType, userId, status, totalDays };
            } else {
                leaveData = { reason, startDate: formatDate(startDate), endDate: formatDate(endDate), leaveType, leaveDayType, totalDays };
            }
            let id: any = params.id;
            const data = await updateLeave(leaveData, id);
            if (typeof data !== 'undefined' && data.error === false) {
                const redirectPath = auth.user?.role === "admin" ? "/dashboard/leave/list" : "/dashboard-user/leave/list";
                navigate(redirectPath);
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
        if (auth.user?.role === "admin") {
            getUsers();
        }
    }, [auth.user?.role]);

    const leaveDaysCount = (startDate: Date, endDate: Date) => {
        const eDate = new Date(endDate);
        let currentDate = new Date(startDate);
        let totalDays = 0;
        while (currentDate <= eDate) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                totalDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        setTotalDays(totalDays.toString());
    };

    useEffect(() => {
        if (leaveDayType === "Multiple Day") {
            if (startDate && endDate) {
                leaveDaysCount(startDate, endDate);
            }
        } else {
            handleHalfDay();
        }
    }, [startDate, endDate, leaveDayType]);

    const handleHalfDay = () => {
        if (startDate) {
            let currentDate = new Date(startDate);
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                if (leaveDayType === "First Half" || leaveDayType === "Second Half") {
                    setEndDate(startDate);
                    setTotalDays("0.5");
                }
                if (leaveDayType === "Single Day") {
                    setEndDate(startDate);
                    setTotalDays("1");
                }
            }
        }
    };

    return (
        <Layout title={title} toast={toast}>
            {isLoading === true && <Loader />}
            {isLoading === false && (
                <>
                    <div className="mb-3">
                        <h2 className="mb-5 mt-2">Update Leave</h2>
                    </div>
                    <CForm className="row g-3 mb-3" onSubmit={handleSubmit}>
                        {auth.user?.role === "admin" && (
                            <CCol md={6}>
                                <CFormSelect
                                    id="inputUserName"
                                    label="User Name"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                >
                                    <option value="" disabled>
                                        Select User
                                    </option>
                                    {users.map((u) => (
                                        <option
                                            key={u._id}
                                            value={u._id}
                                        >{`${u.firstname} ${u.lastname}`}</option>
                                    ))}
                                </CFormSelect>
                            </CCol>
                        )}
                        <CCol md={6}>
                            <CFormInput
                                id="inputReason"
                                label="Reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </CCol>
                        {auth.user?.role === "admin" && (
                            <CCol md={6}>
                                <CFormInput
                                    id="inputStatus"
                                    label="Status"
                                    placeholder="Approved"
                                    disabled
                                />
                            </CCol>
                        )}
                        <CCol md={6}>
                            <CFormSelect
                                id="inputType"
                                label="Leave Type"
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value)}
                            >
                                <option value="" disabled>
                                    Select a Leave Type
                                </option>
                                {typeList.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect
                                id="inputType"
                                label="Leave Day Type"
                                value={leaveDayType}
                                onChange={(e) => setLeaveDayType(e.target.value)}
                            >
                                {dayTypeList.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol xs={6}>
                            <CFormInput
                                id="inputendDate"
                                label="Total Days"
                                value={totalDays}
                                onChange={(e) => setTotalDays(e.target.value)}
                                disabled
                            />
                        </CCol>
                        <CCol xs={6}>
                            <label className="form-label">Leave Start</label>
                            <Calendar
                                value={startDate}
                                dateFormat="dd-mm-yy"
                                onChange={(e) => setStartDate(e.target.value as Date)}
                                showIcon
                                id="date"
                            />
                        </CCol>
                        <CCol xs={6}>
                            <label className="form-label">Leave End</label>
                            <Calendar
                                value={endDate}
                                dateFormat="dd-mm-yy"
                                minDate={startDate || undefined}
                                onChange={(e) => setEndDate(e.target.value as Date)}
                                disabled={leaveDayType !== "Multiple Day"}
                                showIcon
                                id="date"
                            />
                        </CCol>
                        <CCol xs={12}>
                            <CButton type="submit" className="me-md-2">
                                Submit
                            </CButton>
                        </CCol>
                    </CForm>
                </>
            )}
        </Layout>
    );
};

export default LeaveUpdate;
