<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Circle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index()
    {
        $sections = Section::with('subdivision.division.circle')
            ->withCount(['villages', 'feeders'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/sections/index', [
            'sections' => $sections,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/sections/create', [
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'subdivision_id' => 'required|exists:subdivisions,id',
        ]);

        Section::create($request->only('name', 'subdivision_id'));

        return redirect()->route('sections.index');
    }

    public function edit(Section $section)
    {
        $section->load('subdivision.division.circle');

        return Inertia::render('admin/sections/edit', [
            'section' => $section,
            'circles' => Circle::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Section $section)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'subdivision_id' => 'required|exists:subdivisions,id',
        ]);

        $section->update($request->only('name', 'subdivision_id'));

        return redirect()->route('sections.index');
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return redirect()->route('sections.index');
    }
}
