<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dtr;
use App\Models\Circle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DtrController extends Controller
{
    public function index()
    {
        $dtrs = Dtr::with('feeder.section.subdivision.division.circle')
            ->orderBy('dtr_name')
            ->get();

        return Inertia::render('admin/dtrs/index', [
            'dtrs' => $dtrs,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/dtrs/create', [
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'dtr_name' => 'required|string|max:255',
            'dtr_code' => 'nullable|string|max:100',
            'capacity' => 'nullable|string|max:50',
            'feeder_id' => 'required|exists:feeders,id',
        ]);

        Dtr::create($request->only('dtr_name', 'dtr_code', 'capacity', 'feeder_id'));

        return redirect()->route('dtrs.index');
    }

    public function edit(Dtr $dtr)
    {
        $dtr->load('feeder.section.subdivision.division.circle');

        return Inertia::render('admin/dtrs/edit', [
            'dtr' => $dtr,
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Dtr $dtr)
    {
        $request->validate([
            'dtr_name' => 'required|string|max:255',
            'dtr_code' => 'nullable|string|max:100',
            'capacity' => 'nullable|string|max:50',
            'feeder_id' => 'required|exists:feeders,id',
        ]);

        $dtr->update($request->only('dtr_name', 'dtr_code', 'capacity', 'feeder_id'));

        return redirect()->route('dtrs.index');
    }

    public function destroy(Dtr $dtr)
    {
        $dtr->delete();

        return redirect()->route('dtrs.index');
    }
}
