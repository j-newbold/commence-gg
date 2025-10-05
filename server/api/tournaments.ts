import express from 'express';
const router = express.Router();
import { Request, Response } from 'express';
import { authMiddleware } from 'utils/authMiddleware.js';

import sql from '../db.js';

router.post('/create', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.body.id;

        // duplicated code
        const checkOwner = await sql`SELECT event_creator FROM events e
            WHERE e.event_id = ${req.body.eventId} LIMIT 1`;
        if (userId != checkOwner[0].event_creator) {
            res.status(401).json({ error: "Unauthorized" })
        }
        
        const data = await sql`INSERT INTO tournaments
            (event_id, tournament_name, status)
            VALUES (${req.body.eventId}, ${req.body.name}, 'upcoming')
            RETURNING event_id, tournament_id, tournament_name`;
            
        const bData = await sql`INSERT INTO brackets
            (tournament_id, b_type, wins_needed_default)
            VALUES (${data[0].tournament_id}, ${req.body.type}, ${req.body.winsNeeded})
            RETURNING b_type, wins_needed_default`;

        res.status(200).json({
            eventId: data[0].event_id,
            tournamentId: data[0].tournament_id,
            name: data[0].tournament_name,
            type: bData[0].b_type,
            winsNeeded: bData[0].wins_needed_default
        });
    } catch (error) {
        console.log(error);
    }
})

router.post('/:id/resetStandings', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // this will eventually change to use b_entrants
        const checkSignedUp = await sql`SELECT entrant_id FROM t_entrants te
            WHERE te.entrant_id = ${userId} LIMIT 1`;
        const checkOwner = await sql`SELECT event_creator FROM events e
            WHERE e.event_id = ${id} LIMIT 1`;
        if (userId != checkSignedUp[0].entrant_id && userId != checkOwner[0].event_creator) {
            res.status(401).json({ error: "Unauthorized" });
        }

        const data2 = await sql`UPDATE tournaments
            SET status = 'ready'
            WHERE tournament_id = ${id}`;

        await sql`UPDATE t_entrants
            SET placement = null
            WHERE tournament_id = ${id}`;

        res.status(200).send();
    } catch (error) {
        console.log(error);
    }
})

router.post('/:id/saveSeeding', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        const checkOwner = await sql`SELECT event_creator FROM events e
            WHERE e.event_id = ${id} LIMIT 1`;
        if (userId != checkOwner[0]?.event_creator) {
            res.status(401).json({ error: "Unauthorized" });
        }

        let vals = [];

        for (var pl of req.body.players) {
            vals.push([
                pl.id,
                pl.uuid
            ]);
        }

        await sql`UPDATE t_entrants tent
        SET
            seed = (data.new_seed)::int
        FROM (
            VALUES ${sql(vals)}
        ) AS data(new_seed, user_id)
        WHERE tent.user_id = (data.user_id)::uuid
        AND tournament_id = ${id}`;

        res.status(200);
    } catch (error) {
        console.log(error);
    }
})

