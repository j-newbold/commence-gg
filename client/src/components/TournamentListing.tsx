import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Button from 'react-bootstrap/Button';
import ListGroup from "react-bootstrap/ListGroup";

export default function TournamentListing(props:any) {

    const navigate = useNavigate();

    const renderTournament = async (id: number, tId: number, canSignUp: boolean) => {
        navigate(`/event/${id}/tournament/${tId}`, { state: { canSignUp: canSignUp }});
    }
    
    return (
        <ListGroup.Item style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <div 
            onClick={() => renderTournament(props.event.event_id, props.tournament.tournament_id, props.canSignUp)}>
                {props.tournament.tournament_name}
            </div>
            {props.isAdmin? <Button variant='danger' onClick={props.deleteTournament}>Delete</Button> : <></>}
        </ListGroup.Item>
    );
}