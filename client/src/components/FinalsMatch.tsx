import Match from "./Match";

export default function FinalsMatch(props: any) {
    // currently exists as a placeholder
    // may be modified to contain multiple <Match /> components in the future
    
    return (
        
        <Match
            p1Input={props.p1Input}
            p2Input={props.p2Input}
            bIndex={props.bIndex}
            rIndex={-1}
            mIndex={-1}
            matchProp={props.matchProp}
            setWinner={props.setWinner}
            setPlayer={props.setPlayer}
            setPlayerAndWinner={props.setPlayerAndWinner}
            p2SetWinsNeeded={props.p2SetWinsNeeded}
        />
        
    );
}