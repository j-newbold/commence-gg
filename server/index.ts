const { supabase } = require("./utils/supabaseClient");
import { Request, Response } from 'express';
import sql from './db';

const express = require('express');
const app = express();
//const pool = require('./db');
//pool.connect();
const cors = require('cors');
require('dotenv').config();
const corsOptions = {
    origin: process.env.ORIGIN, // Change to your frontend's URL
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
};
//app.set('view engine', 'ejs');

app.use(cors(corsOptions));
app.use(express.json());

const eventRouter = require('./api/events.ts');
app.use('/events', eventRouter);

app.get('/', (req: Request, res: Response) => {
    const response = { msg: "response from server: ok!"};
    res.send(response);
});

app.get('/tournaments', async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('tournaments')
        .select();
    res.json(data);
})

app.listen(5000, () => {
    console.log('server has started on port 5000');
})