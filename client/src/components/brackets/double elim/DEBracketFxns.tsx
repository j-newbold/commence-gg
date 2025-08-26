import { Socket } from 'socket.io-client';
import { Player, SingleBracket, MatchObj, Entrant } from '../../../utils/types';
import { createPlayerOrder, numSERounds, roundUpPower2 } from '../../../utils/misc';
import { UpdateAction } from '../BracketTypes';


type RecursiveResult =
    [
        MatchObj[],
        Entrant[]
    ];

export const deHandleInit = async (tourneyData: any, socket: Socket) => {
    console.log('initializing tournament');
    let mList: MatchObj[] = [];

    let halveLosersMatches = false;
    let l = Math.floor(roundUpPower2(tourneyData.playerList.length)/4);

    // add winners' bracket matches
    for (let i=0;i<Math.max(numSERounds(tourneyData.playerList.length),(numSERounds(tourneyData.playerList.length)*2-2));i++) {
        // add winners' bracket matches
        for (var j=0;j<numSERounds(tourneyData.playerList.length)-i;j++) {
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
        
        for (let k=0;k<l;k++) {
            mList.push({
                p1: null,
                p2: null,
                winner: null,
                winsP1: 0,
                winsP2: 0,
                isBye: false,
                winsNeeded: tourneyData.winsNeeded,
                matchCol: i,
                matchRow: ((i == numSERounds(tourneyData.playerList.length) || i == (numSERounds(tourneyData.playerList.length)+1))? 1+k : j+k),
                bracketId: tourneyData.bracketId
            });
        }
        if (halveLosersMatches) {
            l = Math.floor(l/2);
        } else {
            halveLosersMatches = !halveLosersMatches;
        }
    }
    
    // add grand finals set 1
    mList.push({
        p1: null,
        p2: null,
        winner: null,
        winsP1: 0,
        winsP2: 0,
        isBye: false,
        winsNeeded: tourneyData.winsNeeded,
        matchCol: numSERounds(tourneyData.playerList.length),
        matchRow: 0,
        bracketId: tourneyData.bracketId
    });

    // add grand finals set 2
    mList.push({
        p1: null,
        p2: null,
        winner: null,
        winsP1: 0,
        winsP2: 0,
        isBye: false,
        winsNeeded: tourneyData.winsNeeded,
        matchCol: numSERounds(tourneyData.playerList.length)+1,
        matchRow: 0,
        bracketId: tourneyData.bracketId
    });
    
    // duplicated code
    const response = await fetch(import.meta.env.VITE_API_URL+`matches/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        }, body: JSON.stringify({
            matches: mList
        })
    });
    const matchResp = await response.json();
    if (response.status == 200) {
        socket.emit('match list created', [matchResp, tourneyData.tournamentId]);
    }
}

// note: returns a number of matches
export function upperBracketHeightAtPos(matchCol: number, seLength: number) {
    // ternary operator is used to account for existence of grand finals
    return ((matchCol == seLength || matchCol == seLength+1)? 1 :
        ((matchCol < seLength)? Math.ceil(Math.pow(2,seLength-matchCol-1)) : 0));
}

function lowerBracketPlacement(matchCol: number, tourneyData: any) {
    let seLength = numSERounds(tourneyData.playerList.length);
    return Math.pow(2,seLength-Math.floor((matchCol+2)/2))
        +1
        +((matchCol%2 == 0)? (tourneyData.roundList[matchCol].length-upperBracketHeightAtPos(matchCol, seLength)) : 0);
}

function findLBWinnerRow(matchCol: number, matchRow: number, seLength: number) {
    let curRowMinusUB = matchRow-upperBracketHeightAtPos(matchCol, seLength);
    const isEvenCol: boolean = (matchCol%2 == 0);
    return (isEvenCol? (curRowMinusUB+upperBracketHeightAtPos(matchCol+1, seLength))
    : Math.floor(curRowMinusUB/2)+upperBracketHeightAtPos(matchCol+1, seLength));
}

function lbOutputsToP1(matchCol: number, matchRow: number, seLength: number) {
    let baseMatchRow = matchRow-upperBracketHeightAtPos(matchCol, seLength);

    if (matchCol == seLength*2-3 || matchCol%2 == 0) {
        return false;
    } else {
        if (baseMatchRow%2 == 0) {
            return true;
        } else {
            return false;
        }
    }
}

function findLBWinnerPlayer(matchCol: number, matchRow: number, tourneyData: any) {
    let seLength = numSERounds(tourneyData.playerList.length);
    let baseMatchRow = matchRow-upperBracketHeightAtPos(matchCol, seLength);
    let nextColLength = upperBracketHeightAtPos(matchCol+1, seLength);

    if (matchCol+1 == seLength) {
        return tourneyData.roundList[matchCol+1][0].p2;
    } else if (matchCol%2 == 0) {
        return tourneyData.roundList[matchCol+1][baseMatchRow+nextColLength].p2;
    } else {
        if (baseMatchRow%2 == 0) {
            return tourneyData.roundList[matchCol+1][Math.floor(baseMatchRow/2)+nextColLength].p1;
        } else {
            return tourneyData.roundList[matchCol+1][Math.floor(baseMatchRow/2)+nextColLength].p2;
        }
    }
}

// note: could calculate numSERounds at the beginning of this fxn
const setMatchRecursive: any = (matchCol: number,
    matchRow: number,
    winsForP1: number,
    winsForP2: number,
    setWinnerAs: Entrant | null,
    newP1: UpdateAction,
    newP2: UpdateAction,
    tourneyData: any,
    placementSet: any) => {

    let recResultFirst: RecursiveResult = [[],[]];

    let recResultSecond: RecursiveResult = [[],[]];

    let placementArr: Entrant[] = [];

    const seLength = numSERounds(tourneyData.playerList.length);
    
    const isLowerBracket: boolean = (matchRow >= upperBracketHeightAtPos(matchCol,seLength));

    // only used in upper bracket, ternary operator not currently necessary
    //const isEvenRow: boolean = (isLowerBracket? ((matchRow-upperBracketHeightAtPos(matchCol, tourneyData.playerList.length))%2 == 0) : (matchRow%2 == 0));
    
    let curP1: Entrant | null = (newP1.type == 'set'? newP1.value : (newP1.type == 'reset'? null : tourneyData.roundList[matchCol][matchRow].p1));
    let curP2: Entrant | null = (newP2.type == 'set'? newP2.value : (newP2.type == 'reset'? null : tourneyData.roundList[matchCol][matchRow].p2));


    // build array of placements
    if (!setWinnerAs && tourneyData.roundList[matchCol][matchRow].winner != null) {
        if (curP1 && !placementSet.has(curP1.uuid)) {
            placementSet.add(curP1.uuid);
            placementArr.push({
                ...curP1,
                placement: null
            });
        }
        if (curP2 && !placementSet.has(curP2.uuid)) {
            placementArr.push({
                ...curP2,
                placement: null
            })
        }
    } else if (setWinnerAs?.uuid != tourneyData.roundList[matchCol][matchRow].winner) {
        if (isLowerBracket) {
            if (curP2 && curP1?.uuid == setWinnerAs?.uuid && !placementSet.has(curP2?.uuid)) {
                placementArr.push({
                    ...curP2,
                    placement: lowerBracketPlacement(matchCol,tourneyData)
                });
            } else if (curP1 && curP2?.uuid == setWinnerAs?.uuid && !placementSet.has(curP1?.uuid)) {
                placementArr.push({
                    ...curP1,
                    placement: lowerBracketPlacement(matchCol,tourneyData)
                });
            }
        } else if ((matchRow == 0 && matchCol == seLength)) {
            // handle grand finals set 1
            if (curP1 && curP2 && setWinnerAs?.uuid == curP1?.uuid) {
                placementArr.push({
                    ...curP1,
                    placement: 1
                }, {
                    ...curP2,
                    placement: 2
                });
            }
        } else if (matchRow == 0 && matchCol == seLength+1) {
            // handle grand finals set 2
            // duplicated code
            if (curP1 && curP2 && setWinnerAs?.uuid == curP1?.uuid) {
                placementArr.push({
                    ...curP1,
                    placement: 1
                }, {
                    ...curP2,
                    placement: 2
                });
            } else if (curP1 && curP2) {
                placementArr.push({
                    ...curP2,
                    placement: 1
                }, {
                    ...curP1,
                    placement: 2
                });
            }
        }
    }

    if (isLowerBracket) {
        // lower bracket recursion

        // lower bracket base case
        if (setWinnerAs?.uuid == findLBWinnerPlayer(matchCol, matchRow, tourneyData)?.uuid) {   // changed from seBracketFxns to account for both values being null
            /* return [
                [
                    {
                        ...tourneyData.roundList[matchCol][matchRow],
                        winsP1: winsForP1,
                        winsP2: winsForP2,
                        winner: setWinnerAs,
                        ...(newP1 != null && { p1: newP1 }),
                        ...(newP2 != null && { p2: newP2 })
                    }
                ],
                placementArr
            ]; */
        } else {
            let nextMatchCol;
            let nextMatchRow;
            // handle losers' finals
            if (matchCol == (seLength*2-3)) {
                nextMatchCol = seLength;
                nextMatchRow = 0;
            } else {
                nextMatchCol = matchCol+1;
                nextMatchRow = findLBWinnerRow(matchCol, matchRow, seLength);
            }
            let outToP1: boolean = lbOutputsToP1(matchCol, matchRow, seLength);
            const winnerOutput: UpdateAction = (setWinnerAs? { type: 'set', value: setWinnerAs }: { type: 'reset' });
            const passOutput: UpdateAction = { type: 'skip' };
            recResultFirst = setMatchRecursive(nextMatchCol,
                nextMatchRow,
                0,
                0,
                null,
                (outToP1? winnerOutput : passOutput),
                (outToP1? passOutput : winnerOutput),
                tourneyData,
                placementSet
            );
        }
    } else {
        // upper bracket recursion
        const isEvenRow: boolean = (matchRow%2 == 0);
        const setLoserAs = (setWinnerAs? ((setWinnerAs == curP1)? curP2 : curP1) : null);

        // upper bracket base case 1, never recurses (GF set 2)
        if (matchCol == seLength+1 && matchRow == 0) {
            // do nothing
        } else if (matchCol == seLength && matchRow == 0) {
            // base case 2 (sometimes recurses) (GF set 1)
            if (((setWinnerAs == null || setWinnerAs?.uuid == curP1?.uuid) && tourneyData.roundList[seLength+1][0].p1 == null) ||
                (setWinnerAs?.uuid == curP2?.uuid && tourneyData.roundList[seLength+1][0].p1 != null)) {
                // moved return statement below

                /* return [
                    [
                        {
                            ...tourneyData.roundList[matchCol][matchRow],
                            winsP1: winsForP1,
                            winsP2: winsForP2,
                            winner: setWinnerAs,
                            ...(newP1 != null && { p1: newP1 }),
                            ...(newP2 != null && { p2: newP2 })
                        }
                    ],
                    placementArr
                ]; */
            } else {
                if (setWinnerAs == null || setWinnerAs?.uuid == curP1?.uuid) {
                    // reset gf2
                    recResultFirst = setMatchRecursive(seLength+1,
                        0,
                        0,
                        0,
                        null,
                        { type: 'reset' },
                        { type: 'reset' },
                        tourneyData,
                        placementSet
                    );
                } else {
                    // init gf2
                    recResultFirst = setMatchRecursive(seLength+1,
                        0,
                        0,
                        0,
                        null,
                        { type: 'set', value: curP1 },
                        { type: 'set', value: curP2 },
                        tourneyData,
                        placementSet
                    );
                }
            }
        } else {
            // recurse (upper bracket)
            if (setWinnerAs?.uuid != findUpperBracketOutput(matchCol, matchRow, tourneyData, isEvenRow)?.uuid) {
                const winnerOutput: UpdateAction = (setWinnerAs? { type: 'set', value: setWinnerAs }: { type: 'reset' });
                recResultFirst = setMatchRecursive(matchCol+1,
                    Math.floor(matchRow/2),
                    0,
                    0,
                    null,
                    (isEvenRow? winnerOutput : { type: 'skip' }),
                    (isEvenRow? { type: 'skip' } : winnerOutput),
                    tourneyData,
                    placementSet
                );
            }
            if (setLoserAs?.uuid != findLowerBracketOutput(matchCol, matchRow, tourneyData, isEvenRow)?.uuid) {
                const loserOutput: UpdateAction = (setLoserAs? { type: 'set', value: setLoserAs }: { type: 'reset' });
                recResultSecond = setMatchRecursive(lowerBracketMatchCol(matchCol),
                    lowerBracketMatchRow(matchCol, matchRow, seLength),
                    0,
                    0,
                    null,
                    ((matchCol > 0 || isEvenRow)? loserOutput : { type: 'skip' }),
                    ((matchCol == 0 && !isEvenRow)? loserOutput : { type: 'skip' }),
                    tourneyData,
                    placementSet
                );
            }
        }
    }
    return [
        [
            {
                ...tourneyData.roundList[matchCol][matchRow],
                winsP1: winsForP1,
                winsP2: winsForP2,
                winner: setWinnerAs,
                ...((newP1.type == 'reset')? { p1: null } : (newP1.type == 'set' && {p1: newP1.value})),
                ...((newP2.type == 'reset')? { p2: null } : (newP2.type == 'set' && {p2: newP2.value})),
            },
            ...(recResultFirst? recResultFirst[0] : []),    // could do null at the end of these lines instead of []
            ...(recResultSecond? recResultSecond[0] : [])
        ],
        [
            ...placementArr,
            ...(recResultFirst? recResultFirst[1] : []),
            ...(recResultSecond? recResultSecond[1] : [])
        ]
    ];
}

function findUpperBracketOutput(matchCol: number, matchRow: number, tourneyData: any, isEvenRow: boolean) {
    return (isEvenRow?
        tourneyData.roundList[matchCol+1][Math.floor(matchRow/2)].p1
        :
        tourneyData.roundList[matchCol+1][Math.floor(matchRow/2)].p2
    );
}

function findLowerBracketOutput(matchCol: number, matchRow: number, tourneyData: any, isEvenRow: boolean) {
    let seLength = numSERounds(tourneyData.playerList.length);
    let newCol = ((matchCol == 0)? 0 : matchCol*2-1);
    let newRow = upperBracketHeightAtPos(matchCol, seLength)+
        ((matchCol == 0)? Math.floor(matchRow/2) : matchRow);
    return (isEvenRow? tourneyData.roundList[newCol][newRow].p1 : tourneyData.roundList[newCol][newRow].p2);
}

function lowerBracketMatchCol(matchCol: number) {
    return ((matchCol == 0)? 0 : matchCol*2-1);
}

function lowerBracketMatchRow(matchCol: number, matchRow: number, seLength: number) {
    return ((matchCol == 0)? Math.floor(matchRow/2) : matchRow)+upperBracketHeightAtPos(lowerBracketMatchCol(matchCol), seLength);
}

export const deSetMatchResults: any = async (matchRow: number,
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
        newP1, // newp1/p2 are guaranteed to be 'skip' currently, but just in case
        newP2,
        tourneyData,
        new Set());
    
    // remove duplicates from placement array
    let placementSet = new Set();
    newPlacements = newPlacements.reduce((memo: any, iteratee: any) => {
        if (!placementSet.has(iteratee.uuid)) {
            placementSet.add(iteratee.uuid);
            memo.push(iteratee);
        } else {
            console.log('duplicate found');
        }

        return memo;
    }, []);

    console.log('new matches:');
    console.log(newMatches);

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

export const deHandleStart = async (tourneyData: any, setTourneyData: any, socket: Socket) => {
    let playerListWithByes = [...tourneyData.playerList];
    let maxLength = roundUpPower2(tourneyData.playerList.length/2);
    while (playerListWithByes.length < maxLength) {
        let newBye: Entrant = {
            tag: 'Bye',
            isHuman: false,
            placement: null,
            id: playerListWithByes.length+1,    // seed
            uuid: null
        }
        playerListWithByes.push(newBye);
    }
    
    let seedOrder = createPlayerOrder(playerListWithByes.length);
    let newMatches = tourneyData.roundList[0].slice(0,maxLength);

    newMatches = newMatches.map((e: any, i: number): MatchObj => {
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
            roundList: [[...newMatches, ...prev.roundList[0].slice(maxLength)], ...prev.roundList.slice(1)] // probably need to reset all matches and not just first row
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