import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Consumers', href: '/admin/consumers' },
    { title: 'Create', href: '#' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        scno: '',
        name: '',
        subdivision: '',
        section: '',
        address_1: '',
        address_2: '',
        address_3: '',
        email: '',
        phone: '',
        gis_location: '',
        date_of_connection: '',
        dtr_name: '',
        dtr_code: '',
        bill_grp: '',
        category: '',
        meter_no: '',
        cd: '',
        closing_balance: '',
        cfy: '',
        ecl_arrear: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/consumers');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Consumer" />

            <div className="p-4 max-w-3xl">
                <h1 className="text-xl font-semibold mb-4">Create Consumer</h1>

                <form onSubmit={submit} className="space-y-6">

                    {/* Identity */}
                    <fieldset className="border rounded-lg p-4 space-y-4">
                        <legend className="text-sm font-medium px-2">Identity</legend>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">SCNO *</label>
                                <input
                                    value={data.scno}
                                    onChange={(e) => setData('scno', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                                {errors.scno && <p className="text-red-500 text-sm mt-1">{errors.scno}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Location */}
                    <fieldset className="border rounded-lg p-4 space-y-4">
                        <legend className="text-sm font-medium px-2">Location</legend>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Subdivision</label>
                                <input
                                    value={data.subdivision}
                                    onChange={(e) => setData('subdivision', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Section</label>
                                <input
                                    value={data.section}
                                    onChange={(e) => setData('section', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Address Line 1</label>
                            <input
                                value={data.address_1}
                                onChange={(e) => setData('address_1', e.target.value)}
                                className="border p-2 w-full rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Address Line 2</label>
                            <input
                                value={data.address_2}
                                onChange={(e) => setData('address_2', e.target.value)}
                                className="border p-2 w-full rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Address Line 3</label>
                            <input
                                value={data.address_3}
                                onChange={(e) => setData('address_3', e.target.value)}
                                className="border p-2 w-full rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">GIS Location</label>
                            <input
                                value={data.gis_location}
                                onChange={(e) => setData('gis_location', e.target.value)}
                                className="border p-2 w-full rounded"
                            />
                        </div>
                    </fieldset>

                    {/* Meter & Connection */}
                    <fieldset className="border rounded-lg p-4 space-y-4">
                        <legend className="text-sm font-medium px-2">Meter & Connection</legend>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Meter No</label>
                                <input
                                    value={data.meter_no}
                                    onChange={(e) => setData('meter_no', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">DTR Name</label>
                                <input
                                    value={data.dtr_name}
                                    onChange={(e) => setData('dtr_name', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">DTR Code</label>
                                <input
                                    value={data.dtr_code}
                                    onChange={(e) => setData('dtr_code', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Bill Group</label>
                                <input
                                    value={data.bill_grp}
                                    onChange={(e) => setData('bill_grp', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <input
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Date of Connection</label>
                                <input
                                    type="date"
                                    value={data.date_of_connection}
                                    onChange={(e) => setData('date_of_connection', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">CD</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.cd}
                                onChange={(e) => setData('cd', e.target.value)}
                                className="border p-2 w-full rounded"
                            />
                        </div>
                    </fieldset>

                    {/* Financials */}
                    <fieldset className="border rounded-lg p-4 space-y-4">
                        <legend className="text-sm font-medium px-2">Financials</legend>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Closing Balance</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.closing_balance}
                                    onChange={(e) => setData('closing_balance', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">CFY</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.cfy}
                                    onChange={(e) => setData('cfy', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ECL Arrear</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.ecl_arrear}
                                    onChange={(e) => setData('ecl_arrear', e.target.value)}
                                    className="border p-2 w-full rounded"
                                />
                            </div>
                        </div>
                    </fieldset>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save'}
                        </button>

                        <Link
                            href="/admin/consumers"
                            className="px-6 py-2 rounded border hover:bg-gray-100 transition"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
