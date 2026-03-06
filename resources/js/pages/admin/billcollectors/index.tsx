import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface BillCollector {
    id: number;
    name: string;
    email: string;
}

interface Props {
    billCollectors: BillCollector[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Bill Collectors',
        href: '/admin/billcollectors',
    },
];

export default function Index({ billCollectors }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bill Collectors" />

            <div className="p-4">

                <div className="flex justify-between mb-4">
                    <h1 className="text-xl font-semibold">
                        Bill Collectors
                    </h1>

                    <Link
                        href="/admin/billcollectors/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Add BillCollector
                    </Link>
                </div>

                <div className="rounded-xl border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {billCollectors.map((user) => (
                                <tr key={user.id} className="border-t">

                                    <td className="p-3">
                                        {user.name}
                                    </td>

                                    <td className="p-3">
                                        {user.email}
                                    </td>

                                    <td className="p-3 flex gap-3">

                                        <Link
                                            href={`/admin/billcollectors/${user.id}/edit`}
                                            className="text-blue-600"
                                        >
                                            Edit
                                        </Link>

                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </AppLayout>
    );
}