<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBillCollector
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->role || $user->role->name !== 'billcollector') {
            return response()->json([
                'status' => false,
                'message' => 'Access denied. Bill collector role required.',
            ], 403);
        }

        return $next($request);
    }
}
