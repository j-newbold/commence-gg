import React, { useEffect, useState, useContext } from "react";
import { SingleBracket, Result } from "../../../utils/types";
import RRStanding from "./RRStanding.tsx";
import EmptyRRMatch from "./EmptyRRMatch.tsx";
import RRMatch from "./RRMatch.tsx";
import '../../../index.css';
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container';
import { rrSetMatchResults, rrCalcResults } from "./RRBracketFxns.tsx";
import { TourneyContext } from "../../routes/Tournament.tsx";

export default function RRBracket(props: any) {

    const tourneyState: {
        tourneyData: SingleBracket,
        setTourneyData: any
    } = useContext(TourneyContext);

    const resultsList: Result[] | null = rrCalcResults(tourneyState.tourneyData);

    const doNothing = () => {
        
    }

    return (
        tourneyState.tourneyData.roundList?.length > 0 && <div className="tourney-holder">
            <div className="rr-bracket-holder">
                <div className="rr-header-row">
                    <div className="rr-header-row-name">{}</div>
                    {tourneyState?.tourneyData?.playerList?.map((e: any, i: number) => {
                        return <div className="rr-hor-label rr-header-row-name" key={i}>
                            {tourneyState.tourneyData.status == 'in_progress' && e.tag}
                        </div>
                    })}
                    <div className="rr-header-row-name">
                        Results
                    </div>
                    <div className="rr-header-row-name">
                        Place
                    </div>
                </div>
                {resultsList && tourneyState?.tourneyData?.playerList?.map((e: any, i: number) => (
                    <div className="rr-row" key={i}>
                        <div className="rr-cell rr-vert-label">
                            {tourneyState.tourneyData.status == 'in_progress' && e.tag}
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
                        <div className="rr-placement rr-cell">{tourneyState.tourneyData.playerList[i].placement === null ? '-' : tourneyState.tourneyData.playerList[i].placement}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}