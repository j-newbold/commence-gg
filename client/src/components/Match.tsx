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

/*     const handleSubmitMatchChange = () => {
        if (tempWinsP1 == tempWinsP2 && tempWinsP1 == curMatch.winsNeeded) {
            // handle error
        } else if (tempWinsP1 != Math.round(tempWinsP1) || tempWinsP2 != Math.round(tempWinsP2)) {
            // handle error--integers only!
        } else if (tempWinsP1 < 0 || tempWinsP2 < 0) {
            // handle error--below-zero
        } else if (tempWinsP1 == curMatch.winsP1 && tempWinsP2 == curMatch.winsP2) {
            // no action needed
        } else if (tempWinsP1 <= curMatch.winsNeeded && tempWinsP2 <= curMatch.winsNeeded) {
            if (tempWinsP1 == curMatch.winsNeeded) {
                // need to consolidate these lines
                setCurMatch({
                    ...curMatch,
                    winsP1: tempWinsP1,
                    winsP2: tempWinsP2,
                    winner: curMatch.p1  // unsure if this creates a copy or a reference
                });
                props.setMatchResults(curMatch.matchRow,
                    curMatch.matchCol,
                    tempWinsP1,
                    tempWinsP2,
                    curMatch.p1,
                    null,
                    null
                );
            } else if (tempWinsP2 == curMatch.winsNeeded) {
                setCurMatch({
                    ...curMatch,
                    winsP1: tempWinsP1,
                    winsP2: tempWinsP2,
                    winner: curMatch.p2  // unsure if this creates a copy or a reference
                });
                props.setMatchResults(curMatch.matchRow,
                    curMatch.matchCol,
                    tempWinsP1,
                    tempWinsP2,
                    curMatch.p2,
                    null,
                    null
                );
            } else {
                setCurMatch({
                    ...curMatch,
                    winsP1: tempWinsP1,
                    winsP2: tempWinsP2,
                    winner: null  // unsure if this creates a copy or a reference
                });
                props.setMatchResults(curMatch.matchRow,
                    curMatch.matchCol,
                    tempWinsP1,
                    tempWinsP2,
                    null,
                    null,
                    null
                );
            }
        } else {
            // handle error--number too large
        }
    } */

/*     useEffect(() => {
        if (didMountP2SetWins.current < 1) {
            didMountP2SetWins.current += 1;
        } else {
            
        }
    }, [props.p2SetWinsNeeded]) */

/*     useEffect(() => {
        if (didMountP1.current < 1) {
            didMountP1.current += 1;
        } else {
            if (props.p1Input == null) {
                setP1Win(false);
                setP2Win(Array(props.p2SetWinsNeeded).fill(false));
                props.setPlayerAndWinner(true, null, props.bIndex, props.rIndex, props.mIndex);
            } else {
                if (p1Win) {
                    props.setPlayerAndWinner(true, props.p1Input, props.bIndex, props.rIndex, props.mIndex);
                } else {
                    props.setPlayer(true, props.p1Input, props.bIndex, props.rIndex, props.mIndex);
                }
            }
        }
    }, [props.p1Input])

    useEffect(() => {
        if (didMountP2.current < 1) {
            didMountP2.current += 1;
        } else {
            props.setPlayer(false, props.p2Input, props.bIndex, props.rIndex, props.mIndex);
            if (props.p2Input == null) {
                setP2Win(Array(props.p2SetWinsNeeded).fill(false));
                setP1Win(false);
                props.setPlayerAndWinner(false, null, props.bIndex, props.rIndex, props.mIndex);
            } else {
                if (p2Win[p2Win.length-1]) {
                    props.setPlayerAndWinner(false, props.p2Input, props.bIndex, props.rIndex, props.mIndex);
                } else {
                    props.setPlayer(false, props.p2Input, props.bIndex, props.rIndex, props.mIndex);
                }
            }
        }
    }, [props.p2Input])

    const handleP1Check = () => {
        if (!p1Win) {
            if (p2Win[p2Win.length-1]) {
                setP2Win(p2Win.map((curVal, index) => {
                    if (index == p2Win.length-1) {
                        return false;
                    } else {
                        return curVal;
                    }
                }));
            }
            props.setWinner(curMatch.p1, curMatch.p2, props.bIndex, props.rIndex, props.mIndex);
        } else {
            props.setWinner(null, null, props.bIndex, props.rIndex, props.mIndex);
        }
        setP1Win(!p1Win);
    }

    const handleP2Check = (key: number) => {
        if (p2Win[key] == true) {
            setP2Win(p2Win.map((curVal, index) => {
                if (index >= key) {
                    return false;
                } else {
                    return curVal;
                }
            }))
        } else {
            setP2Win(p2Win.map((curVal, index) => {
                if (index <= key) {
                    return true;
                } else {
                    return curVal;
                }
            }))
        }

        if (key == p2Win.length-1) {
            if (!p2Win[p2Win.length-1]) {
                if (p1Win) {
                    setP1Win(!p1Win);
                }
                props.setWinner(curMatch.p2, curMatch.p1, props.bIndex, props.rIndex, props.mIndex);
            } else {
                props.setWinner(null, null, props.bIndex, props.rIndex, props.mIndex);
            }
        }
    } */

    return (
        <>
            <div style={props.style} className="match-holder" onClick={() => setShowModal(true)} >
                <div className="match-player-text match-player-holder-top">
                    <div className="match-player-name">{curMatch?.p1?.tag || (curMatch.isBye? 'Bye' : 'Player 1')}</div>
                    <div className="match-game-wins">{curMatch?.winsP1}</div>
                </div>
                <div className="match-spacer"></div>
                <div className="match-player-text match-player-holder-bot">
                    <div className="match-player-name">{curMatch?.p2?.tag || (curMatch.isBye? 'Bye' : 'Player 2')}</div>
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