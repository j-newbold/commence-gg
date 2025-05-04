import { useNavigate } from "react-router-dom";

export default function EventListing(props:any) {

    const navigate = useNavigate();

    const renderEvent = async (id: number) => {
        navigate(`/event/${id}`);
    }
    
    return (
        <div className='border-b-2 p-3 hover:bg-gray-200'
            onClick={() => renderEvent(props.eventId)}>
            <div className="text-3xl border-b-1 pb-2">
                {props.eventName}
            </div>
            <div className="ml-auto">
                {props.eventStart}
            </div>
        </div>
    );
}