<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feeder;
use App\Models\Circle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeederController extends Controller
{
    public function index()
    {
        $feeders = Feeder::with('section.subdivision.division.circle')
            ->withCount('dtrs')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/feeders/index', [
            'feeders' => $feeders,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/feeders/create', [
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'section_id' => 'required|exists:sections,id',
            'voltage' => 'nullable|string|max:50',
        ]);

        Feeder::create($request->only('name', 'section_id', 'voltage'));

        return redirect()->route('feeders.index');
    }

    public function edit(Feeder $feeder)
    {
        $feeder->load('section.subdivision.division.circle');

        return Inertia::render('admin/feeders/edit', [
            'feeder' => $feeder,
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Feeder $feeder)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'section_id' => 'required|exists:sections,id',
            'voltage' => 'nullable|string|max:50',
        ]);

        $feeder->update($request->only('name', 'section_id', 'voltage'));

        return redirect()->route('feeders.index');
    }

    public function destroy(Feeder $feeder)
    {
        $feeder->delete();

        return redirect()->route('feeders.index');
    }
}
