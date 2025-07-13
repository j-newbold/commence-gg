import React, { useEffect, useState, useContext } from "react";
import { SingleBracket } from "../../../utils/types";
import RRStanding from "./RRStanding.tsx";
import EmptyRRMatch from "./EmptyRRMatch.tsx";
import RRMatch from "./RRMatch.tsx";
import '../../../index.css';
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container';
import { rrSetMatchResults } from "./rrBracketFxns.tsx";
import { TourneyContext } from "../../routes/Tournament.tsx";

export type Result = {
    gw: number,
    gl: number,
    mw: number,
    ml: number
}

export default function RRBracket(props: any) {

    const tourneyState: {
        tourneyData: SingleBracket,
        setTourneyData: any
    } = useContext(TourneyContext);

    const [resultsList, setResultsList] = useState<Result[]>(
        Array(tourneyState?.tourneyData?.playerList?.length).fill({
            gw: 0,
            gl: 0,
            mw: 0,
            ml: 0
        })
    );

    useEffect(() => {
        setResultsList(resultsList.map((e: any, i: number) => {
            for (let j=0;j<resultsList.length;j++) {
                if (j != i) {
                    
                }
            }
            const singleResult: Result = 
            return {
                gw: 0,
                gl: 0,
                mw: 0,
                ml: 0
            }
        }))
    }, [tourneyState.tourneyData.roundList])

    const doNothing = () => {
        
    }

    return (
        tourneyState.tourneyData.roundList.length > 0 && <div className="tourney-holder">
            <div className="rr-bracket-holder">
                <div className="rr-header-row rr-row">
                    <div className="rr-cell">{}</div>
                    {tourneyState?.tourneyData?.playerList?.map((e: any, i: number) => {
                        return <div className="rr-hor-label rr-cell" key={i}>
                            {tourneyState.tourneyData.status == 'in_progress' && e.player.tag}
                        </div>
                    })}
                    <div className="rr-cell">
                        Results
                    </div>
                    <div className="rr-cell">
                        Place
                    </div>
                </div>
                {tourneyState?.tourneyData?.playerList?.map((e: any, i: number) => (
                    <div className="rr-row" key={i}>
                        <div className="rr-cell rr-vert-label">
                            {tourneyState.tourneyData.status == 'in_progress' && e.player.tag}
                        </div>
                        {tourneyState?.tourneyData?.playerList?.map((f: any, j: number) => (
                            <React.Fragment key={j}>
                                {i == j? <EmptyRRMatch key={j}/> :
                                    <RRMatch
                                        key={j}
                                        secondScoreName={e.tag}
                                        matchInfo={tourneyState.tourneyData?.roundList[Math.min(i, j)][Math.max(i, j)-Math.min(i, j)-1]}
                                        col={i}
                                        row={j}
                                        setMatchResults={rrSetMatchResults}
                                        canClick={tourneyState.tourneyData.status == 'in_progress'}
                                    />
                                }
                            </React.Fragment>
                        ))}
                        <RRStanding
                            resultObj={resultsList[i]}
                        />
                        <div className="rr-placement rr-cell">{'-'/*poolstruct.placements[i] &&*/}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}