<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subdivision;
use App\Models\Circle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubdivisionController extends Controller
{
    public function index()
    {
        $subdivisions = Subdivision::with('division.circle')
            ->withCount('sections')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/subdivisions/index', [
            'subdivisions' => $subdivisions,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/subdivisions/create', [
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
        ]);

        Subdivision::create($request->only('name', 'division_id'));

        return redirect()->route('subdivisions.index');
    }

    public function edit(Subdivision $subdivision)
    {
        $subdivision->load('division.circle');

        return Inertia::render('admin/subdivisions/edit', [
            'subdivision' => $subdivision,
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Subdivision $subdivision)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
        ]);

        $subdivision->update($request->only('name', 'division_id'));

        return redirect()->route('subdivisions.index');
    }

    public function destroy(Subdivision $subdivision)
    {
        $subdivision->delete();

        return redirect()->route('subdivisions.index');
    }
}
