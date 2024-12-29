import { useContext, useEffect, useState, useRef } from "react";
import { MatchObj } from '../utils/types';

export default function Match(props: any) {
    // p1Win is a boolean, p2Win is an array of booleans
    const [p1Win, setP1Win] = useState(false);
    const [p2Win, setP2Win] = useState(Array(props.p2SetWinsNeeded).fill(false));
    const [curMatch, setCurMatch] = useState(props.matchProp);

    const didMountP1 = useRef(0);
    const didMountP2 = useRef(0);
    const didMountP2SetWins = useRef(0);

    useEffect(() => {
        setCurMatch(props.matchProp);
    }, [props.matchProp])

/*     useEffect(() => {
        if (didMountP2SetWins.current < 1) {
            didMountP2SetWins.current += 1;
        } else {
            
        }
    }, [props.p2SetWinsNeeded]) */

    useEffect(() => {
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
    }

    return (
        <>
            <div style={props.style} className="match-holder">
                <div>
                    <span>{curMatch?.p1?.name || 'Player 1'}</span>
                    <input
                        type="checkbox"
                        checked={p1Win}
                        onChange={handleP1Check}
                    />
                </div>
                <div>
                    <span>{curMatch?.p2?.name || 'Player 2'}</span>
                    {Array.from({ length: props.p2SetWinsNeeded }).map((_, index) => {
                        return <input
                                    key={index}
                                    type="checkbox"
                                    checked={p2Win[index]}
                                    onChange={(key) => {handleP2Check(index)}}
                                />
                    })}
                </div>
            </div>
        </>
    );
}