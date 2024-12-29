import { Player, SingleBracket, ElimBracket, Round, MatchObj, FinalsMatchObj } from './types.tsx';
import { randStr, createPlayerOrder, sumBooleans } from './misc.tsx';
import { RRPool, RRMatchObj } from './types.tsx';
import RRMatch from '../components/RRMatch.tsx';

export const createRRPool = (numPlayers: number) => {
    let playerList: Player[] = [];
    for (var i=0;i<numPlayers;i++) {
        let newPlayer = {
            seed: i+1,
            name: randStr(),
            isHuman: true
        };
        playerList.push(newPlayer);
    }

    let newMatchList: RRMatchObj[][] = [];

    for (i=0;i<numPlayers;i++) {
        let newMatchRow: RRMatchObj[] = [];
        for (let j=i+1;j<numPlayers;j++) {
            let newMatch: RRMatchObj = {
                p1: playerList[i],
                p2: playerList[j],
                gameCount: [0, 0]
            }
            newMatchRow.push(newMatch);
        }
        if (newMatchRow.length > 0) {
            newMatchList.push(newMatchRow);
        }
    }

    let placements = new Array<number>(numPlayers).fill(0);
    let results = new Array<number[]>(numPlayers).fill([0,0,0,0]);
    
    let ret: RRPool = {
            playerList: playerList,
            matchList: newMatchList,
            resultsList: results,
            placements: placements,
            winsNeeded: 2,
            matchesFinished: 0
    };
    return ret;
}

export const createElimBracket = (numPlayers: number, lossesToElim: number) => {
    let numRounds = Math.ceil(Math.log2(numPlayers))
    let totalSlots = Math.pow(2, numRounds);
    let playerList: Player[] = [];
    let newElimBracket: ElimBracket = {
        bracketList: []
    };
    
    // create players
    for (var i=0;i<totalSlots;i++) {
        let newPlayer = {
            seed: i+1,
            name: '',
            isHuman: true
        };
        if (i < numPlayers) {
            newPlayer.name = randStr();
        } else {
            newPlayer.name = 'Bye'
            newPlayer.isHuman = false
        }
        playerList.push(newPlayer);
    }

    let seedingArr = createPlayerOrder(playerList.length);

    // add players to tournament
    let matchCounter:number;
    let doubleCounter:number;
    let increment:number;

    let idCounter:number = 0;

    for (var k=0;k<lossesToElim;k++) {
        let newSingleBracket: SingleBracket = {        
            roundList: []
        }

        matchCounter = 0;
        doubleCounter = 0;
        increment = 1;
        
        // go backward to populate list
        while (matchCounter < playerList.length - 1 - k) {
            let newRound: Round = {
                matchList: [],
                roundId: doubleCounter
            }
            matchCounter += increment;
            for (let l=0;l<increment;l++) {
                let newMatch: MatchObj = {
                    matchId: idCounter,
                    winner: null,
                    loser: null,
                    p1Input: null,
                    p2Input: null,
                    p2SetWinsNeeded: 1
                };
                if (k == 0 && matchCounter == playerList.length-1) {
                    newMatch.p1 = playerList[seedingArr[idCounter*2]-1];
                    newMatch.p2 = playerList[seedingArr[idCounter*2+1]-1];
                    idCounter += 1
                }
                newRound.matchList?.push(newMatch);
            }
            doubleCounter += 1;
            if (doubleCounter%(k+1) == 0) {
                increment *= 2;
            }
            newSingleBracket.roundList.unshift(newRound)
        }

        // go forward to populate match id's
        let prevRoundCounter: number = 0;
        let prevMatchCounter: number = 0;
        for (let l=0;l<newSingleBracket.roundList.length;l++) {
            for (let m=0;m<newSingleBracket.roundList[l].matchList.length;m++) {
                if (l == 0 && k == 0) {

                } else if (l > 0 && newSingleBracket.roundList[l].matchList.length < newSingleBracket.roundList[l-1].matchList.length) {
                    newSingleBracket.roundList[l].matchList[m].p1Input =
                        [k,l-1,m*2,true];
                    newSingleBracket.roundList[l].matchList[m].p2Input =
                        [k,l-1,m*2+1,true];
                } else {
                    newSingleBracket.roundList[l].matchList[m].p1Input =
                        [k-1,prevRoundCounter,prevMatchCounter,false];

                    prevMatchCounter += 1;
                    if (prevMatchCounter == newElimBracket.bracketList[k-1].roundList[prevRoundCounter].matchList.length) {
                        prevMatchCounter = 0;
                        prevRoundCounter += 1;
                    }
                    
                    if (l == 0) {
                        newSingleBracket.roundList[l].matchList[m].p2Input =
                            [k-1,prevRoundCounter,prevMatchCounter,false];
    
                        // duplicated code!
                        prevMatchCounter += 1;
                        if (k > 0 && prevMatchCounter == newElimBracket.bracketList[k-1].roundList[prevRoundCounter].matchList.length) {
                            prevMatchCounter = 0;
                            prevRoundCounter += 1;
                        }
                    } else {
                        newSingleBracket.roundList[l].matchList[m].p2Input = [k,l-1,m,true];
                    }
                }
            }
        }



        newElimBracket.bracketList.push(newSingleBracket);
    }

    // add finals matches
    if (lossesToElim > 1) {
        for (k=0;k<lossesToElim-1;k++) {
            let newFinalsMatch: FinalsMatchObj = {
                matchId: -1,
                winner: null,
                loser: null,
                p1Input: [k,newElimBracket.bracketList[k].roundList.length,0,true],
                p2Input: [k+1,newElimBracket.bracketList[k+1].roundList.length,0,true],
                p2SetWinsNeeded: 0
            }
            newElimBracket.bracketList[k].finals = newFinalsMatch;
        }
    }


    return newElimBracket;
}