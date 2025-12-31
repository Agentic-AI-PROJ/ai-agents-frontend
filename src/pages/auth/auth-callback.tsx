import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { storage, STORAGE_KEYS } from '@/utils/storage';
import { appRoutes } from '@/config/site';

function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const authRoute = appRoutes.find((route) => route.name === "Auth");

    useEffect(() => {
        document.title = `Auth Callback`;
        const token = searchParams.get('token');
        const redirect = searchParams.get('redirect');

        if (token) {
            // Store the JWT token in localStorage
            storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
            setStatus('success');

            // Redirect to original page or home page after a short delay
            setTimeout(() => {
                navigate(redirect || '/');
            }, 1000);
        } else {
            setStatus('error');
            setTimeout(() => {
                navigate(authRoute?.path || '/auth');
            }, 2000);
        }
    }, [searchParams, navigate]);

    return (
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 min-h-[60vh]">
            {status === 'loading' && (
                <div className="text-center">
                    <div className="text-lg">Processing authentication...</div>
                </div>
            )}
            {status === 'success' && (
                <div className="text-center">
                    <div className="text-2xl font-bold text-success mb-2">✓ Success!</div>
                    <div className="text-default-500">Redirecting to home page...</div>
                </div>
            )}
            {status === 'error' && (
                <div className="text-center">
                    <div className="text-2xl font-bold text-danger mb-2">✗ Error</div>
                    <div className="text-default-500">Authentication failed. Redirecting...</div>
                </div>
            )}
        </section>
    );
}

export default AuthCallback;
