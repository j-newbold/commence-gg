import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from 'socket.io-client';

export default function Tournament(props: any) {
    const [tournament, setTournament] = useState<any>(null);
    const [tourneyEntrants, setTourneyEntrants] = useState<any>(null);
    const [tourneyBracket, getTourneyBracket] = useState<any>(null);
    const { id, tid } = useParams();

    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current || !import.meta.env.VITE_API_URL.includes('localhost')) {
            getTournament();    // eventually this will be removed
            getTourneyEntrants();
            const socket = io(import.meta.env.VITE_API_URL);
    
            socket.on('connect', () => {
                socket.emit('reqTournament', { tid: tid });
            })

            socket.on('sendTournament', (tourneyData) => {
                setTournament(tourneyData.data);
            })
            
            return () => {
                socket.emit('disc', { tid: tid });
                //socket.disconnect();
            }
        }

        return () => effectRan.current = true;

    }, [])

    const getTournament = async () => {
        const response = await fetch(import.meta.env.VITE_API_URL+`tournaments/${tid}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            }
        });
        const jsonData = await response.json();
        console.log(jsonData);
        //setTournament(jsonData);
    }

    const getTourneyEntrants = async () => {
        const response = await fetch(import.meta.env.VITE_API_URL+`tournaments/${tid}/entrants`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            }
        });
        const jsonData = await response.json();
        setTourneyEntrants(jsonData);
    }

    const getBracket = async () => {

    }

    return (
        <div className="p-3">
            <div className="text-3xl">
                {/* {tournament?.tournament_name} */}
            </div>
            {tourneyEntrants? 
                <div>Entrants:
                    {tourneyEntrants.map((e: any, i: number) => {
                        return (
                            <div key={i}>{e.tag}</div>
                        );
                    })}
                </div>
            : <></>}
            {tournament?.bracketList.length > 1?
                <div>Dropdown goes here</div>
                :
                <div>Length = 1</div>
            }
        </div>
    );
}