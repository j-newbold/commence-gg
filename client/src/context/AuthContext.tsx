import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
    session: any;
    profile?: any;
    setSession: React.Dispatch<React.SetStateAction<any>>;
    setProfile: React.Dispatch<React.SetStateAction<any>>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [sessionState, setSessionState] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let currentUserId: string | null = null;

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSessionState(session);
            currentUserId = session?.user?.id || null;
            return session;
        }).then((session) => {
            return supabase.from('profiles')
            .select()
            .eq('id', session?.user.id);
        }).then((profile) => {
            setLoading(false);
            setProfile(profile.data);
        })

        // Subscribe to auth state changes
        const { data: {subscription} } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                //console.log(_event);
                const newUserId = session?.user?.id || null;
                // this may need to be expanded
                if (_event === 'SIGNED_IN' && newUserId == currentUserId) {
                    //console.log('signed in, same user');
                    return;
                }
                currentUserId = newUserId;
                setSessionState(() => session);
            }
        );

    return () => {
        subscription.unsubscribe();
    };
}, []);

    useEffect(() => {
        //console.log('sessionState uef');
        if (!sessionState) {
            //console.log('!');
            setProfile(null);
        } else {
            (async () => {
                const jsonData = await supabase.from('profiles')
                .select()
                .eq('id', sessionState?.user.id)
                .single();
                setProfile(jsonData.data);
            })();
        }
    }, [sessionState]);

    useEffect(() => {
        if (loading) return;

        if (sessionState && !profile?.tag) {
            //console.log('nav crp');
            navigate('/createprofile');
        } else if (sessionState) {
            if (window.history.length >= 1 && location.state?.previous) {
                //console.log('nav previous');
                navigate(location.state.previous);
            } else {
                //console.log('nav home');
                navigate('/');
            }
        }
    }, [profile, loading]);

  return (
        <AuthContext.Provider value={{ session: sessionState, setSession: setSessionState, profile, setProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};