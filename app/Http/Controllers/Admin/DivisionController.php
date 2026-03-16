<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Circle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisionController extends Controller
{
    public function index()
    {
        $divisions = Division::with('circle:id,name')
            ->withCount('subdivisions')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/divisions/index', [
            'divisions' => $divisions,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/divisions/create', [
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'circle_id' => 'required|exists:circles,id',
        ]);

        Division::create($request->only('name', 'circle_id'));

        return redirect()->route('divisions.index');
    }

    public function edit(Division $division)
    {
        return Inertia::render('admin/divisions/edit', [
            'division' => $division,
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Division $division)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'circle_id' => 'required|exists:circles,id',
        ]);

        $division->update($request->only('name', 'circle_id'));

        return redirect()->route('divisions.index');
    }

    public function destroy(Division $division)
    {
        $division->delete();

        return redirect()->route('divisions.index');
    }
}
