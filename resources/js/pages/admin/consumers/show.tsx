import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

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
    billcollector: { id: number; name: string } | null;
    section_relation: { id: number; name: string; subdivision: { name: string; division: { name: string; circle: { name: string } | null } | null } | null } | null;
    village: { id: number; name: string } | null;
    feeder: { id: number; name: string } | null;
    dtr: { id: number; dtr_name: string; dtr_code: string | null } | null;
    category_relation: { id: number; name: string } | null;
}

export default function Show({ consumer }: { consumer: Consumer }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Consumers', href: '/admin/consumers' },
        { title: consumer.scno, href: '#' },
    ];

    const address = [consumer.address_1, consumer.address_2, consumer.address_3]
        .filter(Boolean)
        .join(', ');

    const sec = consumer.section_relation;
    const sub = sec?.subdivision;
    const div = sub?.division;
    const circle = div?.circle;

    const billStatusBadge = (status: string | null) => {
        if (!status) return <span className="text-slate-400">—</span>;
        const colors: Record<string, string> = {
            paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            unpaid: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            partial: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{value || <span className="text-slate-400">—</span>}</p>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Consumer – ${consumer.scno}`} />

            <div className="min-h-screen font-['Inter']">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                        {consumer.name}
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        SCNO: <code className="px-2 py-0.5 bg-slate-100 dark:bg-gray-900 rounded-lg text-xs font-mono text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-gray-700">{consumer.scno}</code>
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/consumers/${consumer.id}/edit`}
                                    className="group relative inline-flex items-center px-4 py-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <span className="relative z-10 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                                <Link
                                    href="/admin/consumers"
                                    className="inline-flex items-center px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200"
                                >
                                    Back
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Consumer Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></span>
                                    Consumer Information
                                </h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <InfoItem label="SCNO" value={consumer.scno} />
                                    <InfoItem label="Name" value={consumer.name} />
                                    <InfoItem label="Category" value={consumer.category_relation?.name} />
                                    <InfoItem label="Bill Group" value={consumer.bill_grp} />
                                    <InfoItem label="Phone" value={consumer.phone} />
                                    <InfoItem label="Email" value={consumer.email} />
                                    <InfoItem label="Meter No" value={consumer.meter_no} />
                                    <InfoItem
                                        label="Bill Collector"
                                        value={consumer.billcollector ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-green-500"></span>
                                                {consumer.billcollector.name}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                                Not Assigned
                                            </span>
                                        )}
                                    />
                                    <InfoItem label="Date of Connection" value={consumer.date_of_connection} />
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <InfoItem label="Address" value={address} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hierarchy */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
                                    Hierarchy
                                </h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <InfoItem label="Circle" value={circle?.name} />
                                    <InfoItem label="Division" value={div?.name} />
                                    <InfoItem label="Subdivision" value={sub?.name} />
                                    <InfoItem label="Section" value={sec?.name} />
                                    <InfoItem label="Village" value={consumer.village?.name} />
                                    <InfoItem label="Feeder" value={consumer.feeder?.name} />
                                    <InfoItem
                                        label="DTR"
                                        value={consumer.dtr ? `${consumer.dtr.dtr_name}${consumer.dtr.dtr_code ? ` (${consumer.dtr.dtr_code})` : ''}` : undefined}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full mr-3"></span>
                                    Financials
                                </h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <InfoItem label="CD" value={consumer.cd} />
                                    <InfoItem label="Closing Balance" value={consumer.closing_balance} />
                                    <InfoItem label="CFY" value={consumer.cfy} />
                                    <InfoItem label="ECL Arrear" value={consumer.ecl_arrear} />
                                </div>
                            </div>
                        </div>

                        {/* Monthly Billing Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                    <span className="w-1 h-5 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full mr-3"></span>
                                    Monthly Billing
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Month</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Year</th>
                                            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Opening Balance</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bill Status</th>
                                            <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Meter Status</th>
                                            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Billed Units</th>
                                            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Billed Amount</th>
                                            <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Paid Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                        {consumer.monthly_bills.map((bill) => (
                                            <tr key={bill.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-200">
                                                <td className="p-4 text-slate-900 dark:text-white">{bill.bill_month}</td>
                                                <td className="p-4 text-slate-900 dark:text-white">{bill.bill_year}</td>
                                                <td className="p-4 text-right text-slate-500 dark:text-slate-400">{bill.opening_balance ?? '—'}</td>
                                                <td className="p-4">{billStatusBadge(bill.bill_status)}</td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{bill.meter_status ?? '—'}</td>
                                                <td className="p-4 text-right text-slate-500 dark:text-slate-400">{bill.billed_units ?? '—'}</td>
                                                <td className="p-4 text-right font-medium text-slate-900 dark:text-white">{bill.billed_amount ?? '—'}</td>
                                                <td className="p-4 text-right font-medium text-slate-900 dark:text-white">{bill.paid_amount ?? '—'}</td>
                                            </tr>
                                        ))}
                                        {consumer.monthly_bills.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="p-12 text-center">
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No monthly bills found</p>
                                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Bills will appear here once added</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Total <span className="font-medium">{consumer.monthly_bills.length}</span> billing records
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
