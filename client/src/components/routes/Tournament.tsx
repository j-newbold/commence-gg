import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router";
import io from 'socket.io-client';
import Button from 'react-bootstrap/Button';
import { useAuth } from "../../context/AuthContext";
import { Player, SingleBracket, ElimBracket, Round, MatchObj, Entrant } from '../../utils/types';
import { createPlayerOrder } from "../../utils/misc";

import SEBracket from '../brackets/SEBracket';

const socket = io(import.meta.env.VITE_API_URL);

export default function Tournament(props: any) {
    const [tournament, setTournament] = useState<any>(null);
    const [bracketNum, setBracketNum] = useState<any>(null);
    const [tourneyData, setTourneyData] = useState<any>(null);
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

            socket.on('connect', () => {
                console.log('connected to server');
            });
            
            socket.on('signup added', (userInfo) => {
                setTourneyData((prev: any) => ({...prev, playerList: [...prev.playerList, userInfo]}));

            })

            socket.on('signup removed', (id) => {
                setTourneyData((prev: any) => ({...prev, playerList: prev.playerList.filter((el: any) => el.player.id != id)}));
            })

            socket.on('matches updated', (matches) => {
                let newRoundList = tourneyDataRef.current.roundList;
                matches?.forEach((ma: any) => {
                    newRoundList[ma.matchCol][ma.matchRow] = ma;
                });
                setTourneyData((prev: any) => ({...prev, roundList: newRoundList}));
            })

            socket.on('placements updated', (placements) => {
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
            })

            setCanSignUp(location.state.canSignUp);
            
            return () => {
                //socket.emit('disc', { tid: tid });
                socket.disconnect();
            }
        }

        return () => {
            effectRan.current = true;
        }

    }, [])

    useEffect(() => {
        tourneyDataRef.current = tourneyData;
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
        console.log(jsonData);
        
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
                winsNeeded: (jsonData.brackets[0]?.wins_needed_default || null)
            }
        });
    }

    const handleReset = async () => {
        let newMatches = tourneyData.roundList.map((e: any, i: number) => {
            return e.map((f: any, j: number) => {
                return { ...f,
                    p1: null,
                    p2: null,
                    winner: null,
                    winsP1: 0,
                    winsP2: 0,
                    isBye: false
                }
            })
        })
        setTourneyData((prev: SingleBracket): SingleBracket => {
            return {
                ...prev,
                playerList: prev.playerList?.map((e: any, i: number) => {
                        return {
                            ...e,
                            placement: null
                        }
                    }),
                roundList: newMatches
            }
        });

        newMatches = newMatches.flat();

        const stResponse = await fetch(import.meta.env.VITE_API_URL+`tournaments/${tid}/resetStandings`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            }
        });

        const response = await fetch(import.meta.env.VITE_API_URL+`matches/update`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            }, body: JSON.stringify({
                matches: newMatches
            })
        });
        const [newMatchJson, newPlJson] = await response.json();
        if (response.status == 200) {
            socket.emit('matches updated', newMatchJson);
            socket.emit('placements updated', newPlJson);
        }
    }

    const handleStart = async () => {
        // assume bracket_type is single elim
        if (1>2/*tourneyData.playerList.length > tourneyData.roundList.length*2*/) {
            console.log('too many players for this bracket');
        } else {
            let playerListWithByes = [...tourneyData.playerList];
            while (Math.floor(Math.log2(playerListWithByes.length)) != Math.log2(playerListWithByes.length)) {
                // will need to be fixed, probably should be null
                let newBye: Entrant = {
                    player: {
                        seed: playerListWithByes.length,
                        tag: 'Bye',
                        isHuman: false
                    },
                    placement: null
                }
                playerListWithByes.push(newBye);
            }
            let seedOrder = createPlayerOrder(playerListWithByes.length);
            let newMatches: any[] = [];

            let mList = [];
            for (let i=0;i<Math.log2(playerListWithByes.length);i++) {
                for (let j=0;j<playerListWithByes.length/Math.pow(2,i);j+=2) {
                    mList.push({
                        p1: (i==0? playerListWithByes[seedOrder[j]-1] : null),
                        p2: (i==0? playerListWithByes[seedOrder[j+1]-1] : null),
                        winner: null,
                        winsP1: 0,
                        winsP2: 0,
                        isBye: (i==0? (playerListWithByes[seedOrder[j]-1].tag == 'Bye' || playerListWithByes[seedOrder[j+1]-1].tag == 'Bye'? true : false) : false),
                        winsNeeded: tourneyData.winsNeeded
                    })
                }
            }
            console.log('mlist:');
            console.log(mList);

            // notes @ end of 6/16
            // double for-loop through numPlayers, divide by 2 each outer loop
            // count by 2 each inner loop
            // create a match object, populate round 1 with players like is already done
            // send off to router.post('/create')



            newMatches = newMatches.map((e: any, i: number): MatchObj => {
                //console.log(!playerListWithByes[seedOrder[i*2]-1].player.isHuman || !playerListWithByes[seedOrder[i*2+1]-1].player.isHuman);
                return {
                    ...e,
                    p1: playerListWithByes[seedOrder[i*2]-1].player,
                    p2: playerListWithByes[seedOrder[i*2+1]-1].player,
                    winner: null,
                    loser: null,
                    isBye: ( !playerListWithByes[seedOrder[i*2]-1].player.isHuman || !playerListWithByes[seedOrder[i*2+1]-1].player.isHuman)
                }
            });
            setTourneyData((prev: SingleBracket): SingleBracket => {
                return {
                    ...prev,
                    playerList: prev.playerList?.map((e: any, i: number) => ({...e, placement: null})),
                    roundList: [newMatches, ...prev.roundList.slice(1)] // probably need to reset all matches and not just first row
                }
            });

            const response = await fetch(import.meta.env.VITE_API_URL+`matches/update`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                }, body: JSON.stringify({
                    matches: newMatches
                })
            });
            const [matchResp, plResp] = await response.json();
            if (response.status == 200) {
                socket.emit('matches updated', matchResp);
                socket.emit('placements updated', plResp);
            }
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
                            socket.emit('signup added', userJson);
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
                            socket.emit('signup removed', session.user.id);
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

    const setMatchRecursive: any = (matchCol: number,
        matchRow: number,
        winsForP1: number,
        winsForP2: number,
        winner: Player | null,
        newP1: Player | null,
        newP2: Player | null) => {

        const isEvenRow: boolean = (matchRow%2 == 0);
/*         console.log(matchCol);
        console.log(matchRow);
        console.log(tourneyData[matchCol][matchRow]); */
        let curP1 = (newP1? newP1 : tourneyData.roundList[matchCol][matchRow].p1);
        let curP2 = (newP2? newP2 : tourneyData.roundList[matchCol][matchRow].p2);
        
        let placementArr = [];
        // build array of placements
        if (!winner) {
            // may create duplicates
            if (curP1) {
                placementArr.push({
                    player: curP1,
                    placement: null
                });
            }
            if (curP2) {
                placementArr.push({
                    player: curP2,
                    placement: null
                });
            }
        } else {
            if (curP1?.id == winner.id) {
                if (matchCol == tourneyData.roundList.length-1) {
                    placementArr.push({
                        player: curP1,
                        placement: 1
                    },{
                        player: curP2,
                        placement: 2
                    })
                } else {
                    placementArr.push({
                        player: curP2,
                        placement: (Math.pow(2, Math.ceil(Math.log(tourneyData.playerList.length)/Math.log(2)))/Math.pow(2,(matchCol+1)))+1
                    })
                }
            } else if (curP2?.id == winner.id) {
                if (matchCol == tourneyData.roundList.length-1) {
                    placementArr.push({
                        player: curP2,
                        placement: 1
                    },{
                        player: curP1,
                        placement: 2
                    })
                } else {
                    placementArr.push({
                        player: curP1,
                        placement: (Math.pow(2, Math.ceil(Math.log(tourneyData.playerList.length)/Math.log(2)))/Math.pow(2,(matchCol+1)))+1
                    })
                }
            }
        }

/*         console.log('debug:');
        console.log(isEvenRow);
        console.log(matchCol);
        console.log(matchRow);
        console.log(tourneyData.roundList); */
        if (matchCol == tourneyData.roundList.length-1 ||
            (isEvenRow && winner?.id == tourneyData.roundList[matchCol+1][Math.floor(matchRow/2)].p1?.id) ||
            (!isEvenRow && winner?.id == tourneyData.roundList[matchCol+1][Math.floor(matchRow/2)].p2?.id)) {
            return [[{...tourneyData.roundList[matchCol][matchRow],
                winsP1: winsForP1,
                winsP2: winsForP2,
                winner: winner,
                ...(newP1 != null && { p1: newP1 }),
                ...(newP2 != null && { p2: newP2 })
            }],
            placementArr
        ];
        } else {
            const recResult = setMatchRecursive(matchCol+1, Math.floor(matchRow/2), 0, 0, null,
                (isEvenRow? winner : null), (isEvenRow? null : winner));
            return [[{...tourneyData.roundList[matchCol][matchRow],
                winsP1: winsForP1,
                winsP2: winsForP2,
                winner: winner,
                ...(newP1 != null && { p1: newP1 }),
                ...(newP2 != null && { p2: newP2 })
            }, ...(recResult[0])],
            [...placementArr, ...(recResult[1])]];
        }
    }

    const setMatchResults: any = async (matchRow: number,
        matchCol: number,
        winsForP1: number,
        winsForP2: number,
        winner: Player | null,
        newP1: Player | null,
        newP2: Player | null) => {
        let [newMatches, newPlacements] = setMatchRecursive(matchCol, matchRow, winsForP1, winsForP2, winner, newP1, newP2);

        // remove duplicates from placement array
        let placementSet = new Set();
        newPlacements = newPlacements.reduce((memo: any, iteratee: any) => {
            if (!placementSet.has(iteratee.player.id)) {
                placementSet.add(iteratee.player.id);
                memo.push(iteratee);
            }

            return memo;
        }, []);

        const response = await fetch(import.meta.env.VITE_API_URL+`matches/update`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            }, body: JSON.stringify({
                matches: newMatches,
                placements: newPlacements
            })
        });
        const respJson = await response.json();
        if (response.status == 200) {
            socket.emit('matches updated', respJson[0]);
            socket.emit('placements updated', respJson[1]);
        }

        let newRoundList = tourneyData.roundList;
        newMatches.map((e: any, i: number) => {
            newRoundList[e.matchCol][e.matchRow] = e;
            return;
        });
        setTourneyData({
            ...tourneyData,
            roundList: newRoundList
        });
    }

    return (
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
                <Button onClick={handleStart}>Initialize Tournament</Button><Button onClick={handleReset}>Reset</Button>
            </div>
            {tourneyData?
                <SEBracket bracketData={tourneyData} setMatchResults={setMatchResults} />
                :
                <></>
            }
        </div>
    );
}