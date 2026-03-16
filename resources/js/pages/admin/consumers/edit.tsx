import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HierarchyDropdowns from '@/components/hierarchy-dropdowns';
import type { BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';

interface MonthlyBill {
    id: number;
    bill_month: string;
    bill_year: number;
    opening_balance: string | null;
    bill_status: string | null;
    meter_status: string | null;
    billed_units: number | null;
    billed_amount: string | null;
    paid_amount: string | null;
}

interface Consumer {
    id: number;
    scno: string;
    name: string;
    section_id: number | null;
    village_id: number | null;
    feeder_id: number | null;
    dtr_id: number | null;
    subdivision_id: number | null;
    category_id: number | null;
    billcollector_id: number | null;
    address_1: string | null;
    address_2: string | null;
    address_3: string | null;
    email: string | null;
    phone: string | null;
    gis_location: string | null;
    latitude: string | null;
    longitude: string | null;
    date_of_connection: string | null;
    bill_grp: string | null;
    meter_no: string | null;
    cd: string | null;
    closing_balance: string | null;
    cfy: string | null;
    ecl_arrear: string | null;
    monthly_bills: MonthlyBill[];
    section_relation?: {
        id: number;
        subdivision_id: number;
        subdivision?: {
            id: number;
            division_id: number;
            division?: {
                id: number;
                circle_id: number;
                circle?: { id: number };
            };
        };
    };
}

interface Props {
    consumer: Consumer;
    circles: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    billCollectors: { id: number; name: string }[];
}

export default function Edit({ consumer, circles, categories, billCollectors }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Consumers', href: '/admin/consumers' },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        scno: consumer.scno ?? '',
        name: consumer.name ?? '',
        section_id: String(consumer.section_id ?? ''),
        village_id: String(consumer.village_id ?? ''),
        feeder_id: String(consumer.feeder_id ?? ''),
        dtr_id: String(consumer.dtr_id ?? ''),
        subdivision_id: String(consumer.subdivision_id ?? ''),
        category_id: String(consumer.category_id ?? ''),
        billcollector_id: String(consumer.billcollector_id ?? ''),
        address_1: consumer.address_1 ?? '',
        address_2: consumer.address_2 ?? '',
        address_3: consumer.address_3 ?? '',
        email: consumer.email ?? '',
        phone: consumer.phone ?? '',
        gis_location: consumer.gis_location ?? '',
        latitude: consumer.latitude ?? '',
        longitude: consumer.longitude ?? '',
        date_of_connection: consumer.date_of_connection ?? '',
        bill_grp: consumer.bill_grp ?? '',
        meter_no: consumer.meter_no ?? '',
        cd: consumer.cd ?? '',
        closing_balance: consumer.closing_balance ?? '',
        cfy: consumer.cfy ?? '',
        ecl_arrear: consumer.ecl_arrear ?? '',
        bill_month: '',
        bill_year: '',
        opening_balance: '',
        bill_status: '',
        meter_status: '',
        billed_units: '',
        billed_amount: '',
        paid_amount: '',
    });

    const sec = consumer.section_relation;
    const sub = sec?.subdivision;
    const div = sub?.division;
    const [hierarchy, setHierarchy] = useState({
        circle_id: String(div?.circle?.id ?? div?.circle_id ?? ''),
        division_id: String(sub?.division_id ?? div?.id ?? ''),
        subdivision_id: String(consumer.subdivision_id ?? sec?.subdivision_id ?? sub?.id ?? ''),
        section_id: String(consumer.section_id ?? ''),
        village_id: String(consumer.village_id ?? ''),
        feeder_id: String(consumer.feeder_id ?? ''),
        dtr_id: String(consumer.dtr_id ?? ''),
    });

    const handleHierarchy = (key: string, value: string) => {
        setHierarchy((prev) => ({ ...prev, [key]: value }));
        if (['section_id', 'village_id', 'feeder_id', 'dtr_id', 'subdivision_id'].includes(key)) {
            setData(key as any, value);
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
        put(`/admin/consumers/${consumer.id}`);
    };

    const inputClass = 'w-full h-11 px-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm';
    const selectClass = 'w-full h-11 px-3 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-slate-900 dark:text-white text-sm';

    const billStatusBadge = (status: string | null) => {
        if (!status) return '—';
        const colors: Record<string, string> = {
            paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            unpaid: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            partial: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
            overdue: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
        };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Consumer" />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Edit Consumer
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Update information for <span className="font-medium text-blue-600 dark:text-blue-400">{consumer.name}</span> ({consumer.scno})
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
                                        <Input value={data.scno} onChange={(e) => setData('scno', e.target.value)} className={inputClass} />
                                        <InputError message={errors.scno} className="text-xs text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name <span className="text-red-500">*</span></Label>
                                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                                        <InputError message={errors.name} className="text-xs text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
                                        <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClass} />
                                        <InputError message={errors.email} className="text-xs text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</Label>
                                        <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inputClass} />
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

                        {/* Existing Monthly Bills */}
                        {consumer.monthly_bills.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                        <span className="w-1 h-5 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full mr-3"></span>
                                        Existing Monthly Bills
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Month</th>
                                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Year</th>
                                                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Opening</th>
                                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                                                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Units</th>
                                                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
                                                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Paid</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                            {consumer.monthly_bills.map((b) => (
                                                <tr key={b.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-200">
                                                    <td className="p-4 text-slate-900 dark:text-white">{b.bill_month}</td>
                                                    <td className="p-4 text-slate-900 dark:text-white">{b.bill_year}</td>
                                                    <td className="p-4 text-right text-slate-500 dark:text-slate-400">{b.opening_balance ?? '—'}</td>
                                                    <td className="p-4">{billStatusBadge(b.bill_status)}</td>
                                                    <td className="p-4 text-right text-slate-500 dark:text-slate-400">{b.billed_units ?? '—'}</td>
                                                    <td className="p-4 text-right font-medium text-slate-900 dark:text-white">{b.billed_amount ?? '—'}</td>
                                                    <td className="p-4 text-right font-medium text-slate-900 dark:text-white">{b.paid_amount ?? '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Add New Monthly Bill */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full mr-3"></span>
                                    Add New Monthly Bill
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">Optional - add a new monthly bill entry</p>
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
                                        <InputError message={errors.bill_month} className="text-xs text-red-600 dark:text-red-400" />
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
                                    {processing ? 'Updating...' : 'Update Consumer'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
