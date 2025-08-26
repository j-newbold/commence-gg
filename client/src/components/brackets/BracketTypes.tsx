import { Entrant } from "../../utils/types";
export type UpdateAction =
    | { type: 'set'; value: Entrant }
    | { type: 'reset' }
    | { type: 'skip' };