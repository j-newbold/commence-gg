import { useEffect, useState } from "react";
import Event from "./Event";
import EventListing from "../EventListing";

export default function EList () {
    const [eventList, setEventList] = useState<any>(null);
    
    useEffect(() => {
        getEvents();
    }, []);

    const getEvents = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL+'events', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                }
            });
            const jsonData = await response.json();
            setEventList(jsonData);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <div className="">
                <h1>
                    Tournaments
                </h1>
                
            </div>
            {eventList?.map((e: any, i: number) => {
                return <EventListing key={i}
                    eventName={e.event_name}
                    eventStart={e.event_start_date}
                    eventId={e.event_id} />
            })}
        </div>
    );
}