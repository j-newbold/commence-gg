import express from 'express';
const router = express.Router();
import sql from '../db.js';
router.post('/create', async (req, res) => {
    try {
        let vals = [];
        for (var ma of req.body.matches) {
            vals.push([
                (ma.p1?.uuid ? ma.p1.uuid : null),
                (ma.p2?.uuid ? ma.p2.uuid : null),
                (ma.winner ? ma.winner.uuid : null),
                ma.winsP1,
                ma.winsP2,
                ma.p1Type,
                ma.p2Type,
                ma.winsNeeded,
                ma.matchRow,
                ma.matchCol,
                ma.bracketId
            ]);
        }
        const data = await sql `
            INSERT INTO matches (p1_id, p2_id, winner_id, wins_p1, wins_p2, p1_type, p2_type,
                wins_needed, m_row, m_col, bracket_id)
            VALUES ${sql(vals)}
            RETURNING match_id`;
        let returnMatches = req.body.matches.map((e, i) => {
            delete e.bracketId;
            return {
                ...e,
                matchId: data[i].match_id
            };
        });
        res.status(200).json(returnMatches);
    }
    catch (error) {
        console.log(error);
    }
});
router.post('/update', async (req, res) => {
    try {
        let values = [];
        let plVals = [];
        if (req.body.matches.length < 1)
            return;
        /* console.log('matches:');
        console.log(req.body.matches); */
        for (var ma of req.body.matches) {
            values.push([(ma.p1?.uuid ? ma.p1.uuid : null),
                (ma.p2?.uuid ? ma.p2.uuid : null),
                (ma.winner ? ma.winner.uuid : null),
                ma.matchId,
                ma.winsP1,
                ma.winsP2,
                ma.p1Type,
                ma.p2Type]);
        }
        const data = await sql `
            UPDATE matches AS m
            SET
                p1_id = (data.p1_id)::uuid,
                p2_id = (data.p2_id)::uuid,
                winner_id = (data.winner_id)::uuid,
                wins_p1 = (data.wins_p1)::int,
                wins_p2 = (data.wins_p2)::int,
                p1_type = (data.p1_type)::entrant_type,
                p2_type = (data.p2_type)::entrant_type
            FROM (
                VALUES ${sql(values)}
            ) AS data(p1_id, p2_id, winner_id, match_id, wins_p1, wins_p2, p1_type, p2_type)
            WHERE m.match_id = (data.match_id)::int`;
        /*         console.log('placements');
                console.log(req.body.placements); */
        if (req.body?.placements && req.body.placements.length > 0) {
            for (var pl of req.body.placements) {
                plVals.push([pl.uuid,
                    pl.placement
                ]);
            }
            const data2 = await sql `
                UPDATE t_entrants AS tent
                SET
                    placement = (tentData.placement)::int
                FROM (
                    VALUES ${sql(plVals)}
                ) AS tentData(id, placement)
                WHERE (tentData.id)::uuid = tent.user_id`;
        }
        if (req.body?.newStatus && req.body?.tid) {
            const data3 = await sql `
            UPDATE tournaments
            SET status = ${req.body.newStatus}
            WHERE tournament_id = ${req.body.tid}`;
        }
        res.status(200).json([req.body?.matches, req.body?.placements]);
    }
    catch (error) {
        console.log(error);
    }
});
export default router;
