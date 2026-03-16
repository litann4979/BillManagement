import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categories', href: '/admin/categories' },
    { title: 'Create', href: '#' },
];

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/categories');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Create Category
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Add a new consumer category
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Category Information</h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Enter the details of the new category</p>
                            </div>

                            <div className="p-6 sm:p-8">
                                <form onSubmit={submit} className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
                                            <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-2"></span>
                                            Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Category Name <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="relative w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400"
                                                        placeholder="e.g. Domestic, Commercial"
                                                    />
                                                </div>
                                                <InputError message={errors.name} className="text-xs text-red-600 dark:text-red-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-200 dark:border-gray-700">
                                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                                            <Link
                                                href="/admin/categories"
                                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200"
                                            >
                                                Cancel
                                            </Link>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="relative px-6 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                            >
                                                {processing ? 'Creating...' : 'Create Category'}
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
