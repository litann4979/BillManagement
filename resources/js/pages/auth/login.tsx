import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { useState, useEffect } from 'react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <Head title="Log in - Electricity Bill Management" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 font-['Inter'] relative overflow-hidden">
                {/* Static Background Particles - No Mouse Tracking */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.03),transparent_50%)]"></div>
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-blue-500/10 dark:bg-blue-400/5 animate-pulse"
                            style={{
                                width: Math.random() * 300 + 50,
                                height: Math.random() * 300 + 50,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                filter: 'blur(40px)',
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: '6s'
                            }}
                        />
                    ))}
                </div>

                {/* Animated Background Blobs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                {/* Main Content */}
                <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                    <div className="w-full max-w-md">
                        {/* Logo/Brand Section */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-blue-600/30">
                                ⚡
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                Electricity Bill Management
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                Enterprise-grade utility management platform
                            </p>
                        </div>

                        {/* Main Auth Card */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl opacity-10 blur-2xl transform -rotate-3"></div>
                            
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden">
                                {status && (
                                    <div className="absolute top-0 left-0 right-0 p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800">
                                        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {status}
                                        </div>
                                    </div>
                                )}

                                <div className="px-8 pt-8 pb-6 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        Welcome Back
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Enter your credentials to access your account
                                    </p>
                                </div>

                                <div className="p-8">
                                    <Form
                                        {...store.form()}
                                        resetOnSuccess={['password']}
                                        className="flex flex-col gap-6"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div className="space-y-5">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            Email Address
                                                        </Label>
                                                        <div className="relative group">
                                                            <div className="relative">
                                                                <Input
                                                                    id="email"
                                                                    type="email"
                                                                    name="email"
                                                                    required
                                                                    autoFocus
                                                                    tabIndex={1}
                                                                    autoComplete="email"
                                                                    placeholder="name@company.com"
                                                                    className="w-full h-12 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                                                />
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <InputError message={errors.email} className="text-sm text-red-600 dark:text-red-400" />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                Password
                                                            </Label>
                                                            {canResetPassword && (
                                                                <TextLink
                                                                    href={request()}
                                                                    tabIndex={5}
                                                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                                                >
                                                                    Forgot password?
                                                                </TextLink>
                                                            )}
                                                        </div>
                                                        <div className="relative group">
                                                            <div className="relative">
                                                                <Input
                                                                    id="password"
                                                                    type="password"
                                                                    name="password"
                                                                    required
                                                                    tabIndex={2}
                                                                    autoComplete="current-password"
                                                                    placeholder="••••••••"
                                                                    className="w-full h-12 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                                                />
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <InputError message={errors.password} className="text-sm text-red-600 dark:text-red-400" />
                                                    </div>

                                                    <div className="flex items-center space-x-3 pt-2">
                                                        <Checkbox
                                                            id="remember"
                                                            name="remember"
                                                            tabIndex={3}
                                                        />
                                                        <Label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                                                            Remember me for 30 days
                                                        </Label>
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        tabIndex={4}
                                                        disabled={processing}
                                                        className="relative w-full h-12 mt-4 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                                    >
                                                        <span className="relative z-10 flex items-center justify-center">
                                                            {processing ? (
                                                                <>
                                                                    <Spinner className="w-5 h-5 mr-2" />
                                                                    Authenticating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Sign In to Dashboard
                                                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                    </svg>
                                                                </>
                                                            )}
                                                        </span>
                                                    </Button>
                                                </div>

                                                {canRegister && (
                                                    <div className="relative mt-6">
                                                        <div className="absolute inset-0 flex items-center">
                                                            <div className="w-full border-t border-slate-200 dark:border-gray-700"></div>
                                                        </div>
                                                        <div className="relative flex justify-center text-sm">
                                                            <span className="px-4 bg-white dark:bg-gray-800 text-slate-500">
                                                                New to the platform?
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {canRegister && (
                                                    <div className="text-center">
                                                        <TextLink
                                                            href={register()}
                                                            tabIndex={6}
                                                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                                        >
                                                            Create an account
                                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </TextLink>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </Form>
                                </div>
                            </div>
                        </div>

                        {/* Security Badges */}
                        <div className="mt-8 text-center">
                            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    SSL Encrypted
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    2FA Available
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}