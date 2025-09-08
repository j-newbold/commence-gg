import express from 'express';
const router = express.Router();
import sql from '../db.js';
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await sql `SELECT * FROM profiles p
            WHERE ${id} = p.id`;
        res.status(200).json(data[0]);
    }
    catch (error) {
        console.log(error);
    }
});
router.post('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await sql `UPDATE profiles p
            SET tag=${req.body.tag},
                first_name=${req.body.first_name},
                last_name=${req.body.last_name}
            WHERE id=${req.body.id}`;
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
    }
});
export default router;
