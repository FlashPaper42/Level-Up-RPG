import React, { useState } from 'react';
import { Cloud, LogIn, LogOut, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthControls = ({ isBattling = false }) => {
    const { user, configured, isLoading, error, signIn, signUp, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('signIn');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    if (isLoading || isBattling) return null;

    const submit = async event => {
        event.preventDefault();
        setMessage('');
        const result = mode === 'signIn'
            ? await signIn(username, password)
            : await signUp(username, password);
        if (!result.error) {
            setMessage(mode === 'signIn' ? 'Cloud save connected.' : 'Account created. You can now sign in.');
            if (mode === 'signIn') setIsOpen(false);
        }
    };

    if (user) {
        return (
            <button
                type="button"
                onClick={signOut}
                className={`auth-controls fixed z-[60] flex max-w-[min(13rem,calc(100vw-2rem))] items-center gap-2 rounded border-2 border-green-600 bg-slate-900/90 px-2 py-1 text-sm font-bold text-green-300 shadow-lg ${isBattling ? 'auth-controls-battling' : ''}`}
                title="Sign out of cloud save"
            >
                <Cloud size={16} className="shrink-0" /> <span className="auth-controls-label">Cloud save</span> <LogOut size={16} className="shrink-0" />
            </button>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={`auth-controls fixed z-[60] flex max-w-[min(13rem,calc(100vw-2rem))] items-center gap-2 rounded border-2 border-slate-600 bg-slate-900/90 px-2 py-1 text-sm font-bold text-slate-200 shadow-lg ${isBattling ? 'auth-controls-battling' : ''}`}
            >
                <Cloud size={16} className="shrink-0" /> <span className="auth-controls-label">{configured ? 'Sign in to save online' : 'Playing locally'}</span>
            </button>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={() => setIsOpen(false)}>
                    <section className="w-full max-w-md rounded-lg border-4 border-blue-500 bg-slate-900 p-5 shadow-2xl" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between border-b-2 border-slate-700 pb-3">
                            <h2 className="text-2xl font-bold uppercase text-blue-300">
                                {mode === 'signIn' ? 'Cloud Save Login' : 'Create Local Account'}
                            </h2>
                            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close"><X /></button>
                        </div>
                        {!configured ? (
                            <p className="text-slate-300">Supabase is not configured for this deployment, so progress is saved only in this browser. Clearing site data may erase it.</p>
                        ) : (
                            <>
                                <p className="mb-4 text-sm text-slate-300">Use any username and password. This is a game account, not a verified email website.</p>
                                <form onSubmit={submit} className="space-y-3">
                                    <input required minLength={3} value={username} onChange={event => setUsername(event.target.value)} placeholder="Username" className="w-full rounded border-2 border-slate-600 bg-slate-800 p-2 text-white" />
                                    <input required minLength={6} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password (6+ characters)" className="w-full rounded border-2 border-slate-600 bg-slate-800 p-2 text-white" />
                                    <button type="submit" className="flex w-full items-center justify-center gap-2 rounded border-2 border-blue-600 bg-blue-700 p-2 font-bold text-white hover:bg-blue-600">
                                        {mode === 'signIn' ? <LogIn size={18} /> : <UserPlus size={18} />}
                                        {mode === 'signIn' ? 'Sign in' : 'Create account'}
                                    </button>
                                </form>
                            </>
                        )}
                        {error && <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
                        {message && <p className="mt-3 text-sm text-green-300" role="status">{message}</p>}
                        {configured && (
                            <button type="button" onClick={() => { setMode(mode === 'signIn' ? 'signUp' : 'signIn'); setMessage(''); }} className="mt-4 text-sm text-blue-300 underline">
                                {mode === 'signIn' ? 'Create a new account' : 'Already have an account? Sign in'}
                            </button>
                        )}
                    </section>
                </div>
            )}
        </>
    );
};

export default AuthControls;
