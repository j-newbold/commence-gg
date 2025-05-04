const express = require('express');
const router = express.Router();
const { supabase } = require("../utils/supabaseClient");
import { Request, Response } from 'express';
import { Socket } from 'socket.io';

import sql from '../db';

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await sql`select * from tournaments
            where tournament_id = ${id}`;
        res.json(data[0]);
    } catch (error) {
        console.log(error);
    }
})

router.get('/:id/entrants', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await sql`select p.tag, p.id from profiles p
            left join t_entrants tent
            on p.id = tent.user_id
            where tent.tournament_id = ${id}`;
        res.json(data);
    } catch (error) {
        console.log(error);
    }
})

interface tourneyData {
    numConns: number;
    data: any;
}
interface inputTidbit {

}
let testTourney: any = {
    tEntrants: [{tag: 'jesse'},
        {tag: 'alice'},
        {tag: 'bob'},
        {tag: 'clyde'}
    ],
    tStandings: [],
    outputInfo: [{
        fromBracket: 0,
        numPlayers: 4
    }],
    bracketList: [{
        bracketType: 'single_elim',
        inputInfo: {
            fromBracket: -1,
            order: 1,
            numEntrants: 4
        },
        bracketStruct: {

        },
        brEntrants: [],
        brStandings: []
    }]
    };
let tournamentCache: { [id: string] : tourneyData } = {};

const handleTournamentSockets = async (socket: Socket) => {
    console.log('a user connected to tournament socket');

    socket.on('reqTournament', (data) => {
        if (tournamentCache[data.tid]) {
            tournamentCache[data.tid].numConns += 1;
        } else {
            tournamentCache[data.tid] = {
                numConns: 1,
                data: testTourney
            }
            // tournamentCache[data.tid] = await sql(``);
        }
        socket.emit('sendTournament', tournamentCache[data.tid]);
    })

    socket.on('disc', (data) => {
        try {
            if (tournamentCache[data.tid]) {
                tournamentCache[data.tid].numConns -= 1;
                if (tournamentCache[data.tid].numConns == 0) {
                    delete tournamentCache[data.tid];
                }
            }
        } catch (error) {
            console.log(error);
        }
    })
}

module.exports = { router, handleTournamentSockets };