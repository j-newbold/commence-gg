import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import TournamentListing from "../TournamentListing";

export default function Event(props: any) {
    const [event, setEvent] = useState<any>(null);
    const [entrants, setEntrants] = useState<any>(null);
    const [tournaments, setTournaments] = useState<any>(null);
    const [isRegistered, setIsRegistered] = useState<boolean>(false);
    const { session } = useAuth();
    const { id } = useParams();

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

    const addTournament = async () => {

    }

    const handleReg = async () => {
        try {
            if (session) {
                if (isRegistered) {
                    const response = await fetch(import.meta.env.VITE_API_URL+`events/${id}/signup/${session.user.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: {
                            'content-type': 'application/json'
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
                            'content-type': 'application/json'
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
            const response = await fetch(import.meta.env.VITE_API_URL+`events/`, {
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
                    'content-type': 'application/json'
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

    return (
        <div className="p-3">
            {event?
            <>
                <div>{event.event_name}</div>
                <div>{event.event_date}</div>
                <div>{event.event_desc}</div>
                <div>Entrants:
                    {entrants?.map((e: any, i: number) => {
                        return (
                            <div key={i}>
                                {e.tag}
                            </div>
                        );
                    })}
                </div>
                <div>Tournaments:
                    {tournaments?.map((e: any, i: number) => {
                        return (
                            <TournamentListing event={event} tournament={e} key={i} canSignUp={isRegistered} />
                        );
                    })}
                </div>
                
                {event.signups_open?
                    <>{isRegistered?
                        <Button onClick={handleReg} className="btn btn-danger">Remove Signup</Button>
                        :
                        <Button onClick={handleReg}>Sign up</Button>
                    }</>
                    :
                    <></>
                }
                {event && session && event.event_creator == session.user.id ?
                    <>
                        <Button onClick={addTournament}>Add Tournament</Button>
                        <Button onClick={toggleSignups}>
                            {event.signups_open? <>Close Signups</> : <>Open Signups</>}
                        </Button>
                    </>
                    :
                    <></>
                }
            </>
            :
            <div>Loading...</div>}
        </div>
    );
}