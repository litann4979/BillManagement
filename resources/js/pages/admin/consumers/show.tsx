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
    subdivision: string | null;
    section: string | null;
    address_1: string | null;
    address_2: string | null;
    address_3: string | null;
    email: string | null;
    phone: string | null;
    gis_location: string | null;
    date_of_connection: string | null;
    dtr_name: string | null;
    dtr_code: string | null;
    bill_grp: string | null;
    category: string | null;
    meter_no: string | null;
    cd: string | null;
    closing_balance: string | null;
    cfy: string | null;
    ecl_arrear: string | null;
    monthly_bills: MonthlyBill[];
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Consumer – ${consumer.scno}`} />

            <div className="p-4 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h1 className="text-xl font-semibold">{consumer.name}</h1>

                    <div className="flex gap-2">
                        <Link
                            href={`/admin/consumers/${consumer.id}/edit`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                        >
                            Edit
                        </Link>
                        <Link
                            href="/admin/consumers"
                            className="px-4 py-2 rounded border hover:bg-gray-100 transition"
                        >
                            Back
                        </Link>
                    </div>
                </div>

                {/* Consumer Info Card */}
                <div className="rounded-xl border p-4">
                    <h2 className="text-lg font-medium mb-4">Consumer Information</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">SCNO</span>
                            <p className="font-medium">{consumer.scno}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Name</span>
                            <p className="font-medium">{consumer.name}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Category</span>
                            <p className="font-medium">{consumer.category ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Bill Group</span>
                            <p className="font-medium">{consumer.bill_grp ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Phone</span>
                            <p className="font-medium">{consumer.phone ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Meter No</span>
                            <p className="font-medium">{consumer.meter_no ?? '—'}</p>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <span className="text-gray-500 dark:text-gray-400">Address</span>
                            <p className="font-medium">{address || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Monthly Billing Table */}
                <div className="rounded-xl border overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-medium">Monthly Billing</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="p-3 text-left text-sm font-medium">Month</th>
                                    <th className="p-3 text-left text-sm font-medium">Year</th>
                                    <th className="p-3 text-right text-sm font-medium">Opening Balance</th>
                                    <th className="p-3 text-left text-sm font-medium">Bill Status</th>
                                    <th className="p-3 text-left text-sm font-medium">Meter Status</th>
                                    <th className="p-3 text-right text-sm font-medium">Billed Units</th>
                                    <th className="p-3 text-right text-sm font-medium">Billed Amount</th>
                                    <th className="p-3 text-right text-sm font-medium">Paid Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                {consumer.monthly_bills.map((bill) => (
                                    <tr key={bill.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                                        <td className="p-3 text-sm">{bill.bill_month}</td>
                                        <td className="p-3 text-sm">{bill.bill_year}</td>
                                        <td className="p-3 text-sm text-right">{bill.opening_balance ?? '—'}</td>
                                        <td className="p-3 text-sm">{bill.bill_status ?? '—'}</td>
                                        <td className="p-3 text-sm">{bill.meter_status ?? '—'}</td>
                                        <td className="p-3 text-sm text-right">{bill.billed_units ?? '—'}</td>
                                        <td className="p-3 text-sm text-right">{bill.billed_amount ?? '—'}</td>
                                        <td className="p-3 text-sm text-right">{bill.paid_amount ?? '—'}</td>
                                    </tr>
                                ))}

                                {consumer.monthly_bills.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-6 text-center text-gray-500">
                                            No monthly bills found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
