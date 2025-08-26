import { Socket } from "socket.io-client";
import { SingleBracket } from "./types";

export const handleReset = async (tourneyData: any, setTourneyData: any, socket: Socket, tid: string | undefined) => {
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
        socket.emit('matches updated', [newMatchJson, tourneyData.tournamentId]);
        socket.emit('placements updated', [newPlJson, tourneyData.tournamentId]);
    }
}

export function handleSubmitMatchChange (
    curMatch: any,
    setCurMatch: any,
    tempWinsP1: number,
    tempWinsP2: number,
    setMatchResults: any,
    tourneyData: any,
    setTourneyData: any,
    socket: Socket
): any {
    if (tempWinsP1 == tempWinsP2 && tempWinsP1 == curMatch.winsNeeded) {
        // handle error
    } else if (tempWinsP1 != Math.round(tempWinsP1) || tempWinsP2 != Math.round(tempWinsP2)) {
        // handle error--integers only!
    } else if (tempWinsP1 < 0 || tempWinsP2 < 0) {
        // handle error--below-zero
    } else if (tempWinsP1 == curMatch.winsP1 && tempWinsP2 == curMatch.winsP2) {
        // no action needed
    } else if (tempWinsP1 <= curMatch.winsNeeded && tempWinsP2 <= curMatch.winsNeeded) {
        if (tempWinsP1 == curMatch.winsNeeded) {
            // need to consolidate these lines
            setCurMatch({
                ...curMatch,
                winsP1: tempWinsP1,
                winsP2: tempWinsP2,
                winner: curMatch.p1  // unsure if this creates a copy or a reference
            });
            setMatchResults(curMatch.matchRow,
                curMatch.matchCol,
                tempWinsP1,
                tempWinsP2,
                curMatch.p1,
                { type: 'skip' },
                { type: 'skip' },
                tourneyData,
                setTourneyData,
                socket
            );
        } else if (tempWinsP2 == curMatch.winsNeeded) {
            setCurMatch({
                ...curMatch,
                winsP1: tempWinsP1,
                winsP2: tempWinsP2,
                winner: curMatch.p2  // unsure if this creates a copy or a reference
            });
            setMatchResults(curMatch.matchRow,
                curMatch.matchCol,
                tempWinsP1,
                tempWinsP2,
                curMatch.p2,
                { type: 'skip' },
                { type: 'skip' },
                tourneyData,
                setTourneyData,
                socket
            );
        } else {
            setCurMatch({
                ...curMatch,
                winsP1: tempWinsP1,
                winsP2: tempWinsP2,
                winner: null  // unsure if this creates a copy or a reference
            });
            setMatchResults(curMatch.matchRow,
                curMatch.matchCol,
                tempWinsP1,
                tempWinsP2,
                null,
                { type: 'skip' },
                { type: 'skip' },
                tourneyData,
                setTourneyData,
                socket
            );
        }
    } else {
        // handle error--number too large
    }
}