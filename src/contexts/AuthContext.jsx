import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext(null);
const USERNAME_EMAIL_SUFFIX = '@accounts.level-up-rpg.invalid';

const usernameToEmail = username => `${username.trim().toLowerCase()}${USERNAME_EMAIL_SUFFIX}`;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!supabase) return undefined;

        let mounted = true;
        supabase.auth.getSession().then(({ data, error: sessionError }) => {
            if (!mounted) return;
            if (sessionError) setError(sessionError.message);
            setSession(data.session);
            setIsLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setIsLoading(false);
        });

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    const signIn = async (username, password) => {
        if (!supabase) return { error: new Error('Cloud accounts are not configured.') };
        setError('');
        const result = await supabase.auth.signInWithPassword({
            email: usernameToEmail(username),
            password,
        });
        if (result.error) setError(result.error.message);
        return result;
    };

    const signUp = async (username, password) => {
        if (!supabase) return { error: new Error('Cloud accounts are not configured.') };
        setError('');
        const result = await supabase.auth.signUp({
            email: usernameToEmail(username),
            password,
            options: { data: { username: username.trim() } },
        });
        if (result.error) setError(result.error.message);
        return result;
    };

    const signOut = async () => {
        if (!supabase) return;
        const result = await supabase.auth.signOut();
        if (result.error) setError(result.error.message);
    };

    return (
        <AuthContext.Provider value={{
            session,
            user: session?.user || null,
            isLoading,
            error,
            configured: isSupabaseConfigured,
            signIn,
            signUp,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
