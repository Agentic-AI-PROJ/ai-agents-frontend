import { useEffect, useRef, useState } from 'react';
import { GithubIcon, GoogleIcon } from '@/components/icons';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Avatar } from '@heroui/avatar';
import { apiClient } from '@/api/apiClient';
import { User } from '@/types/User';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuthMethods } from '@/api/auth.api';
import { useAlert } from '@/contexts/AlertContext';
import { useUser } from '@/contexts/UserContext';

const BACKEND = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

function AuthPage() {
    const { user, loading, logout } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const navigate = useNavigate();
    const effectRan = useRef(false);
    const [authMethods, setAuthMethods] = useState<string[] | null>(null);
    const [searchParams] = useSearchParams();
    const { showAlert } = useAlert();

    const loadAuthMethods = async () => {
        try {
            const res = await getAuthMethods();
            setAuthMethods(res);
        } catch (error) {
            console.error('Error loading auth methods:', error);
        }
    };

    useEffect(() => {
        document.title = `Auth`;
        if (effectRan.current) return;
        effectRan.current = true;

        // Check if there's an error in URL params and show alert
        const errorParam = searchParams.get('error');
        if (errorParam) {
            showAlert({
                title: 'Authentication Error',
                description: decodeURIComponent(errorParam),
                variant: 'danger',
                timeout: 8000
            });
            // Clean up URL by removing error param
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('error');
            const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
            window.history.replaceState({}, '', newUrl);
        }

        // Only load auth methods if not logged in
        if (!user) {
            loadAuthMethods();
        }
    }, [user]);

    const handleProvider = (provider: "google" | "github") => {
        // Get redirect parameter if exists
        const redirect = searchParams.get('redirect');

        // Redirect to OAuth endpoint with redirect parameter
        const redirectParam = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
        window.location.href = `${BACKEND}/auth/${provider}${redirectParam}`;
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setAuthLoading(true);

        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
            const payload = mode === 'login'
                ? { email, password }
                : { email, password, displayName };

            const res = await apiClient.post<{ token: string; user: User }>(endpoint, payload);

            if (res?.token) {
                // Clear form
                setEmail('');
                setPassword('');
                setDisplayName('');

                // Get redirect parameter if exists
                const redirect = searchParams.get('redirect');
                const redirectParam = redirect ? `&redirect=${encodeURIComponent(redirect)}` : '';

                navigate(`/auth/callback?token=${res.token}${redirectParam}`);
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            showAlert({
                title: "Error logging in",
                description: "Error logging in",
                variant: "danger",
                timeout: 10000 // 10 seconds
            });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        setError(null);
        loadAuthMethods();
    };

    if (loading) {
        return (
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="text-center">Loading...</div>
            </section>
        );
    }

    if (user) {
        return (
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <Card className="max-w-md w-full">
                    <CardBody className="flex flex-col items-center gap-4 p-6">
                        <h2 className="text-2xl font-bold">You are logged in to</h2>
                        <Avatar
                            src={user.avatar}
                            name={user.displayName}
                            size="lg"
                            className="w-20 h-20"
                        />
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">{user.displayName}</h2>
                            <p className="text-default-500">{user.email}</p>
                        </div>
                        <Button
                            color="danger"
                            variant="flat"
                            onPress={handleLogout}
                            className="w-full"
                        >
                            Logout
                        </Button>
                    </CardBody>
                </Card>
            </section>
        );
    }

    return (
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            <div className="inline-block max-w-lg text-center justify-center w-full">
                <h1 className="text-4xl font-bold mb-6">
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                </h1>
                {error && (
                    <div className="mb-4 p-3 bg-danger-50 text-danger rounded-lg">
                        {error}
                    </div>
                )}
                {
                    authMethods?.includes("email") && (
                        <Card className="w-full mb-6">
                            <CardBody className="p-6 gap-4">
                                <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                                    {mode === 'register' && (
                                        <div className="flex flex-col gap-2 text-left">
                                            <label className="text-sm font-medium">Display Name</label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="px-3 py-2 rounded-lg border border-default-200 bg-default-50 focus:outline-none focus:border-primary"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2 text-left">
                                        <label className="text-sm font-medium">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="px-3 py-2 rounded-lg border border-default-200 bg-default-50 focus:outline-none focus:border-primary"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 text-left">
                                        <label className="text-sm font-medium">Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="px-3 py-2 rounded-lg border border-default-200 bg-default-50 focus:outline-none focus:border-primary"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <Button
                                        color="primary"
                                        type="submit"
                                        isLoading={authLoading}
                                    >
                                        {mode === 'login' ? 'Sign In' : 'Sign Up'}
                                    </Button>
                                </form>

                                <div className="flex items-center gap-2 text-sm justify-center">
                                    <span className="text-default-500">
                                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                                    </span>
                                    <button
                                        className="text-primary hover:underline font-medium"
                                        onClick={() => {
                                            setMode(mode === 'login' ? 'register' : 'login');
                                            setError(null);
                                        }}
                                    >
                                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                                    </button>
                                </div>
                            </CardBody>
                        </Card>
                    )
                }

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-default-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-background text-default-500">Or continue with</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {
                        authMethods?.includes("github") && (
                            <Button
                                onPress={() => handleProvider("google")}
                                startContent={<GoogleIcon size={30} className="text-default-500" />}
                                variant="bordered"
                            >
                                Continue with Google
                            </Button>
                        )
                    }
                    {
                        authMethods?.includes("google") && (
                            <Button
                                onPress={() => handleProvider("github")}
                                startContent={<GithubIcon className="text-default-500" />}
                                variant="bordered"
                            >
                                Continue with Github
                            </Button>
                        )
                    }
                </div>
            </div>
        </section>
    );
}

export default AuthPage;