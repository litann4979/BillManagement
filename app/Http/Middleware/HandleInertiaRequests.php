<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Circle;
use App\Models\Consumer;
use App\Models\Division;
use App\Models\Dtr;
use App\Models\Feeder;
use App\Models\Section;
use App\Models\Subdivision;
use App\Models\User;
use App\Models\Village;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'sidebarCounts' => fn () => $request->user() ? [
                'billCollectors' => User::whereHas('role', fn ($q) => $q->where('name', 'billcollector'))->count(),
                'consumers' => Consumer::count(),
                'categories' => Category::count(),
                'circles' => Circle::count(),
                'divisions' => Division::count(),
                'subdivisions' => Subdivision::count(),
                'sections' => Section::count(),
                'villages' => Village::count(),
                'feeders' => Feeder::count(),
                'dtrs' => Dtr::count(),
            ] : null,
        ];
    }
}
