import { createContext } from 'react';
import { ElimBracket } from './types.tsx';

const BracketContext = createContext<ElimBracket | null>({
    bracketList: []
});

export default BracketContext;