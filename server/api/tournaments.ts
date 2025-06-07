const express = require('express');
const router = express.Router();
const { supabase } = require("../utils/supabaseClient");
import { Request, Response } from 'express';
import { Socket } from 'socket.io';

import sql from '../db';

router.post('/:id/resetStandings', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await sql`UPDATE t_entrants
            SET placement = null
            WHERE tournament_id = ${id}`;

        res.status(200);
    } catch (error) {
        console.log(error);
    }
})

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const entrants = await sql`SELECT p.tag, p.id, tent.placement from profiles p
            left join t_entrants tent
            on p.id = tent.user_id
            where tent.tournament_id = ${id}`;

        var bracketInfo: any = await sql`SELECT * FROM brackets
            WHERE tournament_id = ${1}
            ORDER BY bracket_id`;

        // will need to add winner tag as well
        const matchInfo = await sql`SELECT m.m_row, m.m_col,
                p1.id p1_id,
                p1.tag p1_tag,
                p2.id p2_id,
                p2.tag p2_tag,
            m.match_id, m.bracket_id, m.wins_needed, m.wins_p1, m.wins_p2, m.is_bye,
                m.winner_id
            FROM matches m
            LEFT JOIN brackets b
            ON m.bracket_id = b.bracket_id
            left JOIN
              profiles p1
            ON p1.id = m.p1_id
            left join
              profiles p2
            ON p2.id = m.p2_id
            WHERE b.tournament_id = ${1}
            ORDER BY b.bracket_id ASC, m.m_col ASC, m.m_row ASC`;
        //let bracketList: any[] = [];

        let bracketMap = new Map();
        let newBracketInfo: any;

        let curBracket = -1;
        let j = 0;

        for (let i=0;i<bracketInfo.length;i++) {
            if (curBracket != bracketInfo[i].bracket_id) {
                curBracket = bracketInfo[i].bracket_id;
            }

            let newRoundList = [];
            let prevCol = -1;
            while (j < matchInfo.length && matchInfo[j].bracket_id == curBracket) {
                if (matchInfo[j].m_col != prevCol) {
                    prevCol += 1;
                    newRoundList.push(<any>[]);
                }
                newRoundList.at(-1).push({
                    matchCol: matchInfo[j].m_col,
                    matchRow: matchInfo[j].m_row,
                    p1: (matchInfo[j].p1_tag? {
                        tag: matchInfo[j].p1_tag,
                        id: matchInfo[j].p1_id,
                        isHuman: true
                    } : null),
                    p2: (matchInfo[j].p2_tag? {
                        tag: matchInfo[j].p2_tag,
                        id: matchInfo[j].p2_id,
                        isHuman: true
                    } : null),
                    matchId: matchInfo[j].match_id,
                    winner: matchInfo[j].winner_id,
                    bracketId: matchInfo[j].bracket_id,
                    winsNeeded: matchInfo[j].wins_needed,
                    winsP1: matchInfo[j].wins_p1,
                    winsP2: matchInfo[j].wins_p2,
                    isBye: matchInfo[j].is_bye
                });

                j++;
            }

            newBracketInfo = { ...bracketInfo[i], roundList: newRoundList};

            bracketMap.set(bracketInfo[i].bracket_id, newBracketInfo);

        }

        res.json({
            entrants: entrants,
            brackets: Array.from(bracketMap.values()),
        });
        // will also have to do a sql query for standings
    } catch (error) {
        console.log(error);
    }
})

router.get('/:id/entrants', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await sql`select p.tag, p.id from profiles p
            left join t_entrants tent
            on p.id = tent.user_id
            where tent.tournament_id = ${id}`;
        res.json(data);
    } catch (error) {
        console.log(error);
    }
})

router.post('/:id/signup/:userid', async (req: Request, res: Response) => {
    const { id, userid } = req.params;
    try {
        const data = await sql`insert into t_entrants (tournament_id, user_id)
            values (${req.body.tournamentId}, ${req.body.userId})`;
        const retData = await sql`select p.tag, p.id from profiles p
            where p.id = ${req.body.userId}`;
        res.status(200).json(retData[0]);
    } catch (error) {
        console.log(error);
    }
})

router.delete('/:id/signup/:userid', async (req: Request, res: Response) => {
    const { id, userid } = req.params;
    try {
        const data = await sql`delete from t_entrants
            where user_id = ${req.body.userId}
            and tournament_id = ${req.body.tournamentId}`;
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

interface tourneyData {
    numConns: number;
    data: any;
}

/* const handleTournamentSockets = async (socket: Socket) => {
    console.log('a user connected to tournament socket');

    socket.on('reqTournament', (data) => {
        // 5/11/25 tournamentCache is probably a bad idea!
        if (tournamentCache[data.tid]) {
            tournamentCache[data.tid].numConns += 1;
        } else {
            tournamentCache[data.tid] = {
                numConns: 1,
                data: testTourney
            }
            // tournamentCache[data.tid] = await sql(``);
        }
        socket.emit('sendTournament', tournamentCache[data.tid]);
    })

    socket.on('disc', (data) => {
        try {
            if (tournamentCache[data.tid]) {
                tournamentCache[data.tid].numConns -= 1;
                if (tournamentCache[data.tid].numConns == 0) {
                    delete tournamentCache[data.tid];
                }
            }
        } catch (error) {
            console.log(error);
        }
    })
} */

module.exports = { router, /* handleTournamentSockets */ };