import React, { useEffect, useState } from "react";
import { CCol, CFormInput, CButton, CForm } from "@coreui/react";
import { useAuth } from "../../contexts/AuthContext";
import { useDepartment } from "../../contexts/DepartmentContext";
import { useNavigate, useParams } from "react-router-dom";
import Loader from '../../components/Loader'
import Layout from "../Layout";

interface DepartmentUpdateProps {
    title: string;
}

const DepartmentUpdate: React.FC<DepartmentUpdateProps> = ({ title }) => {
    const navigate = useNavigate();
    const params = useParams<{ id?: string }>();
    const [name, setName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const { updateDepartment, getSingleDepartment } = useDepartment();
    const { toast } = useAuth();

    const singleDepartment = async () => {
        if (params.id) {
            const data = await getSingleDepartment(params.id);
            if (data) {
                setName(data.name);
                setIsLoading(false);
            }
        }
    }

    useEffect(() => {
        singleDepartment();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const id = params.id;
            if (id) {
                await updateDepartment(name, id);
                navigate("/dashboard/department/list");
            } else {
                console.error("Department ID is undefined");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Layout title={title} toast={toast}>
            {isLoading === true && <Loader />}
            {isLoading === false && (
                <>
                    <div className="mb-3">
                        <h2 className="mb-5 mt-2">Update Department</h2>
                    </div>
                    <CForm className="row g-3" onSubmit={handleSubmit}>
                        <CCol sm={12}>
                            <CFormInput
                                placeholder="Department"
                                aria-label="Department"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </CCol>
                        <CCol xs="auto">
                            <CButton type="submit" className="me-md-2">Submit</CButton>
                        </CCol>
                    </CForm>
                </>
            )}
        </Layout>
    );
};

export default DepartmentUpdate;
