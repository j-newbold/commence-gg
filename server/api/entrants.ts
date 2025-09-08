import express from 'express';
const router = express.Router();
import { Request, Response } from 'express';

router.post('/', async (req: Request, res: Response) => {
    try {
        res.status(200);
    } catch (error) {
        console.log(error);
    }
})

export default router;