router.delete('/clear/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const checkOwner = await sql`SELECT event_creator FROM events e
            WHERE e.event_id = ${id} LIMIT 1`;
        if (userId != checkOwner[0]?.event_creator) {
            res.status(401).json({ error: "Unauthorized" });
        }

        const data = await sql`DELETE FROM matches m
            WHERE m.bracket_id =
            (SELECT b.bracket_id from brackets b
                WHERE b.tournament_id = ${id})`;
        const data2 = await sql`UPDATE tournaments
            SET status = 'upcoming'
            WHERE tournament_id = ${id}`;
        const data3 = await sql`UPDATE t_entrants
            SET placement = null
            WHERE tournament_id = ${id}`;
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

router.delete('/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const checkOwner = await sql`SELECT event_creator FROM events e
            WHERE e.event_id = ${id} LIMIT 1`;
        if (userId != checkOwner[0]?.event_creator) {
            res.status(401).json({ error: "Unauthorized" });
        }

        const data = await sql`DELETE FROM tournaments t
            WHERE t.tournament_id = ${id}`;
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const entrants = await sql`SELECT p.tag, p.id, tent.placement, tent.seed from profiles p
            left join t_entrants tent
            on p.id = tent.user_id
            where tent.tournament_id = ${id}
            ORDER BY tent.seed`;

        var bracketInfo: any = await sql`SELECT b.bracket_id, b.tournament_id, b.b_type, b.wins_needed_default, t.status, t.tournament_name, e.event_creator FROM brackets b
            LEFT JOIN tournaments t
            ON b.tournament_id = t.tournament_id
            LEFT JOIN events e
            ON t.event_id = e.event_id
            WHERE b.tournament_id = ${id}
            ORDER BY b.bracket_id`;

        // will need to add winner tag as well
        const matchInfo = await sql`SELECT m.m_row, m.m_col,
                p1.id p1_id,
                p1.tag p1_tag,
                p2.id p2_id,
                p2.tag p2_tag,
            m.match_id, m.bracket_id, m.wins_needed, m.wins_p1, m.wins_p2, m.p1_type, m.p2_type,
                m.winner_id,
                tent1.seed p1_seed,
                tent2.seed p2_seed
            FROM matches m
            LEFT JOIN brackets b
            ON m.bracket_id = b.bracket_id
            left JOIN
              profiles p1
            ON p1.id = m.p1_id
            left join
              profiles p2
            ON p2.id = m.p2_id
            LEFT JOIN
                t_entrants tent1
            ON p1.id = tent1.user_id
            AND ${id} = tent1.tournament_id
            LEFT JOIN
                t_entrants tent2
            ON p2.id = tent2.user_id
            AND ${id} = tent2.tournament_id
            WHERE b.tournament_id = ${id}
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
                let newData = {
                    matchCol: matchInfo[j].m_col,
                    matchRow: matchInfo[j].m_row,
                    p1: (matchInfo[j].p1_tag? {
                        tag: matchInfo[j].p1_tag,
                        uuid: matchInfo[j].p1_id,
                        isHuman: true,
                        id: matchInfo[j].p1_seed
                    } : null),
                    p2: (matchInfo[j].p2_tag? {
                        tag: matchInfo[j].p2_tag,
                        uuid: matchInfo[j].p2_id,
                        isHuman: true,
                        id: matchInfo[j].p2_seed
                    } : null),
                    matchId: matchInfo[j].match_id,
                    winner: (matchInfo[j].winner_id? (matchInfo[j].winner_id == matchInfo[j].p1_id? {
                        tag: matchInfo[j].p1_tag,
                        uuid: matchInfo[j].p1_id,
                        isHuman: true,
                        id: matchInfo[j].p1_seed
                    } : {
                        tag: matchInfo[j].p2_tag,
                        uuid: matchInfo[j].p2_id,
                        isHuman: true,
                        id: matchInfo[j].p2_seed
                    }) : null),
                    bracketId: matchInfo[j].bracket_id,
                    winsNeeded: matchInfo[j].wins_needed,
                    winsP1: matchInfo[j].wins_p1,
                    winsP2: matchInfo[j].wins_p2,
                    p1Type: matchInfo[j].p1_type,
                    p2Type: matchInfo[j].p2_type,
                }
                if (matchInfo[j].m_col != prevCol) {
                    prevCol += 1;
                    newRoundList.push(<any>[]);
                }
                newRoundList.at(-1).push(newData);

                j++;
            }

            newBracketInfo = { ...bracketInfo[i],
                roundList: newRoundList
            };

            bracketMap.set(bracketInfo[i].bracket_id, newBracketInfo);

        }

        res.json({
            entrants: entrants,
            brackets: Array.from(bracketMap.values()),
        });
    } catch (error) {
        console.log(error);
    }
})

router.get('/:id/entrants', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await sql`select p.tag, p.id, tent.seed from profiles p
            left join t_entrants tent
            on p.id = tent.user_id
            where tent.tournament_id = ${id}`;
        res.json(data);
    } catch (error) {
        console.log(error);
    }
})

router.post('/:id/signup/:id2', authMiddleware, async (req: any, res: any) => {
    try {
        const { id, id2 } = req.params;
        const userId = req.user.id;
        
        const checkOwner = await sql`SELECT event_creator FROM events e
            WHERE e.event_id = ${id} LIMIT 1`;

        if (userId != id2 && userId != checkOwner[0]?.event_creator) {
            res.status(401).json({ error: "Unauthorized" });
        }

        const checkESignup = await sql`SELECT ee.user_id FROM e_entrants ee
            WHERE ee.event_id = ${id}
            AND ee.user_id = ${userId}`;
        const checkTSignup = await sql`SELECT te.user_id FROM t_entrants te
            WHERE te.event_id = ${id}
            AND te.user_id = ${userId}`;

        if (checkESignup.length == 0 || checkTSignup.length > 0) {
            res.status(401).json({ error: "Signup error" });
        }

        const data = await sql`insert into t_entrants (tournament_id, user_id, seed)
            values (${req.body.tournamentId}, ${userId}, ${req.body.seed})`;
        const retData = await sql`select p.tag, p.id from profiles p
            where p.id = ${userId}`;
        res.status(200).json(retData[0]);
    } catch (error) {
        console.log(error);
    }
})

router.delete('/:id/signup/:id2', authMiddleware, async (req: any, res: any) => {
    try {
        const { id, id2 } = req.params;
        const userId = req.user.id;
        
        const checkOwner = await sql`SELECT event_creator FROM events e
            WHERE e.event_id = ${id} LIMIT 1`;

        if (userId != id2 && userId != checkOwner[0]?.event_creator) {
            res.status(401).json({ error: "Unauthorized" });
        }

        const data = await sql`delete from t_entrants
            where user_id = ${req.body.userId}
            and tournament_id = ${req.body.tournamentId}`;
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

router.get('/:id/regstatus/:id2', async (req: any, res: any) => {
    try {
        const { id, id2 } = req.params;
        
        const tournamentData = await sql`SELECT * FROM t_entrants
            WHERE user_id = ${id2}
            AND tournament_id = ${id}`;

        const eventData = await sql`SELECT * FROM e_entrants
            WHERE user_id = ${id2}
            AND event_id = (SELECT event_id FROM tournaments
                WHERE tournament_id = ${id})`;

        const retObj = {
            isRegisteredEvent: (eventData.length > 0),
            isRegisteredTournament: (tournamentData.length > 0)
        }

        res.status(200).json(retObj);

    } catch (error) {
        console.log(error);
    }
})

export default router;