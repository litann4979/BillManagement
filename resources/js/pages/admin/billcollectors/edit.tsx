import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function Edit({ user }: { user: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Bill Collectors', href: '/admin/billcollectors' },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        user_unique_id: user.details?.user_unique_id || '',
        aadhaar_no: user.details?.aadhaar_no || '',
        date_of_birth: user.details?.date_of_birth || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/billcollectors/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Bill Collector" />
            <div className="p-4 max-w-2xl">
                <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Collector: {user.name}</h1>
                
                <form onSubmit={submit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                className="border p-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" 
                            />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input 
                                value={data.email} 
                                onChange={e => setData('email', e.target.value)} 
                                className="border p-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" 
                            />
                            {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unique ID</label>
                            <input 
                                value={data.user_unique_id} 
                                onChange={e => setData('user_unique_id', e.target.value)} 
                                className="border p-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" 
                            />
                            {errors.user_unique_id && <span className="text-red-500 text-xs">{errors.user_unique_id}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Aadhaar No</label>
                            <input 
                                value={data.aadhaar_no} 
                                onChange={e => setData('aadhaar_no', e.target.value)} 
                                className="border p-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" 
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                            <input
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                className="border p-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.date_of_birth && <span className="text-red-500 text-xs">{errors.date_of_birth}</span>}
                        </div>
                    
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium">
                            {processing ? 'Updating...' : 'Update Details'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}