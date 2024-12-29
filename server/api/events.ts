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


router.get('/events/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('events')
        .select()
        .eq('id', id);
});

router.get('/events/:id/entrants', async (req: Request, res: Response) => {
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

router.post('/events/:id/signup/:id2', async (req: Request, res: Response) => {
    try {
        const { id, id2 } = req.params;
        const data = await sql`insert into e_entrants (event_id, user_id)
            values (${id}, ${id2})`;
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

router.delete('/events/:id/signup/:id2', async (req: Request, res: Response) => {
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

module.exports = router;