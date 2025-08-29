// deprecated
export type Player = {
    seed?: number;
    tag: string;
    isHuman?: boolean;
    id?: string;
}

export type Result = {
    gw: number,
    gl: number,
    mw: number,
    ml: number
}

export type MatchObj = {
    p1?: Entrant | null;
    p2?: Entrant | null;
    winner: Entrant | null;
    loser?: Entrant | null;
    // the boolean denotes whether or not winner of
    // match at [number, number, number]
    // feeds into MatchObj (true) or loser (false)
    // final number is "set wins to advance"
    p2SetWinsNeeded?: number;

    matchId?: number;

    winsNeeded?: number;
    winsP1?: number;
    winsP2?: number;

    matchCol?: number;
    matchRow?: number;

    isBye?: boolean;

    bracketId?: number;

    status?: string;
}

// probably deprecated
export type Round = {
    matchList: MatchObj[];
    roundId: number;
}

export type SingleBracket = {
    roundList: MatchObj[][];

    playerList: Entrant[]

    winsNeeded: number | null;

    status: string | null;

    bracketId: number | null;
    tournamentId?: string | null;

    type?: string;

    tournamentName?: string;
}

export type Entrant = {
    placement: number | null;
    id: number; // using "id" instead of "seed" to work better with dnd-kit/sortable
    tag: string;
    isHuman?: boolean;
    uuid: string | null;
}

export type FullTournament = {
    bracketList: SingleBracket[];
    entrantList: Player[];
}

// this will eventually be deprecated
// will eventually create a new type for double elim
export type ElimBracket = {
    bracketList: SingleBracket[];
}

export type RRMatchObj = {
    p1?: Player | null;
    p2?: Player | null;
    winner?: Player | null;
    loser?: Player | null;
    
    gameCount: [number, number];
}

export type RRPool = {

    playerList: Player[];

    resultsList: number[][];

    placements: (number | null)[];

    matchList: RRMatchObj[][];

    winsNeeded: number;

    matchesFinished: number;
}