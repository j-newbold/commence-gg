import { useEffect, useState, useContext } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import { TourneyContext } from '../routes/Tournament';
import { handleSubmitMatchChange } from '../../utils/miscBracketFxns';

export default function MatchModal(props: any) {
    //const [showModal, setShowModal] = useState(props.showModal);
    const [curMatch, setCurMatch] = useState(props.curMatch);
    const [modalWinsP1, setModalWinsP1] = useState(props.curMatch.winsP1);
    const [modalWinsP2, setModalWinsP2] = useState(props.curMatch.winsP2);

    const tourneyState: any = useContext(TourneyContext);

    useEffect(() => {
        setCurMatch(props.curMatch);
    }, [props.curMatch])

    return (
        <Modal show={props.showModal} onHide={(() => props.setShowModal(false))}>
                <Modal.Header>
                    <Modal.Title>{curMatch?.isBye.toString()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="match-modal">
                        <div className="match-popup">
                            <div className="match-popup-player-name">{curMatch?.p1?.tag || (curMatch.isBye? 'Bye' : 'Player 1')}</div>
                            <input
                                className="game-wins"
                                type='number'
                                value={modalWinsP1}
                                onChange={e => setModalWinsP1(Number(e.target.value))}
                            />
                        </div>
                        <div className="versus">vs</div>
                        <div className="match-popup">
                            <div className="match-popup-player-name">{curMatch?.p2?.tag || (curMatch.isBye? 'Bye' : 'Player 2')}</div>
                            <input
                                className="game-wins"
                                type='number'
                                value={modalWinsP2}
                                onChange={e => setModalWinsP2(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='primary' onClick={() => 
                        handleSubmitMatchChange(
                        curMatch,
                        setCurMatch,
                        modalWinsP1,
                        modalWinsP2,
                        props.setMatchResults,
                        tourneyState.tourneyData,
                        tourneyState.setTourneyData,
                        tourneyState.socket
                    )}>
                        Submit
                    </Button>
                    <Button variant='danger' onClick={() => props.setShowModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
    );
}