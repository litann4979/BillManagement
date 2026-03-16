import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function Edit({ user }: { user: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Bill Collectors', href: '/admin/billcollectors' },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        user_unique_id: user.details?.user_unique_id || '',
        aadhaar_no: user.details?.aadhaar_no || '',
        date_of_birth: user.details?.date_of_birth || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/billcollectors/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Bill Collector" />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Edit Bill Collector
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Update information for <span className="font-medium text-blue-600 dark:text-blue-400">{user.name}</span>
                                </p>
                            </div>
                        </div>

                     
                    </div>

                    {/* Main Form Card */}
                    <div className="relative">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            {/* Card Header with Gradient */}
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                                            Collector Information
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Edit the details of the bill collector
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                                        <span className="flex items-center">
                                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                            Required
                                        </span>
                                        <span className="flex items-center">
                                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                                            Optional
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Form Body */}
                            <div className="p-6 sm:p-8">
                                <form onSubmit={submit} className="space-y-6">
                                    {/* Personal Information Section */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
                                            <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-2"></span>
                                            Personal Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            {/* Full Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Full Name <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                    <div className="relative">
                                                        <Input
                                                            id="name"
                                                            type="text"
                                                            value={data.name}
                                                            onChange={(e) => setData('name', e.target.value)}
                                                            className="w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400"
                                                            placeholder="John Doe"
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <InputError message={errors.name} className="text-xs text-red-600 dark:text-red-400" />
                                            </div>

                                            {/* Email Address */}
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Email Address <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                    <div className="relative">
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={data.email}
                                                            onChange={(e) => setData('email', e.target.value)}
                                                            className="w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400"
                                                            placeholder="john@example.com"
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <InputError message={errors.email} className="text-xs text-red-600 dark:text-red-400" />
                                            </div>

                                            {/* Date of Birth */}
                                            <div className="space-y-2">
                                                <Label htmlFor="date_of_birth" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Date of Birth
                                                </Label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                    <div className="relative">
                                                        <Input
                                                            id="date_of_birth"
                                                            type="date"
                                                            value={data.date_of_birth}
                                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                                            className="w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <InputError message={errors.date_of_birth} className="text-xs text-red-600 dark:text-red-400" />
                                            </div>

                                            {/* Aadhaar Number */}
                                            <div className="space-y-2">
                                                <Label htmlFor="aadhaar_no" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Aadhaar Number
                                                </Label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                    <div className="relative">
                                                        <Input
                                                            id="aadhaar_no"
                                                            type="text"
                                                            maxLength={12}
                                                            value={data.aadhaar_no}
                                                            onChange={(e) => setData('aadhaar_no', e.target.value.replace(/\D/g, ''))}
                                                            className="w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400"
                                                            placeholder="1234 5678 9012"
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Information Section */}
                                    <div className="pt-4">
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
                                            <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-2"></span>
                                            Account Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            {/* User Unique ID */}
                                            <div className="space-y-2">
                                                <Label htmlFor="user_unique_id" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    User Unique ID <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                    <div className="relative">
                                                        <Input
                                                            id="user_unique_id"
                                                            type="text"
                                                            value={data.user_unique_id}
                                                            onChange={(e) => setData('user_unique_id', e.target.value)}
                                                            className="w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400"
                                                            placeholder="BC001234"
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <InputError message={errors.user_unique_id} className="text-xs text-red-600 dark:text-red-400" />
                                            </div>

                                            {/* Password Change Link */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Password
                                                </Label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                    <div className="relative">
                                                        <div className="w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl flex items-center justify-between">
                                                            <span className="text-slate-500 dark:text-slate-400 text-sm">••••••••</span>
                                                            <a 
                                                                href={`/admin/billcollectors/${user.id}/password/reset`}
                                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                                                            >
                                                                Change Password
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                                    Click "Change Password" to reset collector's password
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="pt-4">
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
                                            <span className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-2"></span>
                                            Recent Activity
                                        </h3>
                                        <div className="bg-slate-50 dark:bg-gray-900/50 rounded-xl p-4">
                                            <div className="space-y-3">
                                                {[
                                                    { action: 'Bill collection', amount: '₹ 2,500', time: '2 hours ago', status: 'completed' },
                                                    { action: 'Meter reading', amount: '345 kWh', time: 'Yesterday', status: 'completed' },
                                                    { action: 'Payment received', amount: '₹ 1,200', time: '2 days ago', status: 'completed' },
                                                ].map((activity, index) => (
                                                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-gray-700 last:border-0">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.action}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{activity.amount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="pt-6 border-t border-slate-200 dark:border-gray-700">
                                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                                            <a
                                                href="/admin/billcollectors"
                                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200"
                                            >
                                                Cancel
                                            </a>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="relative px-6 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                            >
                                                <span className="relative z-10 flex items-center">
                                                    {processing ? (
                                                        <>
                                                            <Spinner className="w-4 h-4 mr-2" />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            Update Details
                                                        </>
                                                    )}
                                                </span>
                                                {!processing && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}