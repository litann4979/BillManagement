import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface PageProps {
    billCollectors: any[];
    totalCollectors: number;
    activeCollectors: number;
    inactiveCollectors: number;
    totalCollections: number;
}

function formatCurrency(amount: number): string {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toFixed(0);
}

export default function Index({ billCollectors, totalCollectors, activeCollectors, inactiveCollectors, totalCollections }: PageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Bill Collectors', href: '/admin/billcollectors' },
    ];

    const toggleRowSelection = (id: number) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const toggleAllRows = () => {
        if (selectedRows.length === billCollectors.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(billCollectors.map(c => c.id));
        }
    };

    const filteredCollectors = billCollectors.filter(collector => {
        const matchesSearch = 
            collector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collector.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (collector.details?.user_unique_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        if (selectedStatus === 'all') return matchesSearch;
        if (selectedStatus === 'active') return matchesSearch && collector.is_active;
        if (selectedStatus === 'inactive') return matchesSearch && !collector.is_active;
        return matchesSearch;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bill Collectors" />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                        Bill Collectors
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Manage and monitor all bill collectors in the system
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/admin/billcollectors/create"
                                className="group relative inline-flex items-center px-4 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <span className="relative z-10 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Collector
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCollectors}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Total Collectors</p>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeCollectors}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Active Collectors</p>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{inactiveCollectors}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Inactive Collectors</p>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{'\u20B9'} {formatCurrency(totalCollections)}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Total Collections</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="relative">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            {/* Table Header with Search and Filters */}
                            <div className="p-6 border-b border-slate-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    {/* Search */}
                                    <div className="relative w-full sm:w-96">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search collectors..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full h-10 pl-10 pr-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400"
                                            />
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Filters and Bulk Actions */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="h-10 px-3 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white text-sm"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>

                                        {selectedRows.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                                    {selectedRows.length} selected
                                                </span>
                                                <button className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                                    Bulk Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                                            <th className="p-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.length === billCollectors.length && billCollectors.length > 0}
                                                    onChange={toggleAllRows}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                                                />
                                            </th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Collector
                                            </th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Unique ID
                                            </th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Email
                                            </th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Status
                                            </th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Collections
                                            </th>
                                            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                        {filteredCollectors.map((user) => (
                                            <tr 
                                                key={user.id} 
                                                className="group hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                                            >
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(user.id)}
                                                        onChange={() => toggleRowSelection(user.id)}
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">
                                                                {user.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                ID: #{user.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <code className="px-2 py-1 bg-slate-100 dark:bg-gray-900 rounded-lg text-xs font-mono text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-gray-700">
                                                        {user.details?.user_unique_id || 'N/A'}
                                                    </code>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <p className="text-slate-600 dark:text-slate-300 text-xs flex items-center">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            {user.email}
                                                        </p>
                                                        {user.details?.phone && (
                                                            <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                                {user.details.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        user.is_active 
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                                            : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                            user.is_active ? 'bg-green-500' : 'bg-slate-400'
                                                        }`}></span>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {'\u20B9'} {Number(user.total_collection || 0).toLocaleString('en-IN')}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {user.bill_count || 0} bills
                                                    </p>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end space-x-3">
                                                        <button
                                                            onClick={() => {
                                                                setTogglingId(user.id);
                                                                router.patch(
                                                                    `/admin/billcollectors/${user.id}/toggle-status`,
                                                                    {},
                                                                    {
                                                                        preserveScroll: true,
                                                                        onFinish: () => setTogglingId(null),
                                                                    }
                                                                );
                                                            }}
                                                            disabled={togglingId === user.id}
                                                            title={user.is_active ? 'Deactivate' : 'Activate'}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                                user.is_active
                                                                    ? 'bg-green-500 focus:ring-green-500'
                                                                    : 'bg-slate-300 dark:bg-gray-600 focus:ring-slate-400'
                                                            } ${togglingId === user.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                                                    user.is_active ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                            />
                                                        </button>
                                                        <Link
                                                            href={`/admin/billcollectors/${user.id}/edit`}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredCollectors.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg className="w-16 h-16 text-slate-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium">No collectors found</p>
                                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filter criteria</p>
                                                        <Link
                                                            href="/admin/billcollectors/create"
                                                            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            Add New Collector
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table Footer */}
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Showing <span className="font-medium">{filteredCollectors.length}</span> of{' '}
                                        <span className="font-medium">{billCollectors.length}</span> collectors
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-50 transition-colors" disabled>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Page 1 of 1</span>
                                        <button className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-50 transition-colors" disabled>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}