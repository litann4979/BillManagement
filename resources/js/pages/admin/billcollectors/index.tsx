import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function Index({ billCollectors }: { billCollectors: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Bill Collectors', href: '/admin/billcollectors' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bill Collectors" />
            <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bill Collectors</h1>
                    <Link href="/admin/billcollectors/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                        + Add Collector
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Collector Name</th>
                                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Unique ID</th>
                                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Email</th>
                                <th className="p-4 text-right font-semibold uppercase tracking-wider text-[11px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {billCollectors.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <td className="p-4 text-gray-900 dark:text-gray-100 font-medium">{user.name}</td>
                                    <td className="p-4">
                                        <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs dark:text-blue-400 font-mono border border-gray-200 dark:border-gray-700">
                                            {user.details?.user_unique_id || 'N/A'}
                                        </code>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="p-4 text-right space-x-4">
                                        <Link href={`/admin/billcollectors/${user.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:underline">Edit</Link>
                                        <Link 
                                            href={`/admin/billcollectors/${user.id}`} 
                                            method="delete" 
                                            as="button" 
                                            className="text-red-500 hover:underline"
                                            onClick={() => confirm('Are you sure you want to delete this collector?')}
                                        >
                                            Delete
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {billCollectors.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400 italic">No collectors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}