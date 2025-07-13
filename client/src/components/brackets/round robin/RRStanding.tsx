import { useState, useEffect } from "react";
import { RRMatchObj } from "../../../utils/types";
import '../../../index.css';
import { Result } from "./RRBracket";

export default function RRStanding({resultObj}: {resultObj: Result}) {

    const [gWins, setGWins] = useState<number | null>(resultObj?.gw);
    const [gLosses, setGLosses] = useState<number | null>(resultObj?.gl);
    const [mWins, setMWins] = useState<number | null>(resultObj?.mw);
    const [mLosses, setMLosses] = useState<number | null>(resultObj?.ml);

    useEffect(() => {
        setGWins(resultObj.gw);
    }, [resultObj.gw])

    useEffect(() => {
        setGLosses(resultObj.gl);
    }, [resultObj.gl])

    useEffect(() => {
        setMWins(resultObj.mw);
    }, [resultObj.mw])

    useEffect(() => {
        setMLosses(resultObj.ml);
    }, [resultObj.ml])

    return (
        <div className="rr-cell">
            <span className="match-score">
                    {mWins}
                {'-'}
                    {mLosses}
                {' '}
            </span>

            <span className="game-score">
                {'('}
                    {gWins}
                {'-'}
                    {gLosses}
                {')'}
            </span>
        </div>
    );
}