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
    { title: 'DTRs', href: '/admin/dtrs' },
    { title: 'Create', href: '#' },
];

export default function Create({ circles }: Props) {
    const { data, setData, post, processing, errors } = useForm({ dtr_name: '', dtr_code: '', capacity: '', feeder_id: '' });
    const [hierarchy, setHierarchy] = useState({ circle_id: '', division_id: '', subdivision_id: '', section_id: '', village_id: '', feeder_id: '', dtr_id: '' });

    const handleHierarchy = (key: string, value: string) => {
        setHierarchy((prev) => ({ ...prev, [key]: value }));
        if (key === 'feeder_id') setData('feeder_id', value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/dtrs');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create DTR" />

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
                                    Create DTR
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Add a new distribution transformer
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Hierarchy Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Hierarchy</h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Select the feeder for this DTR</p>
                            </div>
                            <div className="p-6 sm:p-8">
                                <HierarchyDropdowns
                                    values={hierarchy}
                                    onChange={handleHierarchy}
                                    circles={circles}
                                    showLevels={['circle_id', 'division_id', 'subdivision_id', 'section_id', 'feeder_id']}
                                />
                                <InputError message={errors.feeder_id} className="mt-2 text-xs text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Details</h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">DTR name, code and capacity</p>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="dtr_name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            DTR Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="dtr_name"
                                            type="text"
                                            value={data.dtr_name}
                                            onChange={(e) => setData('dtr_name', e.target.value)}
                                            className="w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                            placeholder="e.g. DTR-001"
                                        />
                                        <InputError message={errors.dtr_name} className="text-xs text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dtr_code" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            DTR Code
                                        </Label>
                                        <Input
                                            id="dtr_code"
                                            type="text"
                                            value={data.dtr_code}
                                            onChange={(e) => setData('dtr_code', e.target.value)}
                                            className="w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                            placeholder="e.g. DTR001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Capacity
                                        </Label>
                                        <Input
                                            id="capacity"
                                            type="text"
                                            value={data.capacity}
                                            onChange={(e) => setData('capacity', e.target.value)}
                                            className="w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                            placeholder="e.g. 100 kVA"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <Link
                                href="/admin/dtrs"
                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="relative px-6 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {processing ? 'Creating...' : 'Create DTR'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
