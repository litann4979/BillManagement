import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { useState, useEffect } from 'react';

export default function Welcome() {
    const { auth } = usePage().props;
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        
        window.addEventListener('scroll', handleScroll);
        
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 4);
        }, 3000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);

    if (!mounted) return null;

    return (
        <>
            <Head title="Electricity Bill Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap"
                    rel="stylesheet"
                />
            </Head>
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 font-['Inter']">
                {/* Static/Gently Animated Background Blobs (No Mouse Tracking) */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.03),transparent_50%)]"></div>
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-blue-500/10 dark:bg-blue-400/5 animate-pulse"
                            style={{
                                width: Math.random() * 400 + 100,
                                height: Math.random() * 400 + 100,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                filter: 'blur(60px)',
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: '8s'
                            }}
                        />
                    ))}
                </div>

                {/* Navigation */}
                <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
                    scrolled 
                        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]' 
                        : 'bg-transparent'
                }`}>
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-end items-center h-16 sm:h-20">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="group relative inline-flex items-center px-6 py-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <span className="relative z-10 flex items-center">
                                        Dashboard
                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="group relative inline-flex items-center px-6 py-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <span className="relative z-10 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Sign In
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="relative pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Hero Section */}
                        <div className="text-center mb-16 lg:mb-20">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 border border-blue-200/20 dark:border-blue-500/20 backdrop-blur-sm mb-8">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Enterprise-Grade Utility Management
                                </span>
                            </div>
                            
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Electricity Bill
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Management System
                                </span>
                            </h1>
                            
                            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                                Streamline your utility operations with our intelligent billing platform. 
                                <span className="block mt-2 text-lg text-slate-500 dark:text-slate-500">
                                    Real-time monitoring, automated calculations, and predictive analytics at your fingertips.
                                </span>
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center mt-10">
                                <Link
                                    href={login()}
                                    className="group relative inline-flex items-center px-8 py-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg shadow-2xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <span className="relative z-10 flex items-center">
                                        Get Started
                                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                                
                                <button className="group relative inline-flex items-center px-8 py-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-semibold text-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:-translate-y-1 shadow-xl">
                                    Watch Demo
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
                            {[
                                { label: 'Active Users', value: '10,000+', change: '+25.8%', icon: '👥' },
                                { label: 'Bills Processed', value: '2.5M', change: '+48.2%', icon: '📄' },
                                { label: 'Avg. Response', value: '1.2s', change: '-32.5%', icon: '⚡' },
                                { label: 'Uptime SLA', value: '99.99%', change: '+0.12%', icon: '🔒' },
                            ].map((stat, index) => (
                                <div key={index} className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                    <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">{stat.icon}</span>
                                            <span className={`text-sm font-medium ${
                                                stat.change.startsWith('+') ? 'text-green-600' : 'text-blue-600'
                                            }`}>{stat.change}</span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Feature Section */}
                        <div className="relative mb-20">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden">
                                <div className="grid lg:grid-cols-2">
                                    <div className="p-8 lg:p-12">
                                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                                            Complete Utility Management
                                        </h2>
                                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                                            Everything you need to manage electricity billing in one powerful platform.
                                        </p>

                                        <div className="space-y-4">
                                            {[
                                                { icon: '⚡', title: 'Real-time Monitoring', desc: 'Live consumption tracking with instant alerts' },
                                                { icon: '📊', title: 'Advanced Analytics', desc: 'Predictive insights and usage patterns' },
                                                { icon: '💳', title: 'Automated Billing', desc: 'Smart invoice generation and payment processing' },
                                                { icon: '📱', title: 'Multi-platform Access', desc: 'Web, mobile, and API integrations' },
                                            ].map((feature, index) => (
                                                <div
                                                    key={index}
                                                    className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                                                        activeFeature === index 
                                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 scale-[1.02] shadow-lg' 
                                                            : 'hover:bg-slate-50 dark:hover:bg-gray-700/50'
                                                    }`}
                                                    onMouseEnter={() => setActiveFeature(index)}
                                                >
                                                    <div className="flex items-start space-x-4">
                                                        <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                                                            {feature.icon}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                                                {feature.title}
                                                            </h3>
                                                            <p className="text-slate-500 dark:text-slate-400">
                                                                {feature.desc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {activeFeature === index && (
                                                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-2xl animate-progress"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-gray-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                                Seamlessly integrates with
                                            </p>
                                            <div className="flex flex-wrap gap-4">
                                                {['Stripe', 'PayPal', 'QuickBooks', 'SAP'].map((integration, index) => (
                                                    <span key={index} className="px-4 py-2 bg-slate-100 dark:bg-gray-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300">
                                                        {integration}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative bg-gradient-to-br from-blue-600/5 to-indigo-600/5 p-8 lg:p-12 overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex items-center space-x-2 mb-6">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">Dashboard Preview</span>
                                            </div>

                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl mb-6">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <p className="text-sm text-slate-500">Total Consumption</p>
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">2,847 kWh</p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                                                        +15.3%
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    {[
                                                        { label: 'Residential', value: 65, color: 'blue' },
                                                        { label: 'Commercial', value: 45, color: 'indigo' },
                                                        { label: 'Industrial', value: 85, color: 'purple' },
                                                    ].map((item, index) => (
                                                        <div key={index} className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                                                                <span className="font-medium text-slate-900 dark:text-white">{item.value}%</span>
                                                            </div>
                                                            <div className="h-2 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full bg-${item.color}-500 rounded-full transition-all duration-1000`}
                                                                    style={{ width: `${item.value}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                                                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h4>
                                                <div className="space-y-3">
                                                    {[
                                                        { action: 'Bill generated', time: '2 min ago', amount: '$245.30' },
                                                        { action: 'Payment received', time: '15 min ago', amount: '$567.80' },
                                                        { action: 'Meter reading', time: '1 hour ago', amount: '1,234 kWh' },
                                                    ].map((activity, index) => (
                                                        <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-gray-700 last:border-0">
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.action}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{activity.amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <footer className="mt-20 pt-8 border-t border-slate-200 dark:border-gray-800">
                            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                                © {new Date().getFullYear()} Electricity Bill Management System. All rights reserved.
                            </div>
                        </footer>
                    </div>
                </main>
            </div>

           
        </>
    );
}