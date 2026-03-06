import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
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
    section: string | null;
    bill_grp: string | null;
    category: string | null;
    phone: string | null;
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

interface Props {
    consumers: {
        data: Consumer[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    billCollectors: BillCollector[];
    categories: string[];
    filters: {
        search?: string;
        billcollector_id?: string;
        scno?: string;
        filter_name?: string;
        category?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Consumers', href: '/admin/consumers' },
];

export default function Index({ consumers, billCollectors, categories, filters }: Props) {
    const [importOpen, setImportOpen] = useState(false);
    const [billcollectorId, setBillcollectorId] = useState('');

    // Filter States
    const [values, setValues] = useState({
        search: filters.search || '',
        billcollector_id: filters.billcollector_id || '',
        category: filters.category || '',
    });

    // Handle filter changes
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const key = e.target.name;
        const value = e.target.value;
        setValues(values => ({
            ...values,
            [key]: value,
        }));
    }

    // Submit filters to Controller
    const applyFilters = () => {
        router.get('/admin/consumers', pickBy(values), {
            preserveState: true,
            replace: true,
        });
    };

    // Reset filters
    const resetFilters = () => {
        setValues({ search: '', billcollector_id: '', category: '' });
        router.get('/admin/consumers');
    };

    const importForm = useForm<{ file: File | null }>({
        file: null,
    });

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importForm.data.file || !billcollectorId) return;

        const formData = new FormData();
        formData.append('file', importForm.data.file);
        formData.append('billcollector_id', billcollectorId);

        router.post('/admin/consumers/import', formData, {
            forceFormData: true,
            onSuccess: () => setImportOpen(false),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this consumer?')) {
            router.delete(`/admin/consumers/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Consumers" />

            <div className="p-4">
                {/* Top bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                    <h1 className="text-xl font-semibold">Consumers</h1>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setImportOpen(true)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded transition text-sm"
                        >
                            Import Excel
                        </button>

                        <Link
                            href="/admin/consumers/create"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition text-sm"
                        >
                            Add Consumer
                        </Link>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border mb-6 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium mb-1">Search (Name, SCNO, Phone)</label>
                        <input
                            type="text"
                            name="search"
                            value={values.search}
                            onChange={handleChange}
                            placeholder="Type to search..."
                            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-900"
                        />
                    </div>

                    <div className="w-full sm:w-48">
                        <label className="block text-xs font-medium mb-1">Bill Collector</label>
                        <select
                            name="billcollector_id"
                            value={values.billcollector_id}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-900"
                        >
                            <option value="">All Collectors</option>
                            {billCollectors.map(bc => (
                                <option key={bc.id} value={bc.id}>{bc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full sm:w-48">
                        <label className="block text-xs font-medium mb-1">Category</label>
                        <select
                            name="category"
                            value={values.category}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-900"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={applyFilters}
                            className="bg-gray-900 dark:bg-blue-600 text-white px-4 py-2 rounded text-sm hover:opacity-90 transition"
                        >
                            Filter
                        </button>
                        <button
                            onClick={resetFilters}
                            className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300 transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">SCNO</th>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Section</th>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Bill Group</th>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Phone</th>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {consumers.data.map((consumer) => (
                                <tr key={consumer.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                                    <td className="p-4 text-sm font-medium">{consumer.scno}</td>
                                    <td className="p-4 text-sm">{consumer.name}</td>
                                    <td className="p-4 text-sm text-gray-500">{consumer.section ?? '—'}</td>
                                    <td className="p-4 text-sm text-gray-500">{consumer.bill_grp ?? '—'}</td>
                                    <td className="p-4 text-sm">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                            {consumer.category ?? '—'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">{consumer.phone ?? '—'}</td>
                                    <td className="p-4 text-sm text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/admin/consumers/${consumer.id}`} className="text-emerald-600 hover:text-emerald-700 font-medium">View</Link>
                                            <Link href={`/admin/consumers/${consumer.id}/edit`} className="text-blue-600 hover:text-blue-700 font-medium">Edit</Link>
                                            <button onClick={() => handleDelete(consumer.id)} className="text-red-600 hover:text-red-700 font-medium">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {consumers.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-400">
                                        No consumers found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {consumers.last_page > 1 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-6">
                        {consumers.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`px-4 py-2 rounded text-sm border transition ${link.active
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : link.url
                                        ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 border-gray-300 dark:border-gray-600'
                                        : 'text-gray-400 border-gray-100 cursor-default'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Import Dialog - Stays same as your original */}
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
                            <label className="block text-sm font-medium mb-1">Assign Bill Collector *</label>
                            <select
                                value={billcollectorId}
                                onChange={(e) => setBillcollectorId(e.target.value)}
                                className="border p-2 w-full rounded dark:bg-gray-900"
                            >
                                <option value="">— Select Bill Collector —</option>
                                {billCollectors.map((bc) => (
                                    <option key={bc.id} value={bc.id}>
                                        {bc.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) =>
                                importForm.setData('file', e.target.files?.[0] ?? null)
                            }
                            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />

                        {importForm.errors.file && (
                            <p className="text-red-500 text-sm">{importForm.errors.file}</p>
                        )}

                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setImportOpen(false)}
                                className="px-4 py-2 rounded border hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!importForm.data.file || !billcollectorId || importForm.processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
                            >
                                {importForm.processing ? 'Importing…' : 'Import'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}