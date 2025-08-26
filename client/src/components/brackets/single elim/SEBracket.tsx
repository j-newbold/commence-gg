import { createContext, useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../index.css';
import Match from '../../Match.tsx';
import FinalsMatch from '../../FinalsMatch.tsx';
import Dropdown from 'react-bootstrap/Dropdown';
import { sumBooleans } from '../../../utils/misc.tsx';
import { SingleBracket, MatchObj, Round, Player, RRPool, ElimBracket } from '../../../utils/types.tsx';
import { TourneyContext } from '../../routes/Tournament.tsx';
import { seSetMatchResults } from './SEBracketFxns.tsx';

const offset = 500;
const matchSpacing = 125;

export default function SEBracket(props: any) {
    const tourneyState: {
        tourneyData: SingleBracket,
        setTourneyData: any
    } = useContext(TourneyContext);

    var totalHeight: number = ((tourneyState?.tourneyData?.roundList?.length > 0)? tourneyState?.tourneyData?.roundList[0].length * matchSpacing: 0);

    return (
        <div className="bracket"
            style={{
                top: String(offset)+'px',
                position: 'absolute'
        }}>
            {tourneyState.tourneyData?.roundList?.map((rd: any, rIndex: number) => {
                let segHeight = totalHeight/rd.length;
                return (
                    <div className='round' key={String(rIndex)}
                        style={{
                            position: 'absolute',
                            left: String(240*rIndex)+'px',
                            top: '50px'
                    }}>
                        Round {rIndex+1}
                        {rd && rd.map((ma: any, ind: number) => {
                            return (
                            <Match
                                key={String(ind)}
                                style={{
                                    position: 'absolute',
                                    top: String(segHeight*(ind)+segHeight/2)+'px',
                                    left: '0px'
                                }}
                                rIndex={rIndex}
                                mIndex={ind}
                                matchProp={ma}
                                p2SetWinsNeeded={1}
                                setMatchResults={seSetMatchResults}
                            />
                            )
                        })}
                    </div>
                )
            })}
        </div>
        
    );
}