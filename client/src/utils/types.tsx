export type Player = {
    seed?: number;
    tag: string;
    isHuman?: boolean;
    id?: string;
}

export type MatchObj = {
    p1?: Player | null;
    p2?: Player | null;
    winner: Player | null;
    loser?: Player | null;
    // the boolean denotes whether or not winner of
    // match at [number, number, number]
    // feeds into MatchObj (true) or loser (false)
    // final number is "set wins to advance"
    p2SetWinsNeeded?: number;
    matchId: number;
    winsNeeded?: number;    // need to add game wins
    winsP1?: number;
    winsP2?: number;

    matchCol?: number;
    matchRow?: number;

    isBye?: boolean;
}

export type FinalsMatchObj = MatchObj & {
}

// probably deprecated
export type Round = {
    matchList: MatchObj[];
    roundId: number;
}

export type SingleBracket = {
    roundList: MatchObj[][];

    playerList?: Entrant[]

    finals?: MatchObj | null;

    winsNeeded: number | null;

    status: string | null;

    bracketId: number | null;
    tournamentId?: string | null;

    type?: string;
}

export type Entrant = {
    player: Player;
    placement: number | null;
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