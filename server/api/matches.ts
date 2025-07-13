const express = require('express');
const router = express.Router();
const { supabase } = require("../utils/supabaseClient");
import { Request, Response } from 'express';

import sql from '../db';

router.post('/create', async (req: Request, res: Response) => {
    try {
        let vals: any = [];
        for (var ma of req.body.matches) {
            vals.push([
                (ma.p1?.id? ma.p1.id : null),
                (ma.p2?.id? ma.p2.id : null),
                (ma.winner? ma.winner.id : null),
                ma.winsP1,
                ma.winsP2,
                ma.isBye,
                ma.winsNeeded,
                ma.matchCol,
                ma.matchRow,
                ma.bracketId
            ]);
        }

        const data = await sql`
            INSERT INTO matches (p1_id, p2_id, winner_id, wins_p1, wins_p2, is_bye,
                wins_needed, m_row, m_col, bracket_id)
            VALUES ${sql(vals)}
            RETURNING match_id`;

        let returnMatches = req.body.matches.map((e: any, i: number) => {
            delete e.bracketId;
            return {
            ...e,
            matchId: data[i].match_id
        }});

        res.status(200).json(returnMatches);
    } catch (error) {
        console.log(error);
    }
})

router.post('/update', async (req: Request, res: Response) => {
    try {
        let values = [];
        let plVals = [];
        for (var ma of req.body.matches) {
            values.push([(ma.p1?.id? ma.p1.id : null),
                (ma.p2?.id? ma.p2.id : null),
                (ma.winner? ma.winner.id : null),
                ma.matchId,
                ma.winsP1,
                ma.winsP2,
                ma.isBye]);
        }
        const data = await sql`
            UPDATE matches AS m
            SET
                p1_id = (data.p1_id)::uuid,
                p2_id = (data.p2_id)::uuid,
                winner_id = (data.winner_id)::uuid,
                wins_p1 = (data.wins_p1)::int,
                wins_p2 = (data.wins_p2)::int,
                is_bye = (data.is_bye)::boolean
            FROM (
                VALUES ${sql(values)}
            ) AS data(p1_id, p2_id, winner_id, match_id, wins_p1, wins_p2, is_bye)
            WHERE m.match_id = (data.match_id)::int`;

        if (req.body?.placements) {
            for (var pl of req.body.placements) {
                plVals.push([pl.player.id,
                    pl.placement
                ])
            }
            const data2 = await sql`
                UPDATE t_entrants AS tent
                SET
                    placement = (tentData.placement)::int
                FROM (
                    VALUES ${sql(plVals)}
                ) AS tentData(id, placement)
                WHERE (tentData.id)::uuid = tent.user_id`;
        }

        if (req.body?.newStatus && req.body?.tid) {
            const data3 = await sql`
            UPDATE tournaments
            SET status = ${req.body.newStatus}
            WHERE tournament_id = ${req.body.tid}`;
        }

        res.status(200).json([req.body?.matches, req.body?.placements]);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;