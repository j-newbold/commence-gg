import { MatchObj } from "../../../utils/types.tsx";
import '../../../index.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Col from "react-bootstrap/Col";
import { useState, useEffect } from "react";
import MatchModal from "../MatchModal.tsx";

export default function RRMatch({matchInfo, col, row, setMatchResults, canClick}:
    {   secondScoreName: String,
        matchInfo: MatchObj,
        col: number,
        row: number,
        setMatchResults: any,
        canClick: boolean}) {
    const [showModal, setShowModal] = useState(false);

    const [curMatch, setCurMatch] = useState(matchInfo);
    const [p1GamesWon, setP1GamesWon] = useState(matchInfo.winsP1);
    const [p2GamesWon, setP2GamesWon] = useState(matchInfo.winsP2);

    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        setCurMatch(matchInfo);
    }, [matchInfo])

    useEffect(() => {
        setP1GamesWon(matchInfo.winsP1);
    }, [matchInfo.winsP1])

    useEffect(() => {
        setP2GamesWon(matchInfo.winsP2);
    }, [matchInfo.winsP2])
    
    const handleShow = () => {
        if (canClick) setShowModal(true);
    }

    const handleClose = () => {
        setSubmitError('');
        setShowModal(false);
    }
    
    return (
        <>
            <div className="rr-match-holder rr-cell" onClick={handleShow}>
                { (col > row)? `${p2GamesWon}-${p1GamesWon}` : `${p1GamesWon}-${p2GamesWon}` }
            </div>
            <MatchModal
                showModal={showModal}
                setShowModal={setShowModal}
                curMatch={curMatch}
                setMatchResults={setMatchResults}
            />
        </>
    );
}