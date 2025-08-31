import { Entrant, MatchObj } from "../../utils/types";
export type UpdateAction =
    | { type: 'set'; value: Entrant }
    | { type: 'reset' }
    | { type: 'skip' };

export type RecursiveResult =
    [
        MatchObj[],
        Entrant[]
    ];