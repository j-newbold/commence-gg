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
const matchRouter = require('./api/matches.ts');
app.use('/matches', matchRouter);
const entrantRouter = require('./api/entrants.ts');
app.use('/entrants', entrantRouter);

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
      origin: process.env.ORIGIN,
      methods: ['GET', 'POST'],
    },
  });
io.on('connection', async (socket) => {

    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
    })
        
    socket.on('signup added', async ([userInfo, id]) => {
        io.to(id).emit('signup added', userInfo);
    });
    socket.on('signup removed', async ([userId, id]) => {
        io.to(id).emit('signup removed', userId);
    });

    socket.on('matches updated', async ([newMatchData, id]) => {
        io.to(id).emit('matches updated', newMatchData);
    });

    socket.on('placements updated', async ([newPlData, id]) => {
        io.to(id).emit('placements updated', newPlData);
    })

    socket.on('matches cleared', async (id) => {
        io.to(id).emit('matches cleared');
    })

    socket.on('match list created', async ([matchData, id]) => {
        io.to(id).emit('match list created', matchData);
    })

    //handleTournamentSockets(socket);
    
});

server.listen(5000, () => {
    console.log('server has started on port 5000');
})