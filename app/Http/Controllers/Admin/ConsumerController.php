<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consumer;
use App\Models\User;
use App\Models\Role;
use App\Imports\ConsumersImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ConsumerController extends Controller
{
    public function index(Request $request)
    {
        $query = Consumer::with('billcollector:id,name');

        // Search bar — searches across scno, name, phone
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('scno', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->filled('billcollector_id')) {
            $query->where('billcollector_id', $request->billcollector_id);
        }
        if ($request->filled('scno')) {
            $query->where('scno', 'like', "%{$request->scno}%");
        }
        if ($request->filled('filter_name')) {
            $query->where('name', 'like', "%{$request->filter_name}%");
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $consumers = $query->latest()->paginate(15)->withQueryString();

        $billRole = Role::where('name', 'billcollector')->first();
        $billCollectors = $billRole
            ? User::where('role_id', $billRole->id)->get(['id', 'name'])
            : collect();

        $categories = Consumer::whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values();

        return Inertia::render('admin/consumers/index', [
            'consumers' => $consumers,
            'billCollectors' => $billCollectors,
            'categories' => $categories,
            'filters' => $request->only(['search', 'billcollector_id', 'scno', 'filter_name', 'category']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/consumers/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'scno'     => 'required|unique:consumers',
            'name'     => 'required',
            'phone'    => 'nullable|string',
            'email'    => 'nullable|email',
        ]);

        Consumer::create($request->only([
            'scno', 'name',
            'subdivision', 'section',
            'address_1', 'address_2', 'address_3',
            'email', 'phone',
            'gis_location', 'date_of_connection',
            'dtr_name', 'dtr_code',
            'bill_grp', 'category',
            'meter_no', 'cd',
            'closing_balance', 'cfy', 'ecl_arrear'
        ]));

        return redirect()->route('consumers.index');
    }

    public function show($id)
    {
        $consumer = Consumer::with('monthlyBills')->findOrFail($id);

        return Inertia::render('admin/consumers/show', [
            'consumer' => $consumer
        ]);
    }

    public function edit($id)
    {
        $consumer = Consumer::findOrFail($id);

        return Inertia::render('admin/consumers/edit', [
            'consumer' => $consumer
        ]);
    }

    public function update(Request $request, $id)
    {
        $consumer = Consumer::findOrFail($id);

        $request->validate([
            'scno' => "required|unique:consumers,scno,$id",
            'name' => 'required',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        $consumer->update($request->only([
            'scno', 'name',
            'subdivision', 'section',
            'address_1', 'address_2', 'address_3',
            'email', 'phone',
            'gis_location', 'date_of_connection',
            'dtr_name', 'dtr_code',
            'bill_grp', 'category',
            'meter_no', 'cd',
            'closing_balance', 'cfy', 'ecl_arrear'
        ]));

        return redirect()->route('consumers.index');
    }

    public function destroy($id)
    {
        Consumer::findOrFail($id)->delete();

        return redirect()->route('consumers.index');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'billcollector_id' => 'required|exists:users,id',
        ]);

        Excel::import(
            new ConsumersImport($request->billcollector_id),
            $request->file('file')
        );

        return redirect()->route('consumers.index');
    }
}
