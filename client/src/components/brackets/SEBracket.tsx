import { createContext, useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../index.css';
import Match from '../Match.tsx';
import FinalsMatch from '../FinalsMatch.tsx';
import Dropdown from 'react-bootstrap/Dropdown';
import { sumBooleans } from '../../utils/misc.tsx';
import { SingleBracket, MatchObj, Round, Player, RRPool, ElimBracket, FinalsMatchObj } from '../../utils/types.tsx';

const offset = 320;

export default function SEBracket({bracketData, ...props}: {bracketData: SingleBracket;
                                                            [key: string]: any;
}) {
    const [bracketStruct, setBracketStruct] = useState<SingleBracket>(bracketData);

    useEffect(() => {
        setBracketStruct(bracketData);
    }, [bracketData])

    function setResult() {

    }

/*     function setPlayerAndWinner (isP1: boolean, playerParam: Player, bInd: number, rInd: number, mInd: number): void{
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
        }))} */
    
/*     function setMatchResult (winner: Player, loser: Player, bInd: number, rInd: number, mInd: number): void {
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
    } */

    return (
                <div className="bracket"
                    style={{
                        top: String(offset)+'px',
                        position: 'absolute'
                }}>
                    {bracketData.roundList.map((rd, rIndex) => (
                    <div className='round' key={String(rIndex)}
                        style={{
                            position: 'absolute',
                            left: String(240*rIndex)+'px',
                            top: '50px'
                    }}>
                        Round {rIndex+1}
                        {rd.map((ma: any, ind: number) => (
                            <Match
                                key={String(ind)}
                                style={{
                                    position: 'absolute',
                                    top: String(125*ind+50)+'px',
                                    left: '0px'
                                }}
                                /* p1Input={ma.p1Input? ma.p1Input[3] ? bracketStruct.roundList[ma.p1Input[1]].matchList[ma.p1Input[2]].winner 
                                    : bracketStruct.roundList[ma.p1Input[1]].matchList[ma.p1Input[2]].loser 
                                    : null}
                                p2Input={ma.p2Input? ma.p2Input[3] ? bracketStruct.roundList[ma.p2Input[1]].matchList[ma.p2Input[2]].winner 
                                    : bracketStruct.roundList[ma.p2Input[1]].matchList[ma.p2Input[2]].loser 
                                    : null} */
                                rIndex={rIndex}
                                mIndex={ind}
                                matchProp={ma}
                                //setWinner={setMatchResult}
                                //setPlayer={setPlayer}
                                //setPlayerAndWinner={setPlayerAndWinner}
                                p2SetWinsNeeded={1}
                                setMatchResults={props.setMatchResults}
                            />
                        ))}
                    </div>
                ))}
                </div>
        
    );
}



