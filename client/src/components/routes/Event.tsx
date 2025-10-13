import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import TournamentListing from "../TournamentListing";
import {Modal} from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import './Routes.css';
import {Tab, Tabs} from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';

export default function Event(props: any) {
    const [event, setEvent] = useState<any>(null);
    const [entrants, setEntrants] = useState<any>(null);
    const [tournaments, setTournaments] = useState<any>(null);
    const [isRegistered, setIsRegistered] = useState<boolean>(false);
    const { session } = useAuth();
    const { id } = useParams();
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [showTourneyCreation, setShowTourneyCreation] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [newTourneyData, setNewTourneyData] = useState<{
        name: string | null,
        type: string | null,
        eventId: string | undefined,
        winsNeeded: number | null}>({
        name: null,
        type: 'single_elim',
        eventId: id,
        winsNeeded: 2
    })
    const [eventTabValue, setEventTabValue] = useState<any>('entrants');

    const navigate = useNavigate();

    useEffect(() => {
        getEvent();
        getEntrants();
        getTournaments();
    }, [])

    useEffect(() => {
        if (!entrants || !session) {
            setIsRegistered(false);
        } else {
            setIsRegistered(entrants.some((e:any) => {
                return session.user.id === e.id
            }));
        }
    }, [entrants])

    const getTournaments = async () => {
        const response = await fetch(import.meta.env.VITE_API_URL+`events/${id}/tournaments`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            }
        });
        const jsonData = await response.json();
        setTournaments(jsonData);
    }

    const addTournament = async (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            const response = await fetch(import.meta.env.VITE_API_URL+`tournaments/create`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(newTourneyData)
            });
            setShowTourneyCreation(false);
            let retData = await response.json();
            setTournaments([...tournaments,
                {
                    tournament_id: retData.tournamentId,
                    event_id: retData.eventId,
                    tournament_name: retData.name
                }
            ])
        } catch (error) {
            console.log(error);
        }
    }

    const deleteEvent = async () => {
        try {
            setShowWarning(false);
            const response = await fetch(import.meta.env.VITE_API_URL+`events/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            const retJson = await response.json();
            navigate(-1);
        } catch (error) {
            console.log(error);
        }
    }

    const handleReg = async () => {
        try {
            if (session) {
                if (isRegistered) {
                    const response = await fetch(import.meta.env.VITE_API_URL+`events/${id}/signup/${session.user.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: {
                            'content-type': 'application/json',
                            'Authorization': `Bearer ${session?.access_token}`
                        }, body: JSON.stringify({
                            id: id,
                            id2: session.user.id
                        })
                    })
                    setIsRegistered(false);
                } else {
                    const response = await fetch(import.meta.env.VITE_API_URL+`events/${id}/signup/${session.user.id}`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'content-type': 'application/json',
                            'Authorization': `Bearer ${session?.access_token}`
                        }, body: JSON.stringify({
                            id: id,
                            id2: session.user.id
                        })
                    })
                    setIsRegistered(true);
                }
            } else {
                await navigate('/login');
            }



        } catch (error) {
            console.log(error);
        }
    }

    const getEntrants = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL+`events/${id}/entrants`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                }
            });
            const jsonData = await response.json();
            setEntrants(jsonData);
        } catch (error) {
            console.log(error);
        }
    }

    const getEvent = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL+`events/${id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                }
            });
            const jsonData = await response.json();
            setEvent(jsonData[0]);
        } catch (error) {
            console.log(error);
        }
    }

    const toggleSignups = async () => {
        try {
            const val = !event.signups_open;
            const response = await fetch(import.meta.env.VITE_API_URL+`events/${id}/changesignup/${val}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                }, body: JSON.stringify({
                    id: event.event_id,
                    val: val
                })
            });
            setEvent((prev: any) => ({...prev, signups_open: val}));
        } catch (error) {
            console.log(error);
        }
    }

    const deleteTournament = async (tid: number) => {
        try {
            console.log(tournaments);
            console.log(tid); 
            const response = await fetch(import.meta.env.VITE_API_URL+`tournaments/${tid}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            if (response.status == 200) {
                setTournaments((prev: any) => (prev.filter((e: any, i: number) => e.tournament_id != tid)));
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="p-3">
            {event?
            <div>
                <div className="page-heading">{event.event_name}</div>
                <div>{event.event_date}</div>
                <div>{event.event_desc}</div>
                {event && session && event.event_creator == session.user.id &&
                    <div className="admin-controls">
                        <div className="ac-block">Admin Controls</div>
                        <div className="ac-button" onClick={() => setShowTourneyCreation(true)}>
                            <Icon.Plus className="ac-icon" />Add Tournament
                        </div>
                        <div className="ac-button" onClick={toggleSignups}>
                            {event.signups_open? <><Icon.Lock className="ac-icon"/>Close Signups</> : <><Icon.Unlock className="ac-icon"/>Open Signups</>}
                        </div>
                        <div className="ac-button" onClick={() => setShowWarning(true)}>
                            <Icon.Trash className="ac-icon"/>Delete Event
                        </div>
                    </div>
                }
                <div className="event-tabs">
                    <Tabs
                        activeKey={eventTabValue}
                        id='event-tabs'
                        className="mb-3"
                        onSelect={(e) => {
                            setEventTabValue(e);
                        }}
                    >
                        <Tab eventKey='entrants' title='Entrants'>
                            <ListGroup>
                                {entrants?.map((e: any, i: number) => {
                                    return (
                                        <ListGroup.Item key={i}>
                                            {e.tag}
                                        </ListGroup.Item>
                                    );
                                })}
                            </ListGroup>
                            {event.signups_open?
                                <>{isRegistered?
                                    <Button onClick={handleReg} className="btn btn-danger">Remove Signup</Button>
                                    :
                                    <Button onClick={handleReg}>Sign up</Button>
                                }</>
                                :
                                <></>
                            }
                        </Tab>
                        <Tab eventKey='tournaments' title='Tournaments'>
                            <ListGroup>
                                {tournaments?.map((e: any, i: number) => {
                                    return (
                                        <TournamentListing event={event}
                                            tournament={e}
                                            key={i}
                                            canSignUp={isRegistered}
                                            isAdmin={event && session && event.event_creator == session.user.id ? true : false}
                                            deleteTournament={() => deleteTournament(e.tournament_id)}/>
                                    );
                                })}
                            </ListGroup>
                        </Tab>
                    </Tabs>
                </div>
                
                <Modal show={showWarning} onHide={() => setShowWarning(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Are You Sure?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        This action cannot be undone and will delete all associated tournament data.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={() => setShowWarning(false)}>
                            Cancel
                        </Button>
                        <Button variant='danger' onClick={deleteEvent}>
                            Proceed--Delete Event
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showTourneyCreation} onHide={() => setShowTourneyCreation(false)}>
                    
                    <Form validated={validated}
                        onSubmit={addTournament}>
                        <Modal.Header closeButton>
                            <Modal.Title>Create Tournament</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row className="mb-3">
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type='text'
                                        required
                                        onChange={(e) => setNewTourneyData({
                                            ...newTourneyData,
                                            name: e.target.value
                                        })}
                                        />
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group xs={8} as={Col}>
                                    <Form.Label>Bracket Type</Form.Label>
                                    <Form.Select
                                        required
                                        onChange={(e) => setNewTourneyData({
                                            ...newTourneyData,
                                            type: e.target.value
                                        })}>
                                        <option value='single_elim'>Single Elimination</option>
                                        <option value='round_robin'>Round Robin</option>
                                        <option value='double_elim'>Double Elimination</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Label>Wins Needed</Form.Label>
                                    <Form.Control type='number'
                                        required
                                        value='2'
                                        onChange={(e) => setNewTourneyData({
                                            ...newTourneyData,
                                            winsNeeded: Number(e.target.value)
                                        })}
                                        />
                                </Form.Group>
                            </Row>

                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant='secondary' onClick={()=> setShowTourneyCreation(false)}>
                                Cancel
                            </Button>
                            <Button variant='primary' type='submit'>
                                Add Tournament
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </div>
            :
            <div>Loading...</div>}
        </div>
    );
}