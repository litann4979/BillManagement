import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HierarchyDropdowns from '@/components/hierarchy-dropdowns';
import type { BreadcrumbItem } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { pickBy } from 'lodash';

interface Consumer {
    id: number;
    scno: string;
    name: string;
    phone: string | null;
    billcollector: { id: number; name: string } | null;
    section_relation: { id: number; name: string } | null;
    village: { id: number; name: string } | null;
    feeder: { id: number; name: string } | null;
    dtr: { id: number; dtr_name: string } | null;
    category_relation: { id: number; name: string } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface BillCollector {
    id: number;
    name: string;
}

interface ActiveImport {
    id: number;
    total_rows: number;
    processed_rows: number;
    progress_percentage: number;
    status: string;
}

interface Props {
    consumers: {
        data: Consumer[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    billCollectors: BillCollector[];
    circles: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    filters: {
        search?: string;
        billcollector_id?: string;
        category_id?: string;
        circle_id?: string;
        division_id?: string;
        subdivision_id?: string;
        section_id?: string;
    };
    activeImport: ActiveImport | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Consumers', href: '/admin/consumers' },
];

export default function Index({ consumers, billCollectors, circles, categories, filters, activeImport }: Props) {
    const [importOpen, setImportOpen] = useState(false);
    const [billcollectorId, setBillcollectorId] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(true);

    const [values, setValues] = useState({
        search: filters.search || '',
        billcollector_id: filters.billcollector_id || '',
        category_id: filters.category_id || '',
        circle_id: filters.circle_id || '',
        division_id: filters.division_id || '',
        subdivision_id: filters.subdivision_id || '',
        section_id: filters.section_id || '',
    });

    const [hierarchy, setHierarchy] = useState({
        circle_id: filters.circle_id || '',
        division_id: filters.division_id || '',
        subdivision_id: filters.subdivision_id || '',
        section_id: filters.section_id || '',
        village_id: '',
        feeder_id: '',
        dtr_id: '',
    });

    const handleHierarchy = (key: string, value: string) => {
        setHierarchy((prev) => ({ ...prev, [key]: value }));
        if (['circle_id', 'division_id', 'subdivision_id', 'section_id'].includes(key)) {
            setValues((prev) => ({ ...prev, [key]: value }));
        }
    };

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const key = e.target.name;
        const value = e.target.value;
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    const applyFilters = () => {
        router.get('/admin/consumers', pickBy(values), {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const empty = { search: '', billcollector_id: '', category_id: '', circle_id: '', division_id: '', subdivision_id: '', section_id: '' };
        setValues(empty);
        setHierarchy({ circle_id: '', division_id: '', subdivision_id: '', section_id: '', village_id: '', feeder_id: '', dtr_id: '' });
        router.get('/admin/consumers');
    };

    const importForm = useForm<{ file: File | null }>({ file: null });

    const [importJobId, setImportJobId] = useState<number | null>(activeImport?.id ?? null);
    const [importProgress, setImportProgress] = useState({
        total_rows: activeImport?.total_rows ?? 0,
        processed_rows: activeImport?.processed_rows ?? 0,
        progress_percentage: activeImport?.progress_percentage ?? 0,
        status: activeImport?.status ?? '',
        error_message: null as string | null,
    });
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (activeImport && activeImport.id !== importJobId) {
            setImportJobId(activeImport.id);
            setImportProgress({
                total_rows: activeImport.total_rows,
                processed_rows: activeImport.processed_rows,
                progress_percentage: activeImport.progress_percentage,
                status: activeImport.status,
                error_message: null,
            });
        }
    }, [activeImport]);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    useEffect(() => {
        if (!importJobId) return;
        if (importProgress.status === 'completed' || importProgress.status === 'failed') return;

        const poll = () => {
            fetch(`/admin/import-jobs/${importJobId}`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            })
                .then((res) => res.json())
                .then((data) => {
                    setImportProgress({
                        total_rows: data.total_rows,
                        processed_rows: data.processed_rows,
                        progress_percentage: data.progress_percentage,
                        status: data.status,
                        error_message: data.error_message,
                    });

                    if (data.status === 'completed' || data.status === 'failed') {
                        stopPolling();
                        if (data.status === 'completed') {
                            setTimeout(() => {
                                setImportJobId(null);
                                setImportProgress({ total_rows: 0, processed_rows: 0, progress_percentage: 0, status: '', error_message: null });
                                router.reload();
                            }, 2500);
                        }
                    }
                })
                .catch(() => {});
        };

        poll();
        pollRef.current = setInterval(poll, 2000);

        return () => stopPolling();
    }, [importJobId, stopPolling]);

    const [importUploading, setImportUploading] = useState(false);

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importForm.data.file || !billcollectorId || importUploading) return;

        setImportUploading(true);

        const formData = new FormData();
        formData.append('file', importForm.data.file);
        formData.append('billcollector_id', billcollectorId);

