import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Bill Collectors', href: '/admin/billcollectors' },
    { title: 'Create', href: '#' },
];

export default function Create() {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        user_unique_id: '',
        aadhaar_no: '',
        date_of_birth: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/billcollectors');
    };

    const generatePassword = () => {
        if (data.user_unique_id && data.date_of_birth) {
            const idPart = data.user_unique_id.slice(0, 4);
            const dobPart = data.date_of_birth.replace(/-/g, '').slice(-4);
            setData('password', `${idPart}${dobPart}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Bill Collector" />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Create Bill Collector
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Add a new bill collector to manage electricity bill collections
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
                                            Enter the details of the new bill collector
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

                                            {/* Password */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Password
                                                    </Label>
                                                    <button
                                                        type="button"
                                                        onClick={generatePassword}
                                                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                                                    >
                                                        Auto-generate
                                                    </button>
                                                </div>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                    <div className="relative">
                                                        <Input
                                                            id="password"
                                                            type={passwordVisible ? "text" : "password"}
                                                            value={data.password}
                                                            onChange={(e) => setData('password', e.target.value)}
                                                            className="w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400"
                                                            placeholder="••••••••"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                                        >
                                                            {passwordVisible ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                                    Leave blank to auto-generate (Default: First 4 chars of ID + Last 4 of DOB)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="pt-6 border-t border-slate-200 dark:border-gray-700">
                                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                                            <button
                                                type="button"
                                                onClick={() => reset()}
                                                className="px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200"
                                            >
                                                Clear Form
                                            </button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="relative px-6 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                            >
                                                <span className="relative z-10 flex items-center">
                                                    {processing ? (
                                                        <>
                                                            <Spinner className="w-4 h-4 mr-2" />
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            Create Bill Collector
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