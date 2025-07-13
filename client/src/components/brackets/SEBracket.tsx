import { createContext, useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../index.css';
import Match from '../Match.tsx';
import FinalsMatch from '../FinalsMatch.tsx';
import Dropdown from 'react-bootstrap/Dropdown';
import { sumBooleans } from '../../utils/misc.tsx';
import { SingleBracket, MatchObj, Round, Player, RRPool, ElimBracket, FinalsMatchObj } from '../../utils/types.tsx';
import { TourneyContext } from '../routes/Tournament.tsx';
import { seSetMatchResults } from './single elim/seBracketFxns.tsx';

const offset = 320;

export default function SEBracket(props: any) {
    const tourneyState: {
        tourneyData: SingleBracket,
        setTourneyData: any
    } = useContext(TourneyContext);

    function setResult() {

    }

    return (
                <div className="bracket"
                    style={{
                        top: String(offset)+'px',
                        position: 'absolute'
                }}>
                    {tourneyState.tourneyData?.roundList?.map((rd: any, rIndex: number) => (
                    <div className='round' key={String(rIndex)}
                        style={{
                            position: 'absolute',
                            left: String(240*rIndex)+'px',
                            top: '50px'
                    }}>
                        Round {rIndex+1}
                        {rd && rd.map((ma: any, ind: number) => (
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
                                setMatchResults={seSetMatchResults}
                            />
                        ))}
                    </div>
                ))}
                </div>
        
    );
}



