import { RRMatchObj } from "../utils/types";
import '../App.css';
import '../index.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useState, useEffect } from "react";

export default function RRMatch({setGameCount, secondScoreName, matchInfo, pos, winsNeeded}:
    {setGameCount: (rowId: number, maId: number, games1: number, games2: number) => void,
        secondScoreName: String,
        matchInfo: RRMatchObj,
        pos: [number, number],
        winsNeeded: number}) {
    const [show, setShow] = useState(false);

    const [curMatch, setCurMatch] = useState(matchInfo);
    const [p1GamesWon, setP1GamesWon] = useState(matchInfo.gameCount[0]);
    const [p2GamesWon, setP2GamesWon] = useState(matchInfo.gameCount[1]);

    const [submitError, setSubmitError] = useState('');

    const [p1GamesWonModal, setP1GamesWonModal] = useState(matchInfo.gameCount[0]);
    const [p2GamesWonModal, setP2GamesWonModal] = useState(matchInfo.gameCount[1]);

    useEffect(() => {
        setCurMatch(matchInfo);
    }, [matchInfo])

    useEffect(() => {
        setP1GamesWon(matchInfo.gameCount[0]);
        setP1GamesWonModal(matchInfo.gameCount[0]);
    }, [matchInfo.gameCount[0]])

    useEffect(() => {
        setP2GamesWon(matchInfo.gameCount[1]);
        setP2GamesWonModal(matchInfo.gameCount[1]);
    }, [matchInfo.gameCount[1]])
    
    const handleShow = () => {
        setShow(true);
    }

    const submitChanges = () => {
        if (p1GamesWonModal < 0 || p2GamesWonModal < 0
            || p1GamesWonModal > winsNeeded
            || p2GamesWonModal > winsNeeded
            || (Number(p1GamesWonModal)+Number(p2GamesWonModal)) == 2*winsNeeded) {
            setSubmitError('Error submitting match results');
        } else {
            setSubmitError('');

            setGameCount(pos[0], pos[1], Number(p1GamesWonModal), Number(p2GamesWonModal));
            setShow(false);
        }
    }

    const handleClose = () => {
        setP1GamesWonModal(p1GamesWon);
        setP2GamesWonModal(p2GamesWon);
        setSubmitError('');
        setShow(false);
    }

    const handleP1GameChange = (e: any) => {
        setP1GamesWonModal(e.target.value);
    }

    const handleP2GameChange = (e: any) => {
        setP2GamesWonModal(e.target.value);
    }
    
    return (
        <>
            <td className="rr-match-holder" onClick={handleShow}>
                { (secondScoreName == curMatch.p1?.name)? `${p2GamesWon}-${p1GamesWon}` : `${p1GamesWon}-${p2GamesWon}` }
            </td>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Match</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div>
                        <span>{matchInfo.p1?.name}&lt;-{p1GamesWon}</span>
                        <span className="whitespace">            </span>
                        <span>{p2GamesWon}-&gt;{matchInfo.p2?.name}</span>
                    </div>
                    <div>
                        <span>Set P1 games won:</span>
                        <input type='text' value={p1GamesWonModal} onChange={handleP1GameChange}/>
                    </div>
                    <div>
                        <span>Set P2 games won:</span>
                        <input type='text' value={p2GamesWonModal} onChange={handleP2GameChange}/>
                        <div className="submission-error">
                            {submitError}
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" onClick={submitChanges}>Submit Results</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}