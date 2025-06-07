const express = require('express');
const router = express.Router();
const { supabase } = require("../utils/supabaseClient");
import { Request, Response } from 'express';

import sql from '../db';

router.post('/', async (req: Request, res: Response) => {
    try {
        res.status(200);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;