import { useContext, useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../index.css';
import Match from "../../Match.tsx";
import Dropdown from 'react-bootstrap/Dropdown';
import { SingleBracket, MatchObj, Round, Player, RRPool, ElimBracket, FinalsMatchObj } from '../../../utils/types.tsx';
import { TourneyContext } from "../../routes/Tournament.tsx";
import { deSetMatchResults, upperBracketLengthAtPos } from './DEBracketFxns.tsx';
import { numRounds } from "../../../utils/misc.tsx";

const offset = 450;
const matchSpacing = 125;
const leftOffset = 215;
const roundLabelHeight = 10;

export default function DEBracket(props: any) {
    const tourneyState: {
        tourneyData: SingleBracket,
        setTourneyData: any
    } = useContext(TourneyContext);

    var upperBracketHeight: number = ((tourneyState?.tourneyData?.roundList?.length > 0)? tourneyState?.tourneyData?.roundList[0].length * matchSpacing: 0);

    return (
        <div className="bracket"
            style={{
                top: String(offset)+'px',
                position: 'absolute'
        }}>
            
            {tourneyState.tourneyData.finals? <Match
                style={{
                    position: 'absolute',
                    top: String(upperBracketHeight/2+roundLabelHeight)+'px',
                    left: String(leftOffset*(numRounds(tourneyState.tourneyData.playerList.length)+1))+'px'
                }}
                rIndex={-1}
                mIndex={-1}
                matchProp={tourneyState.tourneyData.finals}
                p2SetWinsNeeded={1}
                setMatchResults={deSetMatchResults}
            /> : <></>}

            {tourneyState.tourneyData?.roundList?.map((rd: any, rIndex: number) => {
                // each time we come upon a column, we slice it
                // we calculate upper bracket height up above
                // then we render the line break
                // then we render the lower bracket
                let curUbHeight = upperBracketLengthAtPos(rIndex, tourneyState.tourneyData.playerList.length);
                let upperRdSlice = rd.slice(0,curUbHeight);
                let lowerRdSlice = rd.slice(curUbHeight);

                let upperSegHeight = upperBracketHeight/upperRdSlice.length;
                let lowerSegHeight = upperBracketHeight/(2*lowerRdSlice.length);

                return (
                    <div className='round' key={String(rIndex)}
                        style={{
                            position: 'absolute',
                            left: String(leftOffset*rIndex)+'px',
                            top: roundLabelHeight
                    }}>
                    <div style={{
                        height: String(roundLabelHeight)+'px'
                    }}>Round {rIndex+1}</div>
                    {upperRdSlice && upperRdSlice.map((ma: any, ind: number) => (
                        <Match
                            key={String(ind)}
                            style={{
                                position: 'absolute',
                                top: String(upperSegHeight*ind+upperSegHeight/2)+'px',
                                left: '0px'
                            }}
                            rIndex={rIndex}
                            mIndex={ind}
                            matchProp={ma}
                            p2SetWinsNeeded={1}
                            setMatchResults={deSetMatchResults}
                        />
                    ))}

                    {lowerRdSlice.length > 0 && <div
                        style={{
                            position: 'absolute',
                            top: upperBracketHeight
                        }}
                    >
                        Losers Round {rIndex+1}
                    </div>}

                    {lowerRdSlice && lowerRdSlice.map((ma: any, ind: number) => (
                        <Match
                            key={String(ind)}
                            style={{
                                position: 'absolute',
                                top: String(upperBracketHeight+lowerSegHeight*ind+lowerSegHeight/2)+'px',
                                left: '0px'
                            }}
                            rIndex={rIndex}
                            mIndex={ind+upperRdSlice.length}
                            matchProp={ma}
                            p2SetWinsNeeded={1}
                            setMatchResults={deSetMatchResults}
                        />
                    ))}

                </div>
            )
        })}
        </div>        
    )
}