import React, { useEffect, useState } from "react";
import { RRPool, RRMatchObj } from "../../utils/types";
import EmptyRRMatch from "../EmptyRRMatch";
import RRMatch from "../RRMatch";
import '../../index.css';
import Button from "react-bootstrap/Button";
import '../RRStanding';
import RRStanding from "../RRStanding";

export default function RRPoolComponent({bracketData}: {bracketData: RRPool}) {

    const [poolStruct, setPoolStruct] = useState<RRPool>(bracketData);
    const [standingsList, setStandingsList] = useState(
        poolStruct.playerList?.map((e, i) => {
        return ({pn: poolStruct.playerList[i].name,
                    gw: poolStruct.resultsList[2],
                    gl: poolStruct.resultsList[3],
                    mw: poolStruct.resultsList[0],
                    ml: poolStruct.resultsList[1],
                    place: null
        });
    }));
    
    useEffect(() => {
        setPoolStruct(bracketData);
    }, [bracketData])

    function updateResults(p1Name: string, p2Name: string,
                                p1gwD: number, p1glD: number,
                                p1mwD: number, p1mlD: number
    ): number[][] {
        // the D stands for 'delta'
        const newResults = poolStruct.resultsList.map((row, index) => {
            if (poolStruct.playerList[index].name == p1Name) {
                return [poolStruct.resultsList[index][0]+p1mwD,
                        poolStruct.resultsList[index][1]+p1mlD,
                        poolStruct.resultsList[index][2]+p1gwD,
                        poolStruct.resultsList[index][3]+p1glD];
            } else if (poolStruct.playerList[index].name == p2Name) {
                return [poolStruct.resultsList[index][0]+p1mlD,
                        poolStruct.resultsList[index][1]+p1mwD,
                        poolStruct.resultsList[index][2]+p1glD,
                        poolStruct.resultsList[index][3]+p1gwD];
            } else {
                return row;
            }
        });
        return newResults;
    }

    function updatePlacements(newPool: RRPool): number[] {
        let bigList: [string, ...number[]][] = newPool.playerList.map((e, index) => {
            return [newPool.playerList[index].name, ...newPool.resultsList[index]]
        });
         bigList.sort(function(a, b): any {
            if (a[1] !== b[1]) {
                return b[1]-a[1];
            }
            return b[3]/(b[3]+b[4])-a[3]/(a[3]+a[4]);
        })
        let newPlacements: number[] = [];

        for (var i=0;i<newPool.playerList.length;i++) {
            newPlacements[i] = bigList.findIndex((e) => {return e[0] == newPool.playerList[i].name})+1;
        }
        return newPlacements;
    }

    function setGameCount(rowId: number, maId: number, games1: number, games2: number): void {
        const prevGameCount: any = poolStruct.matchList[rowId][maId].gameCount;

        if (!poolStruct.matchList[rowId][maId].p1 || !poolStruct.matchList[rowId][maId].p2) {
            return;
        }
        const newResults = updateResults(poolStruct.matchList[rowId][maId].p1?.name, poolStruct.matchList[rowId][maId].p2?.name,
            games1-poolStruct.matchList[rowId][maId].gameCount[0],
            games2-poolStruct.matchList[rowId][maId].gameCount[1],
            Math.floor(games1/poolStruct.winsNeeded)-Math.floor(prevGameCount[0]/poolStruct.winsNeeded),
            Math.floor(games2/poolStruct.winsNeeded)-Math.floor(prevGameCount[1]/poolStruct.winsNeeded),
        );

        var newPool: RRPool = {...poolStruct, resultsList: newResults, matchList: poolStruct!.matchList.map((row, index) => {
            if (index == rowId) {
                return row.map((ma, index2) => {
                    if (index2 == maId) {
                        if (games1 == poolStruct.winsNeeded) {
                            return {...ma, winner:ma.p1,
                                loser:ma.p2,
                                gameCount: [games1, games2]};
                        } else if (games2 == poolStruct.winsNeeded) {
                            return {...ma, winner:ma.p2, loser:ma.p1, gameCount: [games1, games2]};
                        } else {
                            return {...ma, gameCount: [games1, games2]};
                        }
                    } else {
                        return ma;
                    }
                });
            } else {
                return row;
            }
        })}

        var newPlacements: (number | null)[] = poolStruct.placements;
        
        let maxMatches = (poolStruct.playerList.length*(poolStruct.playerList.length-1))/2;
        if (prevGameCount[0] >= poolStruct.winsNeeded || prevGameCount[1] >= poolStruct.winsNeeded) {
            if (games1 < poolStruct.winsNeeded && games2 < poolStruct.winsNeeded) {
                newPool.matchesFinished -= 1;
                if (newPool.matchesFinished == maxMatches-1) {
                    newPlacements = Array<(number | null)>(poolStruct.playerList.length).fill(null);
                }
            } else if (newPool.matchesFinished == maxMatches) {
                newPool.placements = updatePlacements(newPool);
            }
        } else if (games1 >= poolStruct.winsNeeded || games2 >= poolStruct.winsNeeded) {
                newPool.matchesFinished += 1;
                if (newPool.matchesFinished >= maxMatches) {
                    newPool.placements = updatePlacements(newPool);
                }
        } else if (newPool.matchesFinished == maxMatches) {
            newPool.placements = updatePlacements(newPool);
        }

        setPoolStruct(newPool);


    }

    return (
        <div className="tourney-holder">
                {/* <Button onClick={() => { console.log(poolStruct.placements)}}>Debug</Button> */}
                <table className="rr-pool-holder">
                    <tbody> 
                        <tr>
                            <td className="rr-name-holder"></td>
                            {poolStruct.playerList.map((e, i) => {
                                return <td className="rr-name-holder" key={i}>
                                            {e.name}
                                        </td>
                            })}
                            <td>
                                Standings
                            </td>
                            <td>
                                Place
                            </td>
                        </tr>
                        {poolStruct.playerList?.map((e, i) => (
                                <tr key={i}>
                                    <td>
                                        {e.name}
                                    </td>
                                    {poolStruct.playerList.map((f, j) => (
                                            <React.Fragment key={j}>
                                                { i==j? <EmptyRRMatch key={j}/> :
                                                    <RRMatch 
                                                        key={j}
                                                        secondScoreName={f.name}
                                                        matchInfo={poolStruct.matchList[Math.min(i, j)][Math.max(i, j)-Math.min(i,j)-1]}
                                                        setGameCount={setGameCount}
                                                        pos={[Math.min(i, j), Math.max(i, j)-Math.min(i,j)-1]}
                                                        winsNeeded={poolStruct.winsNeeded}
                                                    />
                                                }
                                            </React.Fragment>
                                    ))}
                                    <RRStanding /* matches={standingsList[i]} matchRow={poolStruct.matchList[i] || []}
                                        matchCol={poolStruct.matchList.slice(0,i).map((row, k) => {
                                            return row[i-1-k];
                                            })}
                                        playerName={e.name} */
                                        gamesWon={poolStruct.resultsList[i][2]}
                                        gamesLost={poolStruct.resultsList[i][3]}
                                        matchesWon={poolStruct.resultsList[i][0]}
                                        matchesLost={poolStruct.resultsList[i][1]}
                                        place={standingsList[i].place}
                                    />
                                    <td>
                                        {poolStruct.placements[i]? poolStruct.placements[i] : '-'}
                                    </td>
                                </tr>      
                            ))
                        }
                    </tbody>
                </table>
        </div>
    );
}