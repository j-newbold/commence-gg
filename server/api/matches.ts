const express = require('express');
const router = express.Router();
const { supabase } = require("../utils/supabaseClient");
import { Request, Response } from 'express';

import sql from '../db';

router.post('/update', async (req: Request, res: Response) => {
    try {
        let values = [];
        for (var ma of req.body.matches) {
            values.push([(ma.p1?.id? ma.p1.id : null), (ma.p2?.id? ma.p2.id : null), (ma.winner? ma.winner.id : null), ma.matchId]);
        }
        const data = await sql`
            UPDATE matches AS m
            SET
                p1_id = (data.p1_id)::uuid,
                p2_id = (data.p2_id)::uuid,
                winner_id = (data.winner_id)::uuid
            FROM (
                VALUES ${sql(values)}
            ) AS data(p1_id, p2_id, winner_id, match_id)
            WHERE m.match_id = (data.match_id)::int`;
        res.status(200).json(req.body.matches);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;