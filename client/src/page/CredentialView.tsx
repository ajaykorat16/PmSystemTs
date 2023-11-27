import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar } from "primereact/avatar";
import Layout from "./Layout";
import '../styles/Styles.css';
import { useAuth } from "../contexts/AuthContext";
import { useCredential } from "../contexts/CredentialContext";

interface User {
    id: string;
    fullName: string;
    photo: {
        data: string;
        contentType: string;
    };
}

interface CredentialViewProps {
    title: string;
}

function CredentialView({ title }: CredentialViewProps) {
    const { id } = useParams<{ id: string }>();
    const { getSingleCredential } = useCredential();
    const { auth } = useAuth();
    const [credentialDetail, setCredentialDetail] = useState<any>({
        title: "",
        description: "",
        createdBy: {
            id: "",
            fullName: "",
            photo: {
                data: "",
                contentType: "",
            },
        },
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCredential = async () => {
            const data = await getSingleCredential(id as string);
            if (data) {
                const userPhotos = data?.users?.map((user: User): any => user?.id);
                setCredentialDetail({
                    title: data.title,
                    description: data.description,
                    createdBy: {
                        id: data?.createdBy?.id,
                        fullName: data?.createdBy?.fullName,
                        photo: {
                            data: data?.createdBy?.photo?.data,
                            contentType: data?.createdBy?.photo?.contentType,
                        },
                    },
                });
            }
        };
        fetchCredential();
    }, [getSingleCredential, id]);

    return (
        <Layout title={title}>
            <div className="credential">
                <div className="row credentialLeftBody">
                    <div className="col-11 credentialBody">
                        <p className="credentialTitle">{credentialDetail.title}</p>
                        <div
                            className="credentialDescription"
                            dangerouslySetInnerHTML={{ __html: credentialDetail.description }}
                        ></div>
                        <button
                            className="btn btn-primary mt-2 mb-3"
                            onClick={() => {
                                auth?.user?.role === "admin"
                                    ? navigate('/dashboard/credential/list')
                                    : navigate('/dashboard-user/credential/list');
                            }}
                        >
                            Back
                        </button>
                    </div>
                    <div className="col-1 text-center credentialRightBody">
                        <div className="createdBy">
                            <Avatar
                                image={
                                    credentialDetail?.createdBy?.photo?.data &&
                                    `data:${credentialDetail?.createdBy?.photo?.contentType};base64, ${credentialDetail?.createdBy?.photo?.data}`
                                }
                                icon={!credentialDetail?.createdBy?.photo?.data && 'pi pi-user'}
                                size={!credentialDetail?.createdBy?.photo?.data ? 'large' : undefined} 
                                className="credentialAvatar col-md-3 custom-created-img"
                                shape="circle"
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    backgroundColor: !credentialDetail?.createdBy?.photo?.data ? '#2196F3' : undefined, 
                                    color: !credentialDetail?.createdBy?.photo?.data ? '#ffffff' : undefined, 
                                    cursor: "pointer",
                                }}
                            />
                            <span className="userName">{credentialDetail.createdBy.fullName}</span>
                        </div>

                        {credentialDetail?.photo?.length > 0 && (
                            credentialDetail.photo.map((user: User, index: number) => (
                                <div key={index} className="mainAvatar">
                                    <>
                                        <Avatar
                                            image={user.photo.data && `data:${user.photo.contentType};base64, ${user.photo.data}`}
                                            icon={!user.photo.data && 'pi pi-user'}
                                            size={!user.photo.data ? 'large' : undefined} 
                                            className="credentialAvatar col-md-3 mt-3"
                                            shape="circle"
                                            style={{
                                                width: '70px',
                                                height: '70px',
                                                backgroundColor: !user.photo.data ? '#2196F3' : undefined, 
                                                color: !user.photo.data ? '#ffffff' : undefined, 
                                                cursor: "pointer",
                                            }}
                                        />

                                        <span className="userName">{user.fullName}</span>
                                    </>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default CredentialView;
