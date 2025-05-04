const { supabase } = require("./utils/supabaseClient");
import { Request, Response } from 'express';
import { createServer } from 'node:http';
import sql from './db';

import { Server } from "socket.io";

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
const { router: tournamentRouter, handleTournamentSockets } = require('./api/tournaments.ts');
app.use('/tournaments', tournamentRouter);

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

const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN, // React app's URL
      methods: ['GET', 'POST'],
    },
  });
io.on('connection', (socket) => {
    console.log('a user connected');

    handleTournamentSockets(socket);
    
});

server.listen(5000, () => {
    console.log('server has started on port 5000');
})