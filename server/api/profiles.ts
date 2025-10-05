import express from 'express';
const router = express.Router();
import { Request, Response } from 'express';
import { authMiddleware } from 'utils/authMiddleware.js';

import sql from '../db.js';

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await sql`SELECT * FROM profiles p
            WHERE ${id} = p.id`;

        res.status(200).json(data[0]);
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        if (userId != id) {
            res.status(401).json({ error: "Unauthorized" });
        }
        const data = await sql`UPDATE profiles p
            SET tag=${req.body.tag},
                first_name=${req.body.first_name},
                last_name=${req.body.last_name}
            WHERE id=${req.body.id}`;

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

export default router;