import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HierarchyDropdowns from '@/components/hierarchy-dropdowns';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';

interface Props {
    circles: { id: number; name: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Subdivisions', href: '/admin/subdivisions' },
    { title: 'Create', href: '#' },
];

export default function Create({ circles }: Props) {
    const { data, setData, post, processing, errors } = useForm({ name: '', division_id: '' });
    const [hierarchy, setHierarchy] = useState({ circle_id: '', division_id: '', subdivision_id: '', section_id: '', village_id: '', feeder_id: '', dtr_id: '' });

    const handleHierarchy = (key: string, value: string) => {
        setHierarchy((prev) => ({ ...prev, [key]: value }));
        if (key === 'division_id') setData('division_id', value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/subdivisions');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Subdivision" />

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
                                    Create Subdivision
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Add a new subdivision to the hierarchy
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6 max-w-2xl">
                        {/* Hierarchy card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Hierarchy</h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Select Circle and Division</p>
                            </div>
                            <div className="p-6 sm:p-8">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
                                    <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-2"></span>
                                    Location
                                </h3>
                                <HierarchyDropdowns values={hierarchy} onChange={handleHierarchy} circles={circles} showLevels={['circle_id', 'division_id']} />
                                <InputError message={errors.division_id} className="mt-2 text-xs text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        {/* Details card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Details</h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Enter subdivision name</p>
                            </div>
                            <div className="p-6 sm:p-8">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
                                    <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-2"></span>
                                    Name
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Subdivision Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="h-11 rounded-xl border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="e.g. Sambalpur Subdivision"
                                    />
                                    <InputError message={errors.name} className="text-xs text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <Link
                                href="/admin/subdivisions"
                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="relative px-6 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {processing ? 'Creating...' : 'Create Subdivision'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
