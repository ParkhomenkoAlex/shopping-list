import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { queryClient } from '@/lib/QueryClient';
import { supabase } from '@/lib/SupabaseClient';
import { addMonitoringBreadcrumb, reportError } from '@/lib/Monitoring';

const AUTH_STARTUP_TIMEOUT_MS = 12_000;

export type AuthStartupStatus = 'initializing' | 'ready' | 'error';

type AuthContextValue = {
    session: Session | null;
    user: User | null;
    startupStatus: AuthStartupStatus;
    isLoading: boolean;
    retryInitialization: () => void;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [startupStatus, setStartupStatus] =
        useState<AuthStartupStatus>('initializing');
    const previousUserIdRef = useRef<string | null>(null);
    const attemptRef = useRef(0);
    const mountedRef = useRef(true);
    const isAttemptRunningRef = useRef(false);
    const retryInitializationRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        const updateSession = (nextSession: Session | null) => {
            if (!mountedRef.current) return;
            const nextUserId = nextSession?.user.id ?? null;

            if (previousUserIdRef.current !== nextUserId) {
                previousUserIdRef.current = nextUserId;
                queryClient.clear();
            }

            setSession(nextSession);
            setStartupStatus('ready');
        };

        const initializeAuth = async (isRetry = false) => {
            if (isAttemptRunningRef.current) return;
            isAttemptRunningRef.current = true;
            const attempt = ++attemptRef.current;
            setStartupStatus('initializing');
            addMonitoringBreadcrumb(
                isRetry ? 'auth_retry_requested' : 'auth_initialization_started'
            );

            let timeoutId: ReturnType<typeof setTimeout> | undefined;
            const timeout = new Promise<'timeout'>((resolve) => {
                timeoutId = setTimeout(
                    () => resolve('timeout'),
                    AUTH_STARTUP_TIMEOUT_MS
                );
            });

            try {
                const result = await Promise.race([
                    supabase.auth.getSession(),
                    timeout,
                ]);

                if (!mountedRef.current || attempt !== attemptRef.current)
                    return;
                if (result === 'timeout') {
                    setStartupStatus('error');
                    addMonitoringBreadcrumb('auth_initialization_timed_out');
                    return;
                }

                if (result.error) {
                    // An error is not evidence that a persisted session should be removed.
                    setStartupStatus('error');
                    reportError(
                        result.error,
                        'auth_initialization_returned_error'
                    );
                    addMonitoringBreadcrumb('auth_initialization_failed');
                    return;
                }

                updateSession(result.data.session);
                addMonitoringBreadcrumb('auth_initialization_succeeded', {
                    has_session: Boolean(result.data.session),
                });
            } catch (error) {
                if (mountedRef.current && attempt === attemptRef.current) {
                    setStartupStatus('error');
                    reportError(error, 'auth_initialization_threw');
                    addMonitoringBreadcrumb('auth_initialization_failed');
                }
            } finally {
                if (timeoutId) clearTimeout(timeoutId);
                if (attempt === attemptRef.current)
                    isAttemptRunningRef.current = false;
            }
        };

        void initializeAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            // Every Supabase auth event carries the SDK's current session. It is
            // therefore newer than a storage read which may still be pending.
            attemptRef.current += 1;
            isAttemptRunningRef.current = false;
            updateSession(nextSession);
        });

        const retry = () => {
            void initializeAuth(true);
        };
        retryInitializationRef.current = retry;

        return () => {
            mountedRef.current = false;
            attemptRef.current += 1;
            // React Strict Mode immediately remounts effects in development.
            // The first getSession() cannot be cancelled, so allow the second
            // mount to start its own guarded attempt and timeout.
            isAttemptRunningRef.current = false;
            retryInitializationRef.current = null;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }
    };

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw error;
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                startupStatus,
                isLoading: startupStatus === 'initializing',
                retryInitialization: () => retryInitializationRef.current?.(),
                signIn,
                signUp,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
