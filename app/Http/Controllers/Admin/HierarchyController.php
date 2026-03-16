<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Circle;
use App\Models\Division;
use App\Models\Subdivision;
use App\Models\Section;
use App\Models\Village;
use App\Models\Feeder;
use App\Models\Dtr;

class HierarchyController extends Controller
{
    public function divisions(Circle $circle)
    {
        return response()->json(
            $circle->divisions()->select('id', 'name')->orderBy('name')->get()
        );
    }

    public function subdivisions(Division $division)
    {
        return response()->json(
            $division->subdivisions()->select('id', 'name')->orderBy('name')->get()
        );
    }

    public function sections(Subdivision $subdivision)
    {
        return response()->json(
            $subdivision->sections()->select('id', 'name')->orderBy('name')->get()
        );
    }

    public function villages(Section $section)
    {
        return response()->json(
            $section->villages()->select('id', 'name')->orderBy('name')->get()
        );
    }

    public function feeders(Section $section)
    {
        return response()->json(
            $section->feeders()->select('id', 'name')->orderBy('name')->get()
        );
    }

    public function dtrs(Feeder $feeder)
    {
        return response()->json(
            $feeder->dtrs()->select('id', 'dtr_name', 'dtr_code')->orderBy('dtr_name')->get()
        );
    }
}
