import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Outlet } from "react-router-dom";
import LeftNav from '../leftnav/LeftNav';
import './Routes.css';
import { useParams, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import Modal from "react-bootstrap/Modal";

import { mapValues, isNil } from 'lodash';

export default function CreateProfile() {
    const [newProfileData, setNewProfileData] = useState<any>(null);
    const [showEdit, setShowEdit] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);

    const { session, profile, loading, setProfile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setNewProfileData(profile);
    }, [profile])

    const submitCreateProfile = async (event: any) => {
        event.preventDefault();
        try {
            let profileSubmission: any = {};
            for (const [key, value] of Object.entries(newProfileData)) {
                profileSubmission[key] = (value === null? '' : value); 
            }
            //console.log(profileSubmission);
            const response = await fetch(import.meta.env.VITE_API_URL+`profiles/edit/${session.user.id}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(profileSubmission)
            });
            if (response.status == 200) {
                setProfile(profileSubmission);
                //console.log('navigate /');
                navigate('/');
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            {loading? <div>Loading...</div>
                :
            profile?.tag? <div>Profile has been created, redirect</div>
                :
            !session? <div>Unauthorized</div>
                :
            <div className="create-profile-page">
                <div>Set up your profile</div>{/*duplicated code*/}
                <Form
                    validated={validated}
                    onSubmit={submitCreateProfile}>
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
                            value={newProfileData?.last_name || ''}
                            onChange={(e) => setNewProfileData({
                                ...newProfileData,
                                last_name: e.target.value
                            })}
                        />
                    </Form.Group>
                    <Button variant='primary'
                        type='submit'
                        style={{
                            width: '100%'
                        }}>
                        Submit
                    </Button>
                </Form>
            </div>
            }
        </>
    );
}