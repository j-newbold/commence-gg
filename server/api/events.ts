import express from 'express';
import { supabase } from '../utils/supabaseClient.js';
const router = express.Router();
import { Request, Response } from 'express';
import { authMiddleware } from 'utils/authMiddleware.js';

import sql from '../db.js';

router.get('/', async (req: Request, res: Response) => {
    try {
        const { data } = await supabase
            .from('events')
            .select();
        //console.log('data: '+JSON.stringify(data));
        res.json(data);
    } catch (error) {
        
    }
})

router.post('/create', authMiddleware, async (req: Request, res: Response) => {
    try {
        const data = await sql`INSERT INTO events (event_name, event_start_date, event_desc, event_creator, signups_open)
        VALUES (${req.body.eName},
            ${req.body.eDate},
            ${req.body.eDesc},
            ${req.body.eCreator},
            ${true})
        RETURNING event_id`;

        const data2 = await sql`INSERT INTO e_entrants (user_id, event_id)
        VALUES (${req.body.eCreator}, ${data[0].event_id})`;
        res.status(201).json(data);
    } catch (error) {
        console.log(error);
    }
})

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await sql`SELECT * FROM events
        WHERE event_id = ${id}`;
    res.status(200).json(data);
});

router.get('/:id/entrants', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await sql`select p.tag, p.id from profiles p
            left join e_entrants ent
            on p.id = ent.user_id
            where ent.event_id = ${ id }`;
        res.json(data);
    } catch (error) {
        console.log(error);
    }
})

router.post('/:id/signup/:id2', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const { id, id2 } = req.params;
        const checkEvent = await sql`SELECT event_creator, signups_open FROM events e
            WHERE e.event_id = ${id} LIMIT 1`;
        if (checkEvent[0]?.event_creator && (checkEvent[0]?.signups_open == false || userId != id2)) {
            res.status(401).json({ error: "Unauthorized" });
        }

        const checkSignup = await sql`SELECT * FROM e_entrants
            WHERE entrant_id = ${id2}
            AND event_id = ${id}`;
        if (checkSignup.length > 0) {
            res.status(401).json({ error: "User is already signed up" });
        }

        const data = await sql`insert into e_entrants (event_id, user_id)
            values (${id}, ${id2})`;
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

router.delete('/:id/signup/:id2', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const { id, id2 } = req.params;
        const checkEvent = await sql`SELECT event_creator, signups_open FROM events e
            WHERE e.event_id = ${id} LIMIT 1`;
        if (checkEvent[0]?.event_creator && (checkEvent[0]?.signups_open == false || userId != id2)) {
            res.status(401).json({ error: "Unauthorized" });
        }

        const data = await sql`delete from e_entrants
            where user_id = ${id2}
            and event_id = ${id}`;
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

router.delete('/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const checkOwner = await sql`SELECT event_creator FROM events
            WHERE event_id = ${id}`;
        
        if (checkOwner[0]?.event_creator != userId) {
            res.status(401).json({ error: "Unauthorized"})
        }

        const data = await sql`DELETE FROM events
            WHERE event_id = ${id}`;
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
    }
})

router.post('/:id/changesignup/:val', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const { id, val } = req.params;

        const checkOwner = await sql`SELECT event_creator FROM events
            WHERE event_id = ${id}`;
        if (userId != checkOwner[0]?.event_creator) {
            res.status(401).json({ error: "unauthorized" });
        }

        const data = await sql`update events
            set signups_open = ${Boolean(val)}
            where event_id = ${id}`;
        res.sendStatus(200);
    } catch (error) {
        console.log(error);        
    }
})

router.get('/:id/tournaments', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await sql`
            select * from tournaments
            where event_id = ${id}`
        res.json(data);
    } catch (error) {
        console.log(error);
    }
})

export default router;