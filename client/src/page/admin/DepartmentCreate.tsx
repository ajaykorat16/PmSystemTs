import React, { useState, FormEvent } from "react";
import { CCol, CFormInput, CButton, CForm } from "@coreui/react";
import { useDepartment } from "../../contexts/DepartmentContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";

interface DepartmentCreateProps {
  title: string;
}

const DepartmentCreate: React.FC<DepartmentCreateProps> = ({ title }) => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const { addDepartment } = useDepartment();
  const { toast } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = await addDepartment(name);
      if (typeof data !== 'undefined' && data.error === false) {
        navigate("/dashboard/department/list");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout title={title} toast={toast}>
      <div className="mb-3">
        <h2 className="mb-5 mt-2">Create Department</h2>
      </div>
      <CForm className="row g-3" onSubmit={handleSubmit}>
        <CCol sm={12}>
          <CFormInput
            placeholder="Department"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </CCol>
        <CCol xs="auto">
          <CButton type="submit">Submit</CButton>
        </CCol>
      </CForm>
    </Layout>
  );
};

export default DepartmentCreate;
