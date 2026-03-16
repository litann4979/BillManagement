<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Village;
use App\Models\Circle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VillageController extends Controller
{
    public function index()
    {
        $villages = Village::with('section.subdivision.division.circle')
            ->withCount('consumers')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/villages/index', [
            'villages' => $villages,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/villages/create', [
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'section_id' => 'required|exists:sections,id',
        ]);

        Village::create($request->only('name', 'section_id'));

        return redirect()->route('villages.index');
    }

    public function edit(Village $village)
    {
        $village->load('section.subdivision.division.circle');

        return Inertia::render('admin/villages/edit', [
            'village' => $village,
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Village $village)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'section_id' => 'required|exists:sections,id',
        ]);

        $village->update($request->only('name', 'section_id'));

        return redirect()->route('villages.index');
    }

    public function destroy(Village $village)
    {
        $village->delete();

        return redirect()->route('villages.index');
    }
}
