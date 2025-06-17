import { useState } from "react";
import { Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import Dropdown from 'react-bootstrap/Dropdown';
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
    const [eventName, setEventName] = useState<any>(null);
    const [eventDate, setEventDate] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<any>(null);
    const [eventDesc, setEventDesc] = useState('');

    const [validated, setValidated] = useState(false);

    const { session } = useAuth();
    const navigate = useNavigate();

    const handleCreate = async (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        const form = event.currentTarget;
        //console.log(event);
        if (form.checkValidity() === false) {
        } else {
            try {
                const response = await fetch(import.meta.env.VITE_API_URL+'events/create', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'content-type': 'application/json'
                    }, body: JSON.stringify({
                        eName: eventName,
                        eDate: eventDate,
                        eDesc: eventDesc,
                        eCreator: session.user.id
                    })
                });
                const respJson = await response.json();
                navigate(`/event/${respJson[0].event_id}`, { state: { canSignUp: true }});
            } catch (error) {
                console.log(error);
            }
        }
        setValidated(true);
    }

    return (
        <Form className="create-event"
            validated={validated}
            onSubmit={handleCreate}
            noValidate>
            <Form.Group>
                <Form.Label>Name</Form.Label>   
                <Form.Control type='text'
                    required
                    onChange={(e) => setEventName(e.target.value)}
                    />
                <Form.Control.Feedback type='invalid'>
                    Please enter a name.
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control type='date'
                    onChange={(e) => setEventDate(e.target.value)}
                    required></Form.Control>
                <Form.Control.Feedback type='invalid'>
                    Please enter a date.
                </Form.Control.Feedback>
            </Form.Group>
{/*             <Form.Group>
                <Form.Label>Bracket Type</Form.Label>
                <Form.Select required onChange={(e) => setBracketType(e.target.value)}>
                        <option value='Single Elimination'>Single Elimination</option>
                        <option value='Option 2'>Option 2</option>
                </Form.Select>

            </Form.Group> */}
            <Form.Group>     
                <Form.Label>Description</Form.Label>   
                <Form.Control as='textarea' rows={3}
                    onChange={(e) => setEventDesc(e.target.value)}/>        
            </Form.Group>
            <Form.Group className="create-event-submit">
                <Button type='submit' >Submit</Button>
            </Form.Group>
        </Form>
    );
}