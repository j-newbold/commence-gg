import { Socket } from 'socket.io-client';
import { Player, SingleBracket, MatchObj, Entrant } from '../../../utils/types';
import { createPlayerOrder, numRounds, roundUpPower2 } from '../../../utils/misc';

export const deHandleInit = async (tourneyData: any, socket: Socket) => {
    console.log('initializing tournament');
    let mList: MatchObj[] = [];

    let halveLosersMatches = false;
    let l = Math.floor(roundUpPower2(tourneyData.playerList.length)/4);

    // add winners' bracket matches
    for (let i=0;i<Math.max(numRounds(tourneyData.playerList.length),(numRounds(tourneyData.playerList.length)*2-2));i++) {
        // add winners' bracket matches
        for (var j=0;j<numRounds(tourneyData.playerList.length)-i;j++) {
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
                matchRow: (i == numRounds(tourneyData.playerList.length)? 1+k : j+k),
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
        matchCol: numRounds(tourneyData.playerList.length),
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
        matchCol: -1,
        matchRow: -1,
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
export function upperBracketLengthAtPos(matchCol: number, numPlayers: number) {
    // ternary operator is used to account for existence of grand finals
    return ((matchCol > numRounds(numPlayers))? 0 : Math.ceil(roundUpPower2(numPlayers)/Math.pow(2,matchCol+1)));
}

function lowerBracketPlacement(matchCol: number, tourneyData: any) {
    let numPlayers = tourneyData.playerList.length;
    return Math.pow(2,numRounds(numPlayers)-Math.floor((matchCol+2)/2))
        +1
        +((matchCol%2 == 0)? (tourneyData.roundList[matchCol].length-upperBracketLengthAtPos(matchCol, numPlayers)) : 0);
}

function findLBWinnerRow(matchCol: number, matchRow: number, numPlayers: number) {
    let curRowMinusUB = matchRow-upperBracketLengthAtPos(matchCol, numPlayers);
    const isEvenCol: boolean = (matchCol%2 == 0);
    return (isEvenCol? (curRowMinusUB+upperBracketLengthAtPos(matchCol+1, numPlayers))
    : Math.floor(curRowMinusUB/2)+upperBracketLengthAtPos(matchCol+1, numPlayers));
}

function lbOutputsToP1(matchCol: number, matchRow: number, numPlayers: number) {
    let baseMatchRow = matchRow-upperBracketLengthAtPos(matchCol, numPlayers);

    if (matchCol == numRounds(numPlayers)*2-3 || matchCol%2 == 0) {
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
    let baseMatchRow = matchRow-upperBracketLengthAtPos(matchCol, tourneyData.playerList.length);
    let nextColLength = upperBracketLengthAtPos(matchCol+1, tourneyData.playerList.length);
    console.log('flbwp');
    console.log(baseMatchRow);
    console.log(nextColLength);
    console.log('...');
    console.log(matchCol);
    console.log(matchRow);

    if (matchCol+1 == numRounds(tourneyData.playerList.length)) {
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

// note: could calculate numRounds at the beginning of this fxn
const setMatchRecursive: any = (matchCol: number,
    matchRow: number,
    winsForP1: number,
    winsForP2: number,
    setWinnerAs: Player | null,
    newP1: Player | null,
    newP2: Player | null,
    tourneyData: any) => {
    
    console.log('set match recursive de');
    console.log(matchCol);
    console.log(matchRow);
    
    const isLowerBracket: boolean = (matchRow >= upperBracketLengthAtPos(matchCol,tourneyData.playerList.length));

    // only used in upper bracket, ternary operator not currently necessary
    //const isEvenRow: boolean = (isLowerBracket? ((matchRow-upperBracketLengthAtPos(matchCol, tourneyData.playerList.length))%2 == 0) : (matchRow%2 == 0));
    
    let curP1 = (newP1? newP1 : (matchCol == -1? tourneyData.finals?.p1 : tourneyData.roundList[matchCol][matchRow].p1));
    let curP2 = (newP2? newP2 : (matchCol == -1? tourneyData.finals?.p2 : tourneyData.roundList[matchCol][matchRow].p2));

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
            })
        }
    } else {
        if (isLowerBracket) {
            if (curP1?.id == setWinnerAs.id) {
                placementArr.push({
                    player: curP2,
                    placement: lowerBracketPlacement(matchCol,tourneyData)
                });
            } else if (curP2?.id == setWinnerAs.id) {
                placementArr.push({
                    player: curP1,
                    placement: lowerBracketPlacement(matchCol,tourneyData)
                });
            }
        } else if ((matchRow == 0 && matchCol == numRounds(tourneyData.playerList.length))) {
            // handle grand finals set 1
            if (setWinnerAs.id == curP1?.id) {
                placementArr.push({
                    player: curP1,
                    placement: 1
                }, {
                    player: curP2,
                    placement: 2
                });
            }
        } else if (matchRow == -1 && matchCol == -1) {
            // handle grand finals set 2
            // duplicated code
            if (setWinnerAs.id == curP1?.id) {
                placementArr.push({
                    player: curP1,
                    placement: 1
                }, {
                    player: curP2,
                    placement: 2
                });
            } else {
                placementArr.push({
                    player: curP2,
                    placement: 1
                }, {
                    player: curP1,
                    placement: 2
                });
            }
        }
    }

    if (isLowerBracket) {
        // lower bracket recursion

        // lower bracket base case
        // technically not a base case since LF sends its winner up to GF
        if (setWinnerAs?.id == findLBWinnerPlayer(matchCol, matchRow, tourneyData)?.id) {   // changed from seBracketFxns to account for both values being null
            // duplicated code
            return [
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
            ];
        } else {
            let nextMatchCol;
            let nextMatchRow;
            // handle losers' finals
            if (matchCol == (numRounds(tourneyData.playerList.length)*2-3)) {
                nextMatchCol = numRounds(tourneyData.playerList.length);
                nextMatchRow = 0;
            } else {
                nextMatchCol = matchCol+1;
                nextMatchRow = findLBWinnerRow(matchCol, matchRow, tourneyData.playerList.length);
            }
            let outToP1: boolean = lbOutputsToP1(matchCol, matchRow, tourneyData.playerList.length);
            const recResult = setMatchRecursive(nextMatchCol,
                nextMatchRow,
                0,
                0,
                null,
                (outToP1? setWinnerAs : null),
                (outToP1? null : setWinnerAs),
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
        
    } else {
        // upper bracket recursion
        const isEvenRow: boolean = (matchRow%2 == 0);
        const setLoserAs = (setWinnerAs? ((setWinnerAs == curP1)? curP2 : curP1) : null);
        console.log('...');
        console.log(setWinnerAs);
        console.log(curP1);

        // upper bracket base case 1
        if (matchCol == -1 && matchRow == -1) {
            return [
                [
                    {
                        ...tourneyData.finals,
                        winsP1: winsForP1,
                        winsP2: winsForP2,
                        winner: setWinnerAs,
                        ...(newP1 != null && { p1: newP1 }),
                        ...(newP2 != null && { p2: newP2 })
                    }
                ],
                placementArr
            ];  // base case 2 (sometimes recurses)
        } else if (matchCol == numRounds(tourneyData.playerList.length) && matchRow == 0) {
            if (((setWinnerAs == null || setWinnerAs?.id == curP1.id) && tourneyData.finals.p1 == null) ||
                (setWinnerAs?.id == curP2?.id && tourneyData.finals.p1 != null)) {
                return [
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
                ];
            } else {
                if (setWinnerAs == null || setWinnerAs?.id == curP1.id) {
                    // reset gf2
                    const recResult = setMatchRecursive(-1,
                        -1,
                        0,
                        0,
                        null,
                        null,
                        null,
                        tourneyData
                    );
                    return [
                        [
                            {...tourneyData.roundList[matchCol][matchRow],
                                winsP1: winsForP1,
                                winsP2: winsForP2,
                                winner: setWinnerAs,
                                ...(newP1 != null && { p1: newP1 }),
                                ...(newP2 != null && { p2: newP2 })
                            },
                            ...(recResult[0])
                        ],
                        [...placementArr, ...(recResult[1])]
                    ];
                } else {
                    // init gf2
                    const recResult = setMatchRecursive(-1,
                        -1,
                        0,
                        0,
                        null,
                        curP1,
                        curP2,
                        tourneyData
                    );
                    return [
                        [
                            {...tourneyData.roundList[matchCol][matchRow],
                                winsP1: winsForP1,
                                winsP2: winsForP2,
                                winner: setWinnerAs,
                                ...(newP1 != null && { p1: newP1 }),
                                ...(newP2 != null && { p2: newP2 })
                            },
                            ...(recResult[0])
                        ],
                        [...placementArr, ...(recResult[1])]
                    ];
                }
            }
        } else {
            // recurse (upper bracket)
            var recResultUpper = null;
            var recResultLower = null;
            console.log(findUpperBracketOutput(matchCol, matchRow, tourneyData, isEvenRow)?.id);
            if (setWinnerAs?.id != findUpperBracketOutput(matchCol, matchRow, tourneyData, isEvenRow)?.id) {
                console.log('recurse upper');
                recResultUpper = setMatchRecursive(matchCol+1,
                    Math.floor(matchRow/2),
                    0,
                    0,
                    null,
                    (isEvenRow? setWinnerAs : null),
                    (isEvenRow? null : setWinnerAs),
                    tourneyData
                );
            }
            if (setLoserAs?.id != findLowerBracketOutput(matchCol, matchRow, tourneyData, isEvenRow)?.id) {
                console.log('recurse lower');
                recResultLower = setMatchRecursive(lowerBracketMatchCol(matchCol),
                    lowerBracketMatchRow(matchCol, matchRow, tourneyData.playerList.length),
                    0,
                    0,
                    null,
                    ((matchCol > 0 || isEvenRow)? setLoserAs : null),
                    ((matchCol == 0 && !isEvenRow)? setLoserAs : null),
                    tourneyData
                );
            }

            return [[{
                ...tourneyData.roundList[matchCol][matchRow],
                winsP1: winsForP1,
                winsP2: winsForP2,
                winner: setWinnerAs,
                ...(newP1 != null && { p1: newP1 }),
                ...(newP2 != null && { p2: newP2 })
            }, ...(recResultUpper? recResultUpper[0] : []),
                ...(recResultLower? recResultLower[0] : [])],
            [
                ...placementArr,
                ...(recResultUpper? recResultUpper[1] : []),
                ...(recResultLower? recResultLower[1] : [])
            ]];
        }
    }
}

function findUpperBracketOutput(matchCol: number, matchRow: number, tourneyData: any, isEvenRow: boolean) {
    return (isEvenRow?
        tourneyData.roundList[matchCol+1][Math.floor(matchRow/2)].p1
        :
        tourneyData.roundList[matchCol+1][Math.floor(matchRow/2)].p2
    );
}

function findLowerBracketOutput(matchCol: number, matchRow: number, tourneyData: any, isEvenRow: boolean) {
    let newCol = ((matchCol == 0)? 0 : matchCol*2-1);
    let newRow = upperBracketLengthAtPos(matchCol, tourneyData.playerList.length)+
        ((matchCol == 0)? Math.floor(matchRow/2) : matchRow);
    return (isEvenRow? tourneyData.roundList[newCol][newRow].p1 : tourneyData.roundList[newCol][newRow].p2);
}

function lowerBracketMatchCol(matchCol: number) {
    return ((matchCol == 0)? 0 : matchCol*2-1);
}

function lowerBracketMatchRow(matchCol: number, matchRow: number, numPlayers: number) {
    return ((matchCol == 0)? Math.floor(matchRow/2) : matchRow)+upperBracketLengthAtPos(lowerBracketMatchCol(matchCol), numPlayers);
}

export const deSetMatchResults: any = async (matchRow: number,
    matchCol: number,
    winsForP1: number,
    winsForP2: number,
    winner: Player | null,
    newP1: Player | null,
    newP2: Player | null,
    tourneyData: any,
    setTourneyData: any,
    socket: Socket) => {
    console.log('de set match results');
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
    let newFinals = null;
    newMatches.map((e: any, i: number) => {
        if (e.matchCol == -1) {
            newFinals = e;
        } else {
            newRoundList[e.matchCol][e.matchRow] = e;
        }
        return;
    });
    setTourneyData({
        ...tourneyData,
        roundList: newRoundList,
        ...(newFinals != null && { finals: newFinals })
    });
}

export const deHandleStart = async (tourneyData: any, setTourneyData: any, socket: Socket) => {
    let playerListWithByes = [...tourneyData.playerList];
    let maxLength = roundUpPower2(tourneyData.playerList.length/2);
    while (playerListWithByes.length < maxLength) {
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
    let newMatches = tourneyData.roundList[0].slice(0,maxLength);

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