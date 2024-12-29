import { useState, useEffect } from "react";
import { RRMatchObj } from "../utils/types";
import '../index.css';

export default function RRStanding({ matchesWon, matchesLost, gamesWon, gamesLost}:
    {
        gamesWon: number,
        gamesLost: number,
        matchesWon: number,
        matchesLost: number,
        place: any
    }) {

    const [gWins, setGWins] = useState<number>(gamesWon);
    const [gLosses, setGLosses] = useState<number>(gamesLost);
    const [mWins, setMWins] = useState<number>(matchesWon);
    const [mLosses, setMLosses] = useState<number>(matchesLost);

    useEffect(() => {
        setGWins(gamesWon);
    }, [gamesWon])

    useEffect(() => {
        setGLosses(gamesLost);
    }, [gamesLost])

    useEffect(() => {
        setMWins(matchesWon);
    }, [matchesWon])

    useEffect(() => {
        setMLosses(matchesLost);
    }, [matchesLost])

    return (
        <td>
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
        </td>
    );
}