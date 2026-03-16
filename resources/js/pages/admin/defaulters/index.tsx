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
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConsumerFlag {
    id: number;
    flag_type: string;
    remarks: string | null;
    created_at: string;
}

interface DefaulterItem {
    id: number;
    consumer_id: number;
    months_due: number;
    total_arrear: string;
    last_bill_period: string | null;
    consumer: {
        id: number;
        scno: string;
        name: string;
        phone: string | null;
        village: { id: number; name: string } | null;
        dtr: { id: number; dtr_name: string } | null;
        flags: ConsumerFlag[];
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    defaulters: {
        data: DefaulterItem[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    villages: { id: number; name: string }[];
    dtrs: { id: number; dtr_name: string; dtr_code: string }[];
    filters: {
        village_id?: string;
        dtr_id?: string;
        months_due?: string;
        search?: string;
    };
    stats: {
        totalDefaulters: number;
        totalArrearAmount: number;
        threeMonthDefaulters: number;
        flaggedConsumers: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Defaulters', href: '/admin/defaulters' },
];

const flagTypeLabels: Record<string, string> = {
    chronic_defaulter: 'Chronic Defaulter',
    meter_tampering: 'Meter Tampering',
    legal_case: 'Legal Case',
    suspicious_activity: 'Suspicious Activity',
};

export default function DefaultersIndex({ defaulters, villages, dtrs, filters, stats }: Props) {
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [flagModalOpen, setFlagModalOpen] = useState(false);
    const [flagConsumerId, setFlagConsumerId] = useState<number | null>(null);
    const [flagType, setFlagType] = useState('');
    const [flagRemarks, setFlagRemarks] = useState('');
    const [flagSubmitting, setFlagSubmitting] = useState(false);

    const [values, setValues] = useState({
        village_id: filters.village_id || '',
        dtr_id: filters.dtr_id || '',
        months_due: filters.months_due || '',
        search: filters.search || '',
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const applyFilters = () => {
        router.get('/admin/defaulters', pickBy(values), { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        const empty = { village_id: '', dtr_id: '', months_due: '', search: '' };
        setValues(empty);
        router.get('/admin/defaulters');
    };

    const openFlagModal = (consumerId: number) => {
        setFlagConsumerId(consumerId);
        setFlagType('');
        setFlagRemarks('');
        setFlagModalOpen(true);
    };

    const submitFlag = () => {
        if (!flagConsumerId || !flagType) return;
        setFlagSubmitting(true);
        router.post('/admin/defaulters/flag', {
            consumer_id: flagConsumerId,
            flag_type: flagType,
            remarks: flagRemarks,
        }, {
            preserveState: true,
            onSuccess: () => {
                setFlagModalOpen(false);
                setFlagSubmitting(false);
            },
            onError: () => setFlagSubmitting(false),
        });
    };

    const selectClass = 'h-10 px-3 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white text-sm w-full';

    const statCards = [
        { label: 'Total Defaulters', value: stats.totalDefaulters.toLocaleString(), icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z', gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/30' },
        { label: 'Total Arrear Amount', value: `₹ ${Number(stats.totalArrearAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/30' },
        { label: '3+ Month Defaulters', value: stats.threeMonthDefaulters.toLocaleString(), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/30' },
        { label: 'Flagged Consumers', value: stats.flaggedConsumers.toLocaleString(), icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9', gradient: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-600/30' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Defaulters Management" />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Defaulters Management
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Monitor and manage consumers with unpaid bills
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
                                        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
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
                                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-red-600/5 to-rose-600/5 border-b border-slate-200 dark:border-gray-700"
                            >
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        <div className="w-full sm:w-36">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Months Due</label>
                                            <select name="months_due" value={values.months_due} onChange={handleChange} className={selectClass}>
                                                <option value="">All</option>
                                                <option value="1">1 Month</option>
                                                <option value="2">2 Months</option>
                                                <option value="3">3 Months</option>
                                                <option value="4+">4+ Months</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={applyFilters} className="h-10 px-5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium text-sm shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:-translate-y-0.5">
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

                    {/* Defaulters Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700 bg-gradient-to-r from-red-600/5 to-rose-600/5">
                            <h2 className="text-base font-semibold text-slate-800 dark:text-white">Defaulter List</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-gray-900 dark:to-gray-800">
                                        <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">SCNO</th>
                                        <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Consumer Name</th>
                                        <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Village</th>
                                        <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">DTR</th>
                                        <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Months Due</th>
                                        <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount Due</th>
                                        <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Last Bill Period</th>
                                        <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Flag</th>
                                        <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                    {defaulters.data.map((item) => {
                                        const flag = item.consumer?.flags?.[0] || null;
                                        return (
                                            <tr key={item.id} className="group hover:bg-red-50/30 dark:hover:bg-gray-700/50 transition-all duration-200">
                                                <td className="p-4">
                                                    <code className="px-2 py-1 bg-slate-100 dark:bg-gray-900 rounded-lg text-xs font-mono text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-gray-700">
                                                        {item.consumer?.scno || 'N/A'}
                                                    </code>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center text-white text-xs font-semibold">
                                                            {item.consumer?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{item.consumer?.name || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{item.consumer?.village?.name || '—'}</td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{item.consumer?.dtr?.dtr_name || '—'}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-full text-xs font-bold ${
                                                        item.months_due >= 3
                                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                    }`}>
                                                        {item.months_due}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-semibold text-red-600 dark:text-red-400">
                                                    ₹ {Number(item.total_arrear).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{item.last_bill_period?.slice(0, 10) || '—'}</td>
                                                <td className="p-4 text-center">
                                                    {flag ? (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 cursor-help">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                                        </svg>
                                                                        Flagged
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top" className="max-w-xs">
                                                                    <p className="font-semibold text-sm">{flagTypeLabels[flag.flag_type] || flag.flag_type}</p>
                                                                    {flag.remarks && <p className="text-xs text-slate-400 mt-1">{flag.remarks}</p>}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-gray-600">—</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button
                                                            onClick={() => openFlagModal(item.consumer_id)}
                                                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                                                            title="Flag Consumer"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                                            </svg>
                                                            Flag
                                                        </button>
                                                        <Link
                                                            href={`/admin/consumers/${item.consumer_id}`}
                                                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {defaulters.data.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="w-16 h-16 text-slate-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No defaulters found</p>
                                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">All consumers are up to date or adjust your filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-700">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Page <span className="font-medium">{defaulters.current_page}</span> of{' '}
                                    <span className="font-medium">{defaulters.last_page}</span>
                                </p>
                                {defaulters.last_page > 1 && (
                                    <div className="flex flex-wrap gap-1">
                                        {defaulters.links.map((link, i) => (
                                            <Link
                                                key={i}
                                                href={link.url ?? '#'}
                                                preserveScroll
                                                className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-200 ${
                                                    link.active
                                                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-500 shadow-sm'
                                                        : link.url
                                                            ? 'bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-gray-700 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400'
                                                            : 'text-slate-300 dark:text-slate-600 border-slate-100 dark:border-gray-800 cursor-default'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flag Consumer Modal */}
            <Dialog open={flagModalOpen} onOpenChange={setFlagModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                            Flag Consumer
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Flag Type <span className="text-red-500">*</span>
                            </label>
                            <select value={flagType} onChange={(e) => setFlagType(e.target.value)} className={selectClass}>
                                <option value="">-- Select Flag Type --</option>
                                <option value="chronic_defaulter">Chronic Defaulter</option>
                                <option value="meter_tampering">Meter Tampering</option>
                                <option value="legal_case">Legal Case</option>
                                <option value="suspicious_activity">Suspicious Activity</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Remarks</label>
                            <textarea
                                value={flagRemarks}
                                onChange={(e) => setFlagRemarks(e.target.value)}
                                rows={3}
                                placeholder="Optional remarks..."
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setFlagModalOpen(false)}
                            className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitFlag}
                            disabled={!flagType || flagSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {flagSubmitting ? 'Flagging...' : 'Flag Consumer'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
