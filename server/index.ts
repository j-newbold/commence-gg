import {supabase} from "./utils/supabaseClient.js";
import { Request, Response } from 'express';
import { createServer } from 'node:http';

import { Server } from "socket.io";

import express from 'express';
const app = express();
//const pool = require('./db');
//pool.connect();
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config();
const corsOptions = {
    origin: process.env.ORIGIN,
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
};
//app.set('view engine', 'ejs');

app.use(cors(corsOptions));
app.use(express.json());

import eventRouter from './api/events.js';
app.use('/events', eventRouter);
import tournamentRouter from './api/tournaments.js';
app.use('/tournaments', tournamentRouter);
import matchRouter from './api/matches.js';
app.use('/matches', matchRouter);
import entrantRouter from './api/entrants.js';
app.use('/entrants', entrantRouter);
import profileRouter from './api/profiles.js';
app.use('/profiles', profileRouter);

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

    socket.on('tourney status updated', async ([newStatus, id]) => {
        io.to(id).emit('tourney status updated', newStatus);
    })

    //handleTournamentSockets(socket);
    
});

server.listen(5000, '0.0.0.0', () => {
    console.log('server has started on port 5000');
})