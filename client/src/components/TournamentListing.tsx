import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';

export default function TournamentListing(props:any) {

    const navigate = useNavigate();

    const renderTournament = async (id: number, tId: number) => {
        navigate(`/event/${id}/tournament/${tId}`);
    }
    
    return (
        <div className=''
            onClick={() => renderTournament(props.event.event_id, props.tournament.tournament_id)}>
            <div>
                {props.tournament.tournament_name}
            </div>
            <div>
                <Button>Click me</Button>
            </div>
        </div>
    );
}