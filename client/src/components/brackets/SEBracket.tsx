import { createContext, useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import Match from '../Match.tsx';
import FinalsMatch from '../FinalsMatch.tsx';
import Dropdown from 'react-bootstrap/Dropdown';
import { sumBooleans } from '../../utils/misc.tsx';
import { SingleBracket, MatchObj, Round, Player, RRPool, ElimBracket, FinalsMatchObj } from '../../utils/types.tsx';

export default function SEBracket({bracketData}: {bracketData: ElimBracket}) {
    const [bracketStruct, setBracketStruct] = useState<ElimBracket>(bracketData);

    useEffect(() => {
        setBracketStruct(bracketData);
    }, [bracketData])

    function setPlayerAndWinner (isP1: boolean, playerParam: Player, bInd: number, rInd: number, mInd: number): void{
        setBracketStruct((prevBracketStruct) => ({ bracketList: prevBracketStruct.bracketList.map((br, ind1) => {
            if (bInd == ind1) {
                if (rInd == -1 && mInd == -1 && br.finals) {
                    if (isP1) {
                        return {...br, finals: {...br.finals, p1:playerParam, winner:playerParam}};
                    } else {
                        return {...br, finals: {...br.finals, p2:playerParam, winner:playerParam}};
                    }
                } else {
                    return {
                        ...br, roundList: br.roundList.map((rd, index) => {
                            if (rInd == index) {
                                return { ...rd, matchList: rd.matchList.map((ma, ind) => {
                                    if (mInd == ind) {
                                        if (isP1) {
                                            return { ...ma, p1:playerParam, winner:playerParam }
                                        } else {
                                            return { ...ma, p2:playerParam, winner:playerParam }
                                        }
                                    } else {
                                        return ma;
                                    }
                                })};
                            } else {
                                return rd;
                            }
                        })
                    }
                }

            } else {
                return br;
            }
        })}));
    }

    function setPlayer (isP1: boolean, playerParam: Player, bInd: number, rInd: number, mInd: number): void{
        setBracketStruct((prevBracketStruct) => ({ bracketList: prevBracketStruct.bracketList.map((br, ind1) => {
            if (bInd == ind1) {
                if (rInd == -1 && mInd == -1 && br.finals) {
                    if (isP1) {
                        return {...br, finals: {...br.finals, p1:playerParam}};
                    } else {
                        return {...br, finals: {...br.finals, p2:playerParam}};
                    }
                } else {
                    return {
                        ...br, roundList: br.roundList.map((rd, index) => {
                            if (rInd == index) {
                                return { ...rd, matchList: rd.matchList.map((ma, ind) => {
                                    if (mInd == ind) {
                                        if (isP1) {
                                            return { ...ma, p1:playerParam }
                                    } else {
                                        return { ...ma, p2:playerParam }
                                    }
                            } else {
                                return ma;
                            }
                        })};
                    } else {
                        return rd;
                    }
                        })
                    }                    
                }

            } else {
                return br;
            }
            })
        }))}
    
    function setMatchResult (winner: Player, loser: Player, bInd: number, rInd: number, mInd: number): void {
        setBracketStruct((prevBracketStruct) => ({ bracketList: prevBracketStruct.bracketList.map((br, ind1) => {
            if (bInd == ind1) {
                if (rInd == -1 && mInd == -1 && br.finals) {
                    return {...br, finals: {...br.finals, winner:winner, loser:loser}};
                } else {
                    return {
                        ...br, roundList: br.roundList.map((rd, index) => {
                            if (rInd == index) {
                                return { ...rd, matchList: rd.matchList.map((ma, ind) => {
                                    if (mInd == ind) {
                                        return { ...ma, winner:winner, loser:loser }
                                    } else {
                                        return ma;
                                    }
                                })};
                            } else {
                                return rd;
                            }
                        })
                    }                    
                }

            } else {
                return br;
            }
            })
        }))
    }

    return (
        <div className='tourney-holder'>
            Tournament: {bracketStruct?.bracketList.map((br, bIndex) => (
                <div className="bracket" key={String(bIndex)}
                    style={{
                        top: String(500*bIndex+25)+'px',
                        position: 'absolute'
                }}>
                    Bracket {bIndex+1} {br.roundList.map((rd, rIndex) => (
                    <div className='round' key={String(rIndex)}
                        style={{
                            position: 'absolute',
                            left: String(240*rIndex)+'px',
                            top: '50px',
                            width: '200px'
                    }}>
                        Round {rIndex+1}
                        {rd.matchList?.map((ma, ind) => (
                            <Match
                                key={String(ind)}
                                style={{
                                    position: 'absolute',
                                    top: String(100*ind+50)+'px',
                                    left: '0px',
                                    width: '200px'
                                }}
                                p1Input={ma.p1Input? ma.p1Input[3] ? bracketStruct.bracketList[ma.p1Input[0]].roundList[ma.p1Input[1]].matchList[ma.p1Input[2]].winner 
                                    : bracketStruct.bracketList[ma.p1Input[0]].roundList[ma.p1Input[1]].matchList[ma.p1Input[2]].loser 
                                    : null}
                                p2Input={ma.p2Input? ma.p2Input[3] ? bracketStruct.bracketList[ma.p2Input[0]].roundList[ma.p2Input[1]].matchList[ma.p2Input[2]].winner 
                                    : bracketStruct.bracketList[ma.p2Input[0]].roundList[ma.p2Input[1]].matchList[ma.p2Input[2]].loser 
                                    : null}
                                bIndex={bIndex}
                                rIndex={rIndex}
                                mIndex={ind}
                                matchProp={ma}
                                setWinner={setMatchResult}
                                setPlayer={setPlayer}
                                setPlayerAndWinner={setPlayerAndWinner}
                                p2SetWinsNeeded={1}
                            />
                        ))}
                    </div>
                ))}
                {bracketStruct.bracketList.length > 0 && bIndex < bracketStruct.bracketList.length-1 ?
                    <div className='round' style={{
                        position: 'absolute',
                        left: String(240*br.roundList.length)+'px',
                        top: '100px',
                        width: '200px'
                    }}>
                        <Match
                            p1Input={br.roundList[br.roundList.length-1]?.matchList[0]?.winner || null}
                            p2Input={bracketStruct.bracketList[bIndex+1].finals? bracketStruct.bracketList[bIndex+1].finals?.winner : bracketStruct.bracketList[bIndex+1].roundList[bracketStruct.bracketList[bIndex+1].roundList.length-1]?.matchList[0].winner || null}
                            bIndex={bIndex}
                            rIndex={-1}
                            mIndex={-1}
                            matchProp={br.finals}
                            setWinner={setMatchResult}
                            setPlayer={setPlayer}
                            setPlayerAndWinner={setPlayerAndWinner}
                            p2SetWinsNeeded={2}
                        />
                    </div>
                    : <></>
                }
                </div>
            ))}
        </div>
        
    );
}



