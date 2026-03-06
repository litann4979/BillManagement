import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Bill Collectors', href: '/admin/billcollectors' },
    { title: 'Create', href: '#' },
];

export default function Create() {

    const { data, setData, post, processing } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/billcollectors');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create BillCollector" />

            <div className="p-4 max-w-xl">

                <h1 className="text-xl font-semibold mb-4">
                    Create BillCollector
                </h1>

                <form onSubmit={submit} className="space-y-4">

                    <input
                        type="text"
                        placeholder="Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="border p-2 w-full rounded"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="border p-2 w-full rounded"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="border p-2 w-full rounded"
                    />

                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded"
                        disabled={processing}
                    >
                        Save
                    </button>

                </form>
            </div>
        </AppLayout>
    );
}