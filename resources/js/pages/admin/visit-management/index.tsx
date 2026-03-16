import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { pickBy } from 'lodash';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface BillCollector {
    id: number;
    name: string;
}

interface VisitLogDetail {
    id: number;
    consumer_name: string;
    scno: string;
    phone: string | null;
    village: string;
    dtr: string;
    visit_result: string | null;
    visit_date: string | null;
    remarks: string | null;
}

interface VisitPlanConsumer {
    id: number;
    consumer: {
        id: number;
        scno: string;
        name: string;
        phone: string | null;
        village: { id: number; name: string } | null;
        dtr: { id: number; dtr_name: string } | null;
    };
}

interface VisitPlan {
    id: number;
    plan_date: string;
    visit_time: string | null;
    status: string;
    collector: BillCollector | null;
    consumers: VisitPlanConsumer[];
    consumers_count: number;
    visit_logs_count: number;
}

interface Promise {
    id: number;
    promised_amount: string;
    promise_date: string | null;
    remarks: string | null;
    status: string;
    consumer: { id: number; scno: string; name: string } | null;
    creator: { id: number; name: string } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    visitPlans: {
        data: VisitPlan[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    promises: {
        data: Promise[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    visitLogsByPlan: Record<number, VisitLogDetail[]>;
    billCollectors: BillCollector[];
    villages: { id: number; name: string }[];
    dtrs: { id: number; dtr_name: string; dtr_code: string }[];
    filters: {
        billcollector_id?: string;
        date?: string;
        village_id?: string;
        dtr_id?: string;
        search?: string;
    };
    stats: {
        totalPlans: number;
        completedPlans: number;
        pendingPromises: number;
        fulfilledPromises: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Visit Management', href: '/admin/visit-management' },
];

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        planned: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        fulfilled: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        broken: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return map[status] || 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300';
};

export default function VisitManagement({ visitPlans, promises, visitLogsByPlan, billCollectors, villages, dtrs, filters, stats }: Props) {
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [detailPlan, setDetailPlan] = useState<VisitPlan | null>(null);
    const [activeTab, setActiveTab] = useState<'plans' | 'promises'>('plans');

    const [values, setValues] = useState({
        billcollector_id: filters.billcollector_id || '',
        date: filters.date || '',
        village_id: filters.village_id || '',
        dtr_id: filters.dtr_id || '',
        search: filters.search || '',
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const applyFilters = () => {
        router.get('/admin/visit-management', pickBy(values), { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        const empty = { billcollector_id: '', date: '', village_id: '', dtr_id: '', search: '' };
        setValues(empty);
        router.get('/admin/visit-management');
    };

    const selectClass = 'h-10 px-3 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white text-sm w-full';

    const statCards = [
        { label: 'Total Visit Plans', value: stats.totalPlans, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', gradient: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-600/30' },
        { label: 'Completed Plans', value: stats.completedPlans, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/30' },
        { label: 'Pending Promises', value: stats.pendingPromises, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/30' },
        { label: 'Fulfilled Promises', value: stats.fulfilledPromises, icon: 'M5 13l4 4L19 7', gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/30' },
    ];

    const renderPagination = (paginationData: { links: PaginationLink[]; current_page: number; last_page: number }) => (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Page <span className="font-medium">{paginationData.current_page}</span> of{' '}
                    <span className="font-medium">{paginationData.last_page}</span>
                </p>
                {paginationData.last_page > 1 && (
                    <div className="flex flex-wrap gap-1">
                        {paginationData.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-200 ${
                                    link.active
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-sm'
                                        : link.url
                                            ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400'
                                            : 'text-slate-300 dark:text-slate-600 border-slate-100 dark:border-gray-800 cursor-default'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Visit Management" />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Visit Management
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Monitor visit plans, logs and payment promises
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {statCards.map((card, i) => (
                            <div key={i} className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{card.value.toLocaleString()}</p>
                                    </div>
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r ${card.gradient} text-white shadow-lg ${card.shadow}`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filter Card */}
                    <div className="mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <button
                                onClick={() => setFiltersOpen(!filtersOpen)}
                                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700"
                            >
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filters</span>
                                </div>
                                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {filtersOpen && (
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-4 items-end">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Search (Name / SCNO)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="search"
                                                    value={values.search}
                                                    onChange={handleChange}
                                                    placeholder="Type to search..."
                                                    className="w-full h-10 pl-10 pr-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                                />
                                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-48">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Bill Collector</label>
                                            <select name="billcollector_id" value={values.billcollector_id} onChange={handleChange} className={selectClass}>
                                                <option value="">All Collectors</option>
                                                {billCollectors.map(bc => <option key={bc.id} value={bc.id}>{bc.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-full sm:w-44">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
                                            <input type="date" name="date" value={values.date} onChange={handleChange} className={selectClass} />
                                        </div>
                                        <div className="w-full sm:w-44">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Village</label>
                                            <select name="village_id" value={values.village_id} onChange={handleChange} className={selectClass}>
                                                <option value="">All Villages</option>
                                                {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-full sm:w-44">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">DTR</label>
                                            <select name="dtr_id" value={values.dtr_id} onChange={handleChange} className={selectClass}>
                                                <option value="">All DTRs</option>
                                                {dtrs.map(d => <option key={d.id} value={d.id}>{d.dtr_name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={applyFilters} className="h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5">
                                                Filter
                                            </button>
                                            <button onClick={resetFilters} className="h-10 px-5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200">
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="mb-6 flex gap-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 p-1.5 w-fit">
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'plans' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-700'}`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                Visit Plans
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('promises')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'promises' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-700'}`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Promise to Pay
                            </span>
                        </button>
                    </div>

                    {/* Visit Plans Table */}
                    {activeTab === 'plans' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700 bg-gradient-to-r from-blue-600/5 to-indigo-600/5">
                                <h2 className="text-base font-semibold text-slate-800 dark:text-white">Visit Plan Overview</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan Date</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bill Collector</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Visit Time</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                                            <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assigned</th>
                                            <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed</th>
                                            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                        {visitPlans.data.map((plan) => (
                                            <tr key={plan.id} className="group hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-200">
                                                <td className="p-4 font-medium text-slate-900 dark:text-white">{plan.plan_date?.slice(0, 10)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                                                            {plan.collector?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <span className="text-slate-700 dark:text-slate-300">{plan.collector?.name || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{plan.visit_time || '—'}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(plan.status)}`}>
                                                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                                        {plan.consumers_count}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                        {plan.visit_logs_count}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => setDetailPlan(plan)}
                                                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {visitPlans.data.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg className="w-16 h-16 text-slate-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium">No visit plans found</p>
                                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {renderPagination(visitPlans)}
                        </div>
                    )}

                    {/* Promise to Pay Table */}
                    {activeTab === 'promises' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700 bg-gradient-to-r from-blue-600/5 to-indigo-600/5">
                                <h2 className="text-base font-semibold text-slate-800 dark:text-white">Promise to Pay</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Consumer</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">SCNO</th>
                                            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Promised Amount</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Promise Date</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Collector</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                        {promises.data.map((p) => (
                                            <tr key={p.id} className="group hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-200">
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                                            {p.consumer?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{p.consumer?.name || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <code className="px-2 py-1 bg-slate-100 dark:bg-gray-900 rounded-lg text-xs font-mono text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-gray-700">
                                                        {p.consumer?.scno || 'N/A'}
                                                    </code>
                                                </td>
                                                <td className="p-4 text-right font-semibold text-slate-900 dark:text-white">
                                                    ₹ {Number(p.promised_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{p.promise_date?.slice(0, 10) || '—'}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">{p.creator?.name || '—'}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(p.status)}`}>
                                                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{p.remarks || '—'}</td>
                                            </tr>
                                        ))}
                                        {promises.data.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg className="w-16 h-16 text-slate-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium">No promises found</p>
                                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {renderPagination(promises)}
                        </div>
                    )}
                </div>
            </div>

            {/* Visit Plan Detail Modal */}
            <Dialog open={!!detailPlan} onOpenChange={() => setDetailPlan(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Visit Plan Details
                        </DialogTitle>
                    </DialogHeader>
                    {detailPlan && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-gray-900 rounded-xl">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Date</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{detailPlan.plan_date?.slice(0, 10)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Collector</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{detailPlan.collector?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Time</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{detailPlan.visit_time || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${statusBadge(detailPlan.status)}`}>
                                        {detailPlan.status.charAt(0).toUpperCase() + detailPlan.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Assigned Consumers */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Assigned Consumers ({detailPlan.consumers?.length || 0})</h3>
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-gray-900">
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">Name</th>
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">SCNO</th>
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">Phone</th>
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">Village</th>
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">DTR</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                            {detailPlan.consumers?.map((vpc) => (
                                                <tr key={vpc.id} className="hover:bg-slate-50 dark:hover:bg-gray-800">
                                                    <td className="p-3 font-medium text-slate-900 dark:text-white">{vpc.consumer?.name || 'N/A'}</td>
                                                    <td className="p-3"><code className="text-xs text-blue-600 dark:text-blue-400">{vpc.consumer?.scno || 'N/A'}</code></td>
                                                    <td className="p-3 text-slate-500">{vpc.consumer?.phone || '—'}</td>
                                                    <td className="p-3 text-slate-500">{vpc.consumer?.village?.name || '—'}</td>
                                                    <td className="p-3 text-slate-500">{vpc.consumer?.dtr?.dtr_name || '—'}</td>
                                                </tr>
                                            ))}
                                            {(!detailPlan.consumers || detailPlan.consumers.length === 0) && (
                                                <tr><td colSpan={5} className="p-6 text-center text-slate-400">No consumers assigned</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Visit Logs */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Visit Logs ({visitLogsByPlan[detailPlan.id]?.length || 0})</h3>
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-gray-900">
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">Consumer</th>
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">SCNO</th>
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">Village</th>
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">DTR</th>
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">Visit Date</th>
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">Result</th>
                                                <th className="p-3 text-left text-xs font-semibold text-slate-500">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                            {(visitLogsByPlan[detailPlan.id] || []).map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-gray-800">
                                                    <td className="p-3 font-medium text-slate-900 dark:text-white">{log.consumer_name}</td>
                                                    <td className="p-3"><code className="text-xs text-blue-600 dark:text-blue-400">{log.scno}</code></td>
                                                    <td className="p-3 text-slate-500">{log.village}</td>
                                                    <td className="p-3 text-slate-500">{log.dtr}</td>
                                                    <td className="p-3 text-slate-500">{log.visit_date || '—'}</td>
                                                    <td className="p-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            log.visit_result === 'Payment collected' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            log.visit_result === 'Consumer not available' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-300'
                                                        }`}>
                                                            {log.visit_result || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-slate-500 max-w-[150px] truncate">{log.remarks || '—'}</td>
                                                </tr>
                                            ))}
                                            {(!visitLogsByPlan[detailPlan.id] || visitLogsByPlan[detailPlan.id].length === 0) && (
                                                <tr><td colSpan={7} className="p-6 text-center text-slate-400">No visit logs recorded</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
