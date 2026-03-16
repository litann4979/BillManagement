import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HierarchyDropdowns from '@/components/hierarchy-dropdowns';
import type { BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';

interface Props {
    circles: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    billCollectors: { id: number; name: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Consumers', href: '/admin/consumers' },
    { title: 'Create', href: '#' },
];

export default function Create({ circles, categories, billCollectors }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        scno: '',
        name: '',
        section_id: '',
        village_id: '',
        feeder_id: '',
        dtr_id: '',
        subdivision_id: '',
        category_id: '',
        billcollector_id: '',
        address_1: '',
        address_2: '',
        address_3: '',
        email: '',
        phone: '',
        gis_location: '',
        latitude: '',
        longitude: '',
        date_of_connection: '',
        bill_grp: '',
        meter_no: '',
        cd: '',
        closing_balance: '',
        cfy: '',
        ecl_arrear: '',
        bill_month: '',
        bill_year: '',
        opening_balance: '',
        bill_status: '',
        meter_status: '',
        billed_units: '',
        billed_amount: '',
        paid_amount: '',
    });

    const [hierarchy, setHierarchy] = useState({
        circle_id: '',
        division_id: '',
        subdivision_id: '',
        section_id: '',
        village_id: '',
        feeder_id: '',
        dtr_id: '',
    });

    const handleHierarchy = (key: string, value: string) => {
        setHierarchy((prev) => ({ ...prev, [key]: value }));
        if (['section_id', 'village_id', 'feeder_id', 'dtr_id', 'subdivision_id'].includes(key)) {
            setData(key as any, value);
        }
        if (key === 'subdivision_id') {
            setData('subdivision_id', value);
        }
    };

    useEffect(() => {
        const billed = Number(data.billed_amount || 0);
        const paid = Number(data.paid_amount || 0);

        let status = '';
        if (data.billed_amount || data.paid_amount) {
            if (paid <= 0) status = 'unpaid';
            else if (paid < billed) status = 'partial';
            else if (paid === billed) status = 'paid';
            else status = 'overdue';
        }
        setData('bill_status', status);
    }, [data.paid_amount, data.billed_amount]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/consumers');
    };

    const inputClass = 'w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm';
    const selectClass = 'w-full h-11 px-3 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white text-sm';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Consumer" />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Create Consumer
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Add a new electricity consumer to the system
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Identity Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></span>
                                    Identity
                                </h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">SCNO <span className="text-red-500">*</span></Label>
                                        <Input value={data.scno} onChange={(e) => setData('scno', e.target.value)} className={inputClass} placeholder="411721010981" />
                                        <InputError message={errors.scno} className="text-xs text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name <span className="text-red-500">*</span></Label>
                                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} placeholder="Consumer name" />
                                        <InputError message={errors.name} className="text-xs text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
                                        <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClass} placeholder="email@example.com" />
                                        <InputError message={errors.email} className="text-xs text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</Label>
                                        <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inputClass} placeholder="9876543210" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hierarchy Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
                                    Hierarchy
                                </h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <HierarchyDropdowns values={hierarchy} onChange={handleHierarchy} circles={circles} />
                            </div>
                        </div>

                        {/* Assignment Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></span>
                                    Assignment
                                </h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bill Collector</Label>
                                        <select value={data.billcollector_id} onChange={(e) => setData('billcollector_id', e.target.value)} className={selectClass}>
                                            <option value="">-- None --</option>
                                            {billCollectors.map((bc) => <option key={bc.id} value={bc.id}>{bc.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</Label>
                                        <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} className={selectClass}>
                                            <option value="">-- Select --</option>
                                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bill Group</Label>
                                        <Input value={data.bill_grp} onChange={(e) => setData('bill_grp', e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full mr-3"></span>
                                    Address
                                </h2>
                            </div>
                            <div className="p-6 sm:p-8 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address Line 1</Label>
                                    <Input value={data.address_1} onChange={(e) => setData('address_1', e.target.value)} className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address Line 2</Label>
                                    <Input value={data.address_2} onChange={(e) => setData('address_2', e.target.value)} className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address Line 3</Label>
                                    <Input value={data.address_3} onChange={(e) => setData('address_3', e.target.value)} className={inputClass} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">GIS Location</Label>
                                        <Input value={data.gis_location} onChange={(e) => setData('gis_location', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Latitude</Label>
                                        <Input type="number" step="0.0000001" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Longitude</Label>
                                        <Input type="number" step="0.0000001" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meter & Connection Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full mr-3"></span>
                                    Meter & Connection
                                </h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Meter No</Label>
                                        <Input value={data.meter_no} onChange={(e) => setData('meter_no', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Connection</Label>
                                        <Input type="date" value={data.date_of_connection} onChange={(e) => setData('date_of_connection', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">CD</Label>
                                        <Input type="number" step="0.01" value={data.cd} onChange={(e) => setData('cd', e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financials Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full mr-3"></span>
                                    Financials
                                </h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Closing Balance</Label>
                                        <Input type="number" step="0.01" value={data.closing_balance} onChange={(e) => setData('closing_balance', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">CFY</Label>
                                        <Input type="number" step="0.01" value={data.cfy} onChange={(e) => setData('cfy', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">ECL Arrear</Label>
                                        <Input type="number" step="0.01" value={data.ecl_arrear} onChange={(e) => setData('ecl_arrear', e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Initial Monthly Bill Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full mr-3"></span>
                                    Initial Monthly Bill
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">Optional - add the first monthly bill for this consumer</p>
                            </div>
                            <div className="p-6 sm:p-8 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bill Month</Label>
                                        <select value={data.bill_month} onChange={(e) => setData('bill_month', e.target.value)} className={selectClass}>
                                            <option value="">-- Month --</option>
                                            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                                                <option key={m} value={String(i + 1)}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bill Year</Label>
                                        <Input type="number" value={data.bill_year} onChange={(e) => setData('bill_year', e.target.value)} placeholder="2024" className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Opening Balance</Label>
                                        <Input type="number" step="0.01" value={data.opening_balance} onChange={(e) => setData('opening_balance', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bill Status</Label>
                                        <select value={data.bill_status} disabled className={`${selectClass} bg-slate-100 dark:bg-gray-800 cursor-not-allowed`}>
                                            <option value="">-- Auto --</option>
                                            <option value="unpaid">Unpaid</option>
                                            <option value="partial">Partial</option>
                                            <option value="paid">Paid</option>
                                            <option value="overdue">Overdue</option>
                                        </select>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Auto-calculated from amounts</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Meter Status</Label>
                                        <select value={data.meter_status} onChange={(e) => setData('meter_status', e.target.value)} className={selectClass}>
                                            <option value="">-- Select Status --</option>
                                            <option value="ok">OK</option>
                                            <option value="defective">Defective</option>
                                            <option value="locked">Locked</option>
                                            <option value="burnt">Burnt</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Billed Units</Label>
                                        <Input type="number" value={data.billed_units} onChange={(e) => setData('billed_units', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Billed Amount</Label>
                                        <Input type="number" step="0.01" value={data.billed_amount} onChange={(e) => setData('billed_amount', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Paid Amount</Label>
                                        <Input type="number" step="0.01" value={data.paid_amount} onChange={(e) => setData('paid_amount', e.target.value)} className={inputClass} />
                                        <InputError message={errors.paid_amount} className="text-xs text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                                <Link
                                    href="/admin/consumers"
                                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200"
                                >
                                    Cancel
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="relative px-6 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {processing ? 'Creating...' : 'Create Consumer'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
