<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Circle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CircleController extends Controller
{
    public function index()
    {
        $circles = Circle::withCount('divisions')->orderBy('name')->get();

        return Inertia::render('admin/circles/index', [
            'circles' => $circles,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/circles/create');
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        Circle::create($request->only('name'));

        return redirect()->route('circles.index');
    }

    public function edit(Circle $circle)
    {
        return Inertia::render('admin/circles/edit', [
            'circle' => $circle,
        ]);
    }

    public function update(Request $request, Circle $circle)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $circle->update($request->only('name'));

        return redirect()->route('circles.index');
    }

    public function destroy(Circle $circle)
    {
        $circle->delete();

        return redirect()->route('circles.index');
    }
}
