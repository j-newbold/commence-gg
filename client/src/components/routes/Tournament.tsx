import { useState, useEffect, useRef, createContext } from "react";
import { useParams, useLocation } from "react-router";
import { io, Socket } from 'socket.io-client';
import Button from 'react-bootstrap/Button';
import { useAuth } from "../../context/AuthContext";
import { Player, SingleBracket, ElimBracket, Round, MatchObj, Entrant } from '../../utils/types';
import { createPlayerOrder } from "../../utils/misc";
import { seHandleInit, seSetMatchResults, seHandleStart } from "../brackets/single elim/seBracketFxns";
import { rrHandleInit, rrSetMatchResults, rrHandleStart } from "../brackets/round robin/rrBracketFxns";

import SEBracket from '../brackets/SEBracket';
import RRBracket from "../brackets/round robin/RRBracket";
import { handleReset } from "../../utils/miscBracketFxns";

const socket = io(import.meta.env.VITE_API_URL);

export const TourneyContext: any = createContext<
{
    tourneyData: SingleBracket;
    setTourneyData: any;
    socket: Socket
} | undefined
>(undefined);

export default function Tournament(props: any) {
    const [tournament, setTournament] = useState<any>(null);
    const [bracketNum, setBracketNum] = useState<any>(null);
    const [tourneyData, setTourneyData] = useState<SingleBracket | undefined>(undefined);
    const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
    const [canSignUp, setCanSignUp] = useState<boolean>(false);
    const { id, tid } = useParams();
    const { session } = useAuth();

    const location = useLocation();

    const effectRan = useRef(false);
    const tourneyDataRef = useRef(tourneyData);

    useEffect(() => {
        if (effectRan.current || !import.meta.env.VITE_API_URL.includes('localhost')) {
            getTournament();
            
            socket.on('signup added', (userInfo) => {
                setTourneyData((prev: any) => ({...prev, playerList: [...prev.playerList, { player: userInfo,
                                                                                            placement: null }
                ]}));
            })

            socket.on('signup removed', (id) => {
                setTourneyData((prev: any) => ({...prev, playerList: prev.playerList.filter((el: any) => el.player.id != id)}));
            })

            socket.on('matches updated', (matches) => {
                let newRoundList = tourneyDataRef?.current?.roundList;
                matches?.forEach((ma: any) => {
                    if (newRoundList) {
                        newRoundList[ma.matchCol][ma.matchRow] = ma;
                    }
                });
                setTourneyData((prev: any) => ({...prev, roundList: newRoundList}));
            })

            socket.on('placements updated', (placements) => {
                if (tourneyDataRef.current?.playerList) {
                    let newPlayerList = tourneyDataRef.current.playerList;
                    let placementMap = new Map();
                    placements?.forEach((pl: any) => {
                        placementMap.set(pl.player.id, pl);
                    });
                    newPlayerList = newPlayerList.map((e: any, i: number) => {
                        if (placementMap.has(e.player.id)) {
                            return placementMap.get(e.player.id);
                        } else {
                            return e;
                        }
                    })
                    setTourneyData((prev: any) => ({...prev, playerList: newPlayerList}))
                }
            })

            socket.on('matches cleared', () => {
                setTourneyData((prev: any) => ({
                    ...prev,
                    roundList: null
                }))
            })

            socket.on('match list created', (matches) => {
                let newRoundList: any[][] = [];
                let prevCol = -1;
                for (var ma of matches) {
                    if (ma.matchCol > prevCol) {
                        prevCol = ma.matchCol;
                        newRoundList.push([]);
                    }
                    newRoundList[prevCol].push(ma);
                }
                setTourneyData((prev: any) => ({
                    ...prev,
                    roundList: newRoundList
                }))
            })

            socket.on('tourney status updated', (newStatus) => {
                setTourneyData((prev: any) => ({
                    ...prev,
                    status: newStatus
                }))
            })

            setCanSignUp(location.state.canSignUp);
            
            return () => {
                socket.disconnect();
            }
        }

        return () => {
            effectRan.current = true;
        }

    }, [])

    useEffect(() => {
        tourneyDataRef.current = tourneyData;
        console.log(tourneyData);
        if (session && tourneyData?.playerList) {
            setIsSignedUp(tourneyData.playerList.some((e:any) => {
                return session.user.id === e.player.id
            }));
        }
    }, [tourneyData])

    const getTournament = async () => {
        const response = await fetch(import.meta.env.VITE_API_URL+`tournaments/${tid}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            }
        });
        const jsonData = await response.json();
        
        setBracketNum(0); // hardcoded because we currently assume 1 bracket

        // currently coded as a SingleBracket but should be a FullTournament
        setTourneyData((): SingleBracket => {
            return {
                playerList: jsonData.entrants.map((e: any, i: number): Entrant => {
                    return {    // can do the 'isbye' check here
                        player: {
                            seed: i+1,
                            tag: e.tag,
                            isHuman: true,
                            id: e.id
                        },
                        placement: e.placement
                    }
                }),
                roundList: (jsonData.brackets[0]?.roundList || null),
                winsNeeded: (jsonData.brackets[0]?.wins_needed_default || null),
                status: (jsonData.brackets[0]?.status || null),
                bracketId: (jsonData.brackets[0]?.bracket_id || null),
                tournamentId: (jsonData.brackets[0]?.tournament_id.toString() || null),
                type: (jsonData.brackets[0]?.b_type || null)
            }
        });

        socket.emit('joinRoom', jsonData.brackets[0]?.tournament_id.toString());
    }
    
    const handleClear = async () => {
        const response = await fetch(import.meta.env.VITE_API_URL+`tournaments/clear/${tid}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            }
        });

        if (response.status == 200) {
            socket.emit('matches cleared', (tourneyData?.tournamentId));
        }
    }

    const handleSignup = async () => {
        try {
            if (session) {
                if (!canSignUp) {
                    console.log('you must register for the event first!');
                    // popup: you must register for the event first!
                } else {
                    if (!isSignedUp) {
                        const response = await fetch(import.meta.env.VITE_API_URL+`tournaments/${tid}/signup/${session.user.id}`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'content-type': 'application/json'
                            }, body: JSON.stringify({
                                eventId: id,
                                tournamentId: tid,
                                userId: session.user.id
                            })
                        });
                        const userJson = await response.json()
                        if (response.status == 200) {
                            socket.emit('signup added', [userJson, tourneyData?.tournamentId]);
                        }
                    } else {
                        const response = await fetch(import.meta.env.VITE_API_URL+`tournaments/${tid}/signup/${session.user.id}`, {
                            method: 'DELETE',
                            credentials: 'include',
                            headers: {
                                'content-type': 'application/json'
                            }, body: JSON.stringify({
                                eventId: id,
                                tournamentId: tid,
                                userId: session.user.id
                            })
                        });
                        if (response.status == 200) {
                            socket.emit('signup removed', [session.user.id, tourneyData?.tournamentId]);
                        }
                    }
                }
            } else {
                // popup: you must log in!
            }
        } catch (error) {
            console.log(error);
        }
    }

    const startHandler = async (tourneyData: any, setTourneyData: any, socket: Socket) => {
        if (tourneyData.type == 'single_elim') {
            return seHandleStart(tourneyData, setTourneyData, socket);
        } else if (tourneyData.type == 'round_robin') {
            return rrHandleStart(tourneyData, setTourneyData, socket);
        } else {
            return null;
        }
    }

    const initHandler = async (tourneyData: any, socket: Socket) => {
        if (tourneyData.type == 'single_elim') {
            return seHandleInit(tourneyData, socket);
        } else if (tourneyData.type == 'round_robin') {
            return rrHandleInit(tourneyData, socket);
        } else {
            return null;
        }
    }
    

    return (
        <TourneyContext.Provider value={
            {
                tourneyData: tourneyData,
                setTourneyData: setTourneyData,
                socket: socket
            }}>
            <div className="p-3">
                <div className="text-3xl">
                    {/* {tournament?.tournament_name} */}
                </div>
                {tourneyData?.playerList? 
                    <div>Entrants:
                        {tourneyData.playerList.map((e: any, i: number) => {
                            return (
                                <div key={i}>{e.player.tag}</div>
                            );
                        })}
                    </div>
                : <></>}
                {tourneyData?.playerList?
                    <div>Standings:
                        {/* will need to sort this list*/}
                        {tourneyData.playerList.sort((a: any, b: any) => {
                            return (a.placement - b.placement)
                        }).map((e: any, i: number) => {
                            return (
                                e.placement?
                                    <div key={i}>
                                        {e.placement}{'. '}{e.player.tag}
                                    </div>
                                    :
                                    <span key={i}></span>
                            );
                        })}
                    </div>
                :
                <></>}
                {canSignUp?
                    <>{!isSignedUp? <Button onClick={handleSignup} >Sign Up</Button> : <Button onClick={handleSignup} >Remove Signup</Button>}</>
                    :
                    <>Register for the event to sign up for this tournament!</>
                }
                <div>
                    <Button onClick={() => startHandler(tourneyData, setTourneyData, socket)}>Start Tournament</Button>
                    <Button onClick={() => handleReset(tourneyData, setTourneyData, socket, tid)}>Reset</Button>
                </div>
                {tourneyData && tourneyData.status == 'upcoming' && <div>
                    <Button onClick={() => initHandler(tourneyData, socket)}>Initialize Tournament</Button>
                </div>}
                {tourneyData && (tourneyData.status == 'in_progress' || 'finished' || 'ready') &&
                    <div>
                        <Button onClick={handleClear}>Clear Tournament</Button>
                    </div>
                }
                {tourneyData?
                    (tourneyData.type == 'single_elim' ?
                        <SEBracket />
                    :
                    (tourneyData.type == 'round_robin' ?
                        <RRBracket />
                        :
                        <></>
                    ))
                    :
                    <></>
                }
            </div>
        </TourneyContext.Provider>
    );
}