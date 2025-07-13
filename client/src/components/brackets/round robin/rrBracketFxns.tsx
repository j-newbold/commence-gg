import { Socket } from 'socket.io-client';
import { Player, SingleBracket, MatchObj, Entrant } from '../../../utils/types';
import { createPlayerOrder } from '../../../utils/misc';

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
    winner: Player | null,
    newP1: Player | null,
    newP2: Player | null,
    tourneyData: any,
    setTourneyData: any,
    socket: Socket) => {

    let newTourneyData = tourneyData;
    newTourneyData.roundList[matchCol][matchRow] = {
        ...newTourneyData.roundList[matchCol][matchRow],
        winsP1: winsForP1,
        winsP2: winsForP2,
        winner: winner,
        
    }
    setTourneyData(newTourneyData);

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
    console.log(isFinished);    // need to create standings etc once this is confirmed to work

    const response = await fetch(import.meta.env.VITE_API_URL+`matches/update`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        }, body: JSON.stringify({
            matches: [newTourneyData.roundList[matchCol][matchRow]]
        })
    });
    const respJson = await response.json();
    if (response.status == 200) {
        socket.emit('matches updated', [respJson[0], tourneyData.tournamentId]);
    }
}

export const rrHandleStart = async (tourneyData: any, setTourneyData: any, socket: Socket) => {
    let newRoundList = tourneyData.roundList.map((e: any, i: number) => {
        return e.map((f: any, j: number) => {
            return {
                ...f,
                p1: tourneyData.playerList[i].player,
                p2: tourneyData.playerList[j+i+1].player,
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