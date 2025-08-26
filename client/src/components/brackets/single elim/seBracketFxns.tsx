import { Socket } from 'socket.io-client';
import { Player, SingleBracket, MatchObj, Entrant } from '../../../utils/types';
import { createPlayerOrder } from '../../../utils/misc';
import { Placeholder } from 'react-bootstrap';
import { UpdateAction } from '../BracketTypes';
import { numSERounds } from '../../../utils/misc';


export const seHandleInit = async (tourneyData: any, socket: Socket) => {
    let mList = [];
    for (let i=0;i<Math.log2(tourneyData.playerList.length);i++) {
        for (let j=0;j<tourneyData.playerList.length/Math.pow(2,i);j+=2) {
            mList.push({
                p1: null,
                p2: null,
                winner: null,
                winsP1: 0,
                winsP2: 0,
                isBye: false,
                winsNeeded: tourneyData.winsNeeded,
                matchCol: i,
                matchRow: j/2,
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

const setMatchRecursive: any = (matchCol: number,
    matchRow: number,
    winsForP1: number,
    winsForP2: number,
    setWinnerAs: Entrant | null,
    newP1: UpdateAction,
    newP2: UpdateAction,
    tourneyData: any) => {

    const seLength = numSERounds(tourneyData.playerList.length);
    const isEvenRow: boolean = (matchRow%2 == 0);
    let curP1: Entrant | null = (newP1.type == 'set'? newP1.value : (newP1.type == 'reset'? null : tourneyData.roundList[matchCol][matchRow].p1));
    let curP2: Entrant | null = (newP2.type == 'set'? newP2.value : (newP2.type == 'reset'? null : tourneyData.roundList[matchCol][matchRow].p2));
    
    let placementArr: Entrant[] = [];
    // build array of placements
    if (!setWinnerAs) {
        // may create duplicates
        if (curP1) {
            placementArr.push({
                ...curP1,
                placement: null
            });
        }
        if (curP2) {
            placementArr.push({
                ...curP2,
                placement: null
            });
        }
    } else {
        if (curP1?.uuid == setWinnerAs.uuid) {
            placementArr.push(...addToPlacements(matchCol,curP1,curP2,seLength));
        } else if (curP2?.uuid == setWinnerAs.uuid) {
            placementArr.push(...addToPlacements(matchCol,curP2,curP1,seLength));
        }
    }
    
    // base case
    if (matchCol == tourneyData.roundList.length-1 ||
        (isEvenRow && setWinnerAs?.uuid == tourneyData.roundList[matchCol+1][Math.floor(matchRow/2)].p1?.uuid) ||
        (!isEvenRow && setWinnerAs?.uuid == tourneyData.roundList[matchCol+1][Math.floor(matchRow/2)].p2?.uuid)) {
        return [[{...tourneyData.roundList[matchCol][matchRow],
            winsP1: winsForP1,
            winsP2: winsForP2,
            winner: setWinnerAs,
            ...((newP1.type == 'reset')? { p1: null } : (newP1.type == 'set' && {p1: newP1.value})),
            ...((newP2.type == 'reset')? { p2: null } : (newP2.type == 'set' && {p2: newP2.value})),

        }],
        placementArr
    ];
    } else {
        // recursion
        const winnerOutput: UpdateAction = (setWinnerAs? { type: 'set', value: setWinnerAs }: { type: 'reset' });
        const recResult = setMatchRecursive(matchCol+1,
            Math.floor(matchRow/2),
            0,
            0,
            null,
            (isEvenRow? winnerOutput : { type: 'skip' }),
            (isEvenRow? { type: 'skip' } : winnerOutput),
            tourneyData
        );
        return [[{...tourneyData.roundList[matchCol][matchRow],
            winsP1: winsForP1,
            winsP2: winsForP2,
            winner: setWinnerAs,
            ...((newP1.type == 'reset')? { p1: null } : (newP1.type == 'set' && {p1: newP1.value})),
            ...((newP2.type == 'reset')? { p2: null } : (newP2.type == 'set' && {p2: newP2.value})),
        }, ...(recResult[0])],
        [...placementArr, ...(recResult[1])]];
    }
}

function addToPlacements(matchCol: number, winner: Entrant | null, loser: Entrant | null, seLength: number) {
    let ret = [];
    console.log('add to placements:');
    console.log(winner);
    console.log(loser);
    if (winner && loser && matchCol == seLength-1) {
        ret.push({
            ...winner,
            placement: 1
        }, {
            ...loser,
            placement: 2
        })
    } else if (loser) {
        ret.push({
            ...loser,
            placement: (Math.pow(2, seLength))/(Math.pow(2,1+matchCol))+1
        })
    }

    return ret;
}

export const seSetMatchResults: any = async (matchRow: number,
    matchCol: number,
    winsForP1: number,
    winsForP2: number,
    winner: Entrant | null,
    newP1: UpdateAction,
    newP2: UpdateAction,
    tourneyData: any,
    setTourneyData: any,
    socket: Socket) => {
    let [newMatches, newPlacements] = setMatchRecursive(matchCol,
        matchRow,
        winsForP1,
        winsForP2,
        winner,
        newP1,
        newP2,
        tourneyData);

    // remove duplicates from placement array
    let placementSet = new Set();
    newPlacements = newPlacements.reduce((memo: any, iteratee: any) => {
        if (!placementSet.has(iteratee.uuid)) {
            placementSet.add(iteratee.uuid);
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
        socket.emit('matches updated', [respJson[0], tourneyData.tournamentId]);
        socket.emit('placements updated', [respJson[1], tourneyData.tournamentId]);
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

export const seHandleStart = async (tourneyData: any, setTourneyData: any, socket: Socket) => {
    if (1 > 2) {
        console.log('too many players for this bracket');
    } else {
        let playerListWithByes = [...tourneyData.playerList];
        while (Math.floor(Math.log2(playerListWithByes.length)) != Math.log2(playerListWithByes.length)) {
            // will need to be fixed, probably should be null
            let newBye: Entrant = {
                tag: 'Bye',
                isHuman: false,
                placement: null,
                id: playerListWithByes.length+1,
                uuid: null
            }
            playerListWithByes.push(newBye);
        }
        let seedOrder = createPlayerOrder(playerListWithByes.length);
        let newMatches = tourneyData.roundList[0];

        newMatches = newMatches.map((e: any, i: number): MatchObj => {
            //console.log(!playerListWithByes[seedOrder[i*2]-1].player.isHuman || !playerListWithByes[seedOrder[i*2+1]-1].player.isHuman);
            return {
                ...e,
                p1: playerListWithByes[seedOrder[i*2]-1],
                p2: playerListWithByes[seedOrder[i*2+1]-1],
                winner: null,
                loser: null,
                isBye: ( !playerListWithByes[seedOrder[i*2]-1].isHuman || !playerListWithByes[seedOrder[i*2+1]-1].isHuman)
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
            socket.emit('matches updated', [matchResp, tourneyData.tournamentId]);
            socket.emit('placements updated', [plResp, tourneyData.tournamentId]);
        }
    }
}