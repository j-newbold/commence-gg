import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Outlet } from "react-router-dom";
import LeftNav from '../leftnav/LeftNav';
import './Routes.css';
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import Modal from "react-bootstrap/Modal";

export default function Profile() {
    const [profileData, setProfileData] = useState<any>(null);
    const [newProfileData, setNewProfileData] = useState<any>(null);
    const [showEdit, setShowEdit] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);

    const { session } = useAuth();
    const { id } = useParams();

    useEffect(() => {
        getProfile();        
    }, [])

    const getProfile = async () => {
        const response = await fetch(import.meta.env.VITE_API_URL+`profiles/${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            }
        });

        const jsonData = await response.json();
        setProfileData(jsonData);
        setNewProfileData(jsonData);
    }

    const toggleEdit = () => {
        setShowEdit(!showEdit);
    }

    const submitEditProfile = async (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            const response = await fetch(import.meta.env.VITE_API_URL+`profiles/edit/${id}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(newProfileData)
            });
            setShowEdit(false);
            if (response.status == 200) {
                setProfileData(newProfileData);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="profile-page">
            <div className="profile-header">{profileData?.tag}</div>
            <div className="profile-subhead">{profileData?.first_name}{` `}{profileData?.last_name}</div>
            {session?.user.id == id &&
            <Button variant='primary' onClick={toggleEdit}>Edit Profile</Button>}
            <Modal show={showEdit} onHide={() => setShowEdit(false)}>
                <Form validated={validated}
                    onSubmit={submitEditProfile}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Profile</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                            <Form.Group>
                                <Form.Label>Tag</Form.Label>
                                <Form.Control type='text'
                                    required
                                    value={newProfileData?.tag || ''}
                                    onChange={(e) => setNewProfileData({
                                        ...newProfileData,
                                        tag: e.target.value
                                    })}
                                    />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>First Name</Form.Label>
                                <Form.Control type='text'
                                    required
                                    value={newProfileData?.first_name || ''}
                                    onChange={(e) => setNewProfileData({
                                        ...newProfileData,
                                        first_name: e.target.value
                                    })}
                                    />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control type='text'
                                    required
                                    value={newProfileData?.last_name || ''}
                                    onChange={(e) => setNewProfileData({
                                        ...newProfileData,
                                        last_name: e.target.value
                                    })}
                                    />
                            </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={() => setShowEdit(false)}>
                            Cancel
                        </Button>
                        <Button variant='primary' type='submit'>
                            Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}