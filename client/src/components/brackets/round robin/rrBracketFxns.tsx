import { Socket } from 'socket.io-client';
import { SingleBracket, MatchObj, Entrant, Result } from '../../../utils/types';
import { createPlayerOrder } from '../../../utils/misc';
import { UpdateAction } from '../BracketTypes';

export const rrCalcResults = (tourneyData: SingleBracket) => {
    // need to use only one of these
    if (tourneyData.roundList == null) return null
    if (tourneyData.roundList.length == 0) return []
    
    let resultsList: Result[] = tourneyData.playerList.map((e: any, i: number) => {
        let singleResult: Result = {
            gw: 0,
            gl: 0,
            mw: 0,
            ml: 0
        };
        for (let j=i;j<tourneyData.playerList.length;j++) {
            if (j != i) {
                singleResult.gw += (tourneyData.roundList[i][j-i-1].winsP1 || 0);
                singleResult.gl += (tourneyData.roundList[i][j-i-1].winsP2 || 0);
                singleResult.mw += ((tourneyData.roundList[i][j-i-1].winner?.uuid == tourneyData.playerList[i].uuid)? 1 : 0);
                singleResult.ml += ((tourneyData.roundList[i][j-i-1].winner?.uuid && tourneyData.roundList[i][j-i-1].winner?.uuid != tourneyData.playerList[i].uuid)? 1 : 0);
            }
        }
        for (let j=i;j>=0;j--) {
            if (j != i) {
                singleResult.gw += (tourneyData.roundList[j][i-j-1].winsP2 || 0);
                singleResult.gl += (tourneyData.roundList[j][i-j-1].winsP1 || 0);
                singleResult.mw += (tourneyData.roundList[j][i-j-1].winner?.uuid == tourneyData.playerList[i].uuid? 1 : 0);
                singleResult.ml += ((tourneyData.roundList[j][i-j-1].winner?.uuid && tourneyData.roundList[j][i-j-1].winner?.uuid != tourneyData.playerList[i].uuid)? 1 : 0);
            }
        }
        return singleResult;
    })
    return resultsList;
}

export const rrHandleInit = async (tourneyData: any, socket: Socket) => {
    let mList = [];
    for (let i=0;i<tourneyData.playerList.length-1;i++) {
        for (let j=0;j<tourneyData.playerList.length-i-1;j++) {
            mList.push({
                p1: null,
                p2: null,
                winner: null,
                winsP1: 0,
                winsP2: 0,
                isBye: false,
                winsNeeded: tourneyData.winsNeeded,
                matchCol: i,
                matchRow: j,
                bracketId: tourneyData.bracketId
            })
        }
    }

    const response = await fetch(import.meta.env.VITE_API_URL+`matches/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        }, body: JSON.stringify({
            matches: mList
        })
    })
    const matchResp = await response.json();
    if (response.status == 200) {
        socket.emit('match list created', [matchResp, tourneyData.tournamentId]);
    }
}

export const rrSetMatchResults: any = async (matchRow: number,
    matchCol: number,
    winsForP1: number,
    winsForP2: number,
    winner: Entrant | null,
    newP1: UpdateAction,    // unused parameters
    newP2: UpdateAction,
    tourneyData: any,
    setTourneyData: any,
    socket: Socket) => {

    let newTourneyData = {...tourneyData};
    newTourneyData.roundList[matchCol][matchRow] = {
        ...newTourneyData.roundList[matchCol][matchRow],
        winsP1: winsForP1,
        winsP2: winsForP2,
        winner: winner,
        
    }


    let isFinished = true;
    for (let i=0;i<newTourneyData.roundList.length;i++) {
        for (let j=0;j<newTourneyData.roundList[i].length;j++) {
            if (newTourneyData.roundList[i][j].winner == null) {
                isFinished = false;
                break;
            }
        }
        if (isFinished == false) {
            break;
        }
    }
    
    if (isFinished) {
        let results = rrCalcResults(newTourneyData);
        let playerStandingList: any[] = newTourneyData.playerList.map((e: Entrant, i: number) => {
            return {
                ...e,
                results: (results? results[i] : null),
                seed: i+1
            }
        });
        
        playerStandingList.sort(function(a, b): any {
            if (a.results.mw !== b.results.mw) {
                return b.results.mw-a.results.mw;
            } else if (a.results.gw !== b.results.gw) {
                return b.results.gw-a.results.gw;
            } else {
                // eventually will need to create a tiebreaker system here
                return a.seed-b.seed;
            }
        })
        
        for (let i=0;i<playerStandingList.length;i++) {
            newTourneyData.playerList[playerStandingList[i].seed-1].placement = i+1;
        }
/*         setTourneyData((prev: SingleBracket): SingleBracket => {
            return {
                ...newTourneyData,
                playerList: newPlayerList
            }
        }) */
    } else {/* 
        setTourneyData((prev: SingleBracket): SingleBracket => {
            return newTourneyData;
        }); */
    }
    
    setTourneyData((prev: SingleBracket): SingleBracket => {
        return newTourneyData;
    });

    const response = await fetch(import.meta.env.VITE_API_URL+`matches/update`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        }, body: JSON.stringify({
            matches: [newTourneyData.roundList[matchCol][matchRow]],
            ...(isFinished && {placements: newTourneyData.playerList})
        })
    });
    const respJson = await response.json();
    if (response.status == 200) {
        socket.emit('matches updated', [respJson[0], tourneyData.tournamentId]);
        if (respJson[1]) socket.emit('placements updated', [respJson[1], tourneyData.tournamentId])
    }
}

export const rrHandleStart = async (tourneyData: any, setTourneyData: any, socket: Socket) => {
    let newRoundList = tourneyData.roundList.map((e: any, i: number) => {
        return e.map((f: any, j: number) => {
            return {
                ...f,
                p1: tourneyData.playerList[i],
                p2: tourneyData.playerList[j+i+1],
                winner: null,
                loser: null,
                isBye: false
            };
        })
    })

    setTourneyData((prev: SingleBracket): SingleBracket => {
        return {
            ...prev,
            playerList: prev.playerList?.map((e: any, i: number) => ({...e, placement: null})),
            roundList: newRoundList
        }
    })

    const response = await fetch(import.meta.env.VITE_API_URL+`matches/update`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        }, body: JSON.stringify({
            matches: newRoundList.flat(),
            newStatus: 'in_progress',
            tid: tourneyData.tournamentId
        })
    });
    const [matchResp, plResp] = await response.json();
    if (response.status == 200) {
        socket.emit('matches updated', [matchResp, tourneyData.tournamentId]);
        socket.emit('placements updated', [plResp, tourneyData.tournamentId]);
        socket.emit('tourney status updated', ['in_progress', tourneyData.tournamentId]);
    }
}