        router.post('/admin/consumers/import', formData, {
            forceFormData: true,
            onSuccess: () => {
                setImportOpen(false);
                importForm.reset();
            },
            onError: () => {
                setImportUploading(false);
            },
            onFinish: () => {
                setImportUploading(false);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this consumer?')) {
            router.delete(`/admin/consumers/${id}`);
        }
    };

    const selectClass = 'h-10 px-3 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white text-sm w-full';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Consumers" />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                        Consumers
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Manage electricity consumers and their billing
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setImportOpen(true)}
                                    className="group relative inline-flex items-center px-4 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <span className="relative z-10 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Import Excel
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                                <Link
                                    href="/admin/consumers/create"
                                    className="group relative inline-flex items-center px-4 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <span className="relative z-10 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Consumer
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Import Progress */}
                    {importProgress.status && importProgress.status !== '' && (
                        <div className="mb-6">
                            <div className={`rounded-2xl border shadow-sm overflow-hidden ${
                                importProgress.status === 'failed'
                                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                                    : importProgress.status === 'completed'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                                        : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700'
                            }`}>
                                <div className="px-6 py-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            {importProgress.status === 'completed' ? (
                                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            ) : importProgress.status === 'failed' ? (
                                                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center animate-pulse">
                                                    <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {importProgress.status === 'queued' && 'Import Queued'}
                                                    {importProgress.status === 'processing' && 'Importing Consumers...'}
                                                    {importProgress.status === 'completed' && 'Import Completed Successfully'}
                                                    {importProgress.status === 'failed' && 'Import Failed'}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {importProgress.status === 'failed'
                                                        ? (importProgress.error_message || 'An error occurred. Please check logs.')
                                                        : `${importProgress.processed_rows.toLocaleString()} of ${importProgress.total_rows.toLocaleString()} rows processed`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-2xl font-bold ${
                                                importProgress.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400'
                                                    : importProgress.status === 'failed' ? 'text-red-600 dark:text-red-400'
                                                    : 'text-blue-600 dark:text-blue-400'
                                            }`}>
                                                {importProgress.progress_percentage}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                                                importProgress.status === 'completed'
                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                                    : importProgress.status === 'failed'
                                                        ? 'bg-gradient-to-r from-red-500 to-rose-500'
                                                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                            }`}
                                            style={{ width: `${importProgress.progress_percentage}%` }}
                                        />
                                    </div>

                                    {importProgress.status === 'failed' && (
                                        <button
                                            onClick={() => {
                                                setImportJobId(null);
                                                setImportProgress({ total_rows: 0, processed_rows: 0, progress_percentage: 0, status: '', error_message: null });
                                            }}
                                            className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                                        >
                                            Dismiss
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

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
                                <div className="p-6 space-y-4">
                                    <HierarchyDropdowns
                                        values={hierarchy}
                                        onChange={handleHierarchy}
                                        circles={circles}
                                        showLevels={['circle_id', 'division_id', 'subdivision_id', 'section_id']}
                                    />

                                    <div className="flex flex-wrap gap-4 items-end">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Search (Name, SCNO, Phone)</label>
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
                                                {billCollectors.map(bc => (
                                                    <option key={bc.id} value={bc.id}>{bc.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="w-full sm:w-48">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                                            <select name="category_id" value={values.category_id} onChange={handleChange} className={selectClass}>
                                                <option value="">All Categories</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={applyFilters}
                                                className="h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5"
                                            >
                                                Filter
                                            </button>
                                            <button
                                                onClick={resetFilters}
                                                className="h-10 px-5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Table Card */}
                    <div className="relative">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">SCNO</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Name</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Section</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Village</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Feeder</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">DTR</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Collector</th>
                                            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                        {consumers.data.map((consumer) => (
                                            <tr key={consumer.id} className="group hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-200">
                                                <td className="p-4">
                                                    <code className="px-2 py-1 bg-slate-100 dark:bg-gray-900 rounded-lg text-xs font-mono text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-gray-700">
                                                        {consumer.scno}
                                                    </code>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                                            {consumer.name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{consumer.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{consumer.section_relation?.name ?? '—'}</td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{consumer.village?.name ?? '—'}</td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{consumer.feeder?.name ?? '—'}</td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{consumer.dtr?.dtr_name ?? '—'}</td>
                                                <td className="p-4">
                                                    {consumer.category_relation ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300">
                                                            {consumer.category_relation.name}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{consumer.phone ?? '—'}</td>
                                                <td className="p-4">
                                                    {consumer.billcollector ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-green-500"></span>
                                                            {consumer.billcollector.name}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                                            Not Assigned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <Link href={`/admin/consumers/${consumer.id}`} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-gray-700 rounded-lg transition-colors" title="View">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>
                                                        <Link href={`/admin/consumers/${consumer.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Edit">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button onClick={() => handleDelete(consumer.id)} className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Delete">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {consumers.data.length === 0 && (
                                            <tr>
                                                <td colSpan={10} className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg className="w-16 h-16 text-slate-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium">No consumers found</p>
                                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filter criteria</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-700">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Page <span className="font-medium">{consumers.current_page}</span> of{' '}
                                        <span className="font-medium">{consumers.last_page}</span>
                                    </p>
                                    {consumers.last_page > 1 && (
                                        <div className="flex flex-wrap gap-1">
                                            {consumers.links.map((link, i) => (
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Import Dialog */}
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Consumers from Excel</DialogTitle>
                        <DialogDescription>
                            Upload an Excel or CSV file to bulk-import consumers and their monthly bills.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleImport} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assign Bill Collector <span className="text-red-500">*</span></label>
                            <select value={billcollectorId} onChange={(e) => setBillcollectorId(e.target.value)} className={selectClass}>
                                <option value="">-- Select Bill Collector --</option>
                                {billCollectors.map((bc) => (
                                    <option key={bc.id} value={bc.id}>{bc.name}</option>
                                ))}
                            </select>
                        </div>
                        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => importForm.setData('file', e.target.files?.[0] ?? null)}
                            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 transition" />
                        {importForm.errors.file && <p className="text-red-500 text-sm">{importForm.errors.file}</p>}
                        <DialogFooter>
                            <button type="button" onClick={() => setImportOpen(false)} className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200">Cancel</button>
                            <button type="submit" disabled={!importForm.data.file || !billcollectorId || importUploading}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                {importUploading ? 'Uploading...' : 'Import'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
