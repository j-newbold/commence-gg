const express = require('express');
const router = express.Router();
const { supabase } = require("../utils/supabaseClient");
import { Request, Response } from 'express';

import sql from '../db';

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

router.post('/create', async (req: Request, res: Response) => {
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

router.post('/:id/signup/:id2', async (req: Request, res: Response) => {
    try {
        const { id, id2 } = req.params;
        const data = await sql`insert into e_entrants (event_id, user_id)
            values (${id}, ${id2})`;
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await sql`DELETE FROM events
            WHERE event_id = ${id}`;
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
    }
})

router.delete('/:id/signup/:id2', async (req: Request, res: Response) => {
    try {
        const { id, id2 } = req.params;
        const data = await sql`delete from e_entrants
            where user_id = ${id2}
            and event_id = ${id}`;
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

router.post('/:id/changesignup/:val', async (req: Request, res: Response) => {
    try {
        const { id, val } = req.params;
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

module.exports = router;