import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../page/Layout";

const Spinner: React.FC = () => {
  const [count, setCount] = useState<number>(2);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => --prevValue);
    }, 1000);

    count === 0 &&
      navigate(`/`, {
        state: location.pathname,
      });
      
    return () => clearInterval(interval);
  }, [count, navigate, location]);

  return (
    <>
      <Layout>
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Spinner;
