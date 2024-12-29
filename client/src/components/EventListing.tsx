import { useNavigate } from "react-router-dom";

export default function EventListing(props:any) {

    const navigate = useNavigate();

    const renderEvent = async (id: number) => {
        navigate(`/event/${id}`);
    }
    
    return (
        <div onClick={() => renderEvent(props.eventId)}>
            <div>
                {props.eventName}
            </div>
            <div>
                {props.eventStart}
            </div>
        </div>
    );
}