import { Socket } from 'socket.io-client';
import { Player, SingleBracket, MatchObj, Entrant } from '../../../utils/types';
import { createPlayerOrder } from '../../../utils/misc';
import { Placeholder } from 'react-bootstrap';


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
    setWinnerAs: Player | null,
    newP1: Player | null,
    newP2: Player | null,
    tourneyData: any) => {

    const isEvenRow: boolean = (matchRow%2 == 0);
    let curP1 = (newP1? newP1 : tourneyData.roundList[matchCol][matchRow].p1);
    let curP2 = (newP2? newP2 : tourneyData.roundList[matchCol][matchRow].p2);
    
    let placementArr = [];
    // build array of placements
    if (!setWinnerAs) {
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
        if (curP1?.id == setWinnerAs.id) {
            placementArr.push(...addToPlacements(matchCol,curP1,curP2,tourneyData.playerList.length));
        } else if (curP2?.id == setWinnerAs.id) {
            placementArr.push(...addToPlacements(matchCol,curP2,curP1,tourneyData.playerList.length));
        }
    }
    
    // base case
    if (matchCol == tourneyData.roundList.length-1 ||
        (isEvenRow && setWinnerAs?.id == tourneyData.roundList[matchCol+1][Math.floor(matchRow/2)].p1?.id) ||
        (!isEvenRow && setWinnerAs?.id == tourneyData.roundList[matchCol+1][Math.floor(matchRow/2)].p2?.id)) {
        return [[{...tourneyData.roundList[matchCol][matchRow],
            winsP1: winsForP1,
            winsP2: winsForP2,
            winner: setWinnerAs,
            ...(newP1 != null && { p1: newP1 }),
            ...(newP2 != null && { p2: newP2 })
        }],
        placementArr
    ];
    } else {
        // recursion
        const recResult = setMatchRecursive(matchCol+1,
            Math.floor(matchRow/2),
            0,
            0,
            null,
            (isEvenRow? setWinnerAs : null),
            (isEvenRow? null : setWinnerAs),
            tourneyData
        );
        return [[{...tourneyData.roundList[matchCol][matchRow],
            winsP1: winsForP1,
            winsP2: winsForP2,
            winner: setWinnerAs,
            ...(newP1 != null && { p1: newP1 }),
            ...(newP2 != null && { p2: newP2 })
        }, ...(recResult[0])],
        [...placementArr, ...(recResult[1])]];
    }
}

function addToPlacements(matchCol: number, winner: Player, loser: Player, numPlayers: number) {
    let ret = [];
    if (matchCol == numPlayers-1) {
        ret.push({
            player: winner,
            placement: 1
        }, {
            player: loser,
            placement: 2
        })
    } else {
        ret.push({
            player: loser,
            placement: (Math.pow(2, Math.ceil(Math.log(numPlayers)/Math.log(2)))/Math.pow(2,(matchCol+1)))+1
        })
    }

    return ret;
}

export const seSetMatchResults: any = async (matchRow: number,
    matchCol: number,
    winsForP1: number,
    winsForP2: number,
    winner: Player | null,
    newP1: Player | null,
    newP2: Player | null,
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
        let newMatches = tourneyData.roundList[0];

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
            socket.emit('matches updated', [matchResp, tourneyData.tournamentId]);
            socket.emit('placements updated', [plResp, tourneyData.tournamentId]);
        }
    }
}