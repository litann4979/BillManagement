import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface Subdivision {
    id: number;
    name: string;
    division: { id: number; name: string; circle: { id: number; name: string } | null } | null;
    sections_count: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Subdivisions', href: '/admin/subdivisions' },
];

export default function Index({ subdivisions }: { subdivisions: Subdivision[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (id: number) => {
        if (confirm('Delete this subdivision?')) router.delete(`/admin/subdivisions/${id}`);
    };

    const filtered = subdivisions.filter(
        (s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.division?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.division?.circle?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSections = subdivisions.reduce((s, sub) => s + sub.sections_count, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subdivisions" />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                        Subdivisions
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Manage subdivisions in the hierarchy
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/admin/subdivisions/create"
                                className="group relative inline-flex items-center px-4 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <span className="relative z-10 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Subdivision
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-gray-700">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{subdivisions.length}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Total Subdivisions</p>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-gray-700">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSections}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Total Sections</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="relative">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-gray-700">
                                <div className="relative w-full sm:w-96">
                                    <input
                                        type="text"
                                        placeholder="Search subdivisions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-10 pr-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Name</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Division</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Circle</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sections</th>
                                            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                        {filtered.map((s) => (
                                            <tr key={s.id} className="group hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-200">
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                                            {s.name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{s.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{s.division?.name ?? '—'}</td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{s.division?.circle?.name ?? '—'}</td>
                                                <td className="p-4">
                                                    <code className="px-2 py-1 bg-slate-100 dark:bg-gray-900 rounded-lg text-xs font-mono text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-gray-700">
                                                        {s.sections_count}
                                                    </code>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <Link href={`/admin/subdivisions/${s.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Edit">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Delete">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filtered.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center">
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No subdivisions found</p>
                                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Showing <span className="font-medium">{filtered.length}</span> of{' '}
                                    <span className="font-medium">{subdivisions.length}</span> subdivisions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
