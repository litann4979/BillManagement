import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

export default function Edit({ user }: { user: User }) {

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Bill Collectors', href: '/admin/billcollectors' },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/billcollectors/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit BillCollector" />

            <div className="p-4 max-w-xl">

                <h1 className="text-xl font-semibold mb-4">
                    Edit BillCollector
                </h1>

                <form onSubmit={submit} className="space-y-4">

                    <input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="border p-2 w-full rounded"
                    />

                    <input
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="border p-2 w-full rounded"
                    />

                    <button className="bg-blue-600 text-white px-4 py-2 rounded">
                        Update
                    </button>

                </form>

            </div>
        </AppLayout>
    );
}