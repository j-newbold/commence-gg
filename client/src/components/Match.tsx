import { useContext, useEffect, useState, useRef } from "react";
import { MatchObj } from '../utils/types';
import { Modal, Button } from "react-bootstrap";
import MatchModal from "./brackets/MatchModal.tsx";

export default function Match(props: any) {
    // p1Win is a boolean, p2Win is an array of booleans
    const [p1Win, setP1Win] = useState(false);
    const [p2Win, setP2Win] = useState(Array(props.p2SetWinsNeeded).fill(false));
    const [curMatch, setCurMatch] = useState(props.matchProp);
    const [showModal, setShowModal] = useState(false);

    const [tempWinsP1, setTempWinsP1] = useState(0);
    const [tempWinsP2, setTempWinsP2] = useState(0);

    const didMountP1 = useRef(0);
    const didMountP2 = useRef(0);
    const didMountP2SetWins = useRef(0);

    useEffect(() => {
        setCurMatch(props.matchProp);
        setTempWinsP1(props.matchProp.winsP1);
        setTempWinsP2(props.matchProp.winsP2);
    }, [props.matchProp])

    return (
        <>
            <div style={props.style} className="match-holder" onClick={() => setShowModal(true)} >
                <div className="match-player-text match-player-holder-top">
                    <div className="match-player-name">{curMatch?.p1Type == 'player'? curMatch.p1?.tag : curMatch.p1Type == 'bye'? 'Bye' : 'Player 1'}</div>
                    <div className="match-game-wins">{curMatch?.winsP1}</div>
                </div>
                <div className="match-spacer"></div>
                <div className="match-player-text match-player-holder-bot">
                    <div className="match-player-name">{curMatch?.p2Type == 'player'? curMatch.p2?.tag : curMatch.p2Type == 'bye'? 'Bye' : 'Player 2'}</div>
                    <div className="match-game-wins">{curMatch?.winsP2}</div>
                </div>
            </div>
            <MatchModal
                showModal={showModal}
                setShowModal={setShowModal}
                curMatch={curMatch}
                setMatchResults={props.setMatchResults}
            />
        </>
    );
}