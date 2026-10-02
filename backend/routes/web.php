<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

/**
 * Single Page Application (React) Catch-All Route.
 *
 * Any web route (excluding /api and /storage) serves the compiled React application.
 * This ensures direct URL access and browser refreshes work flawlessly on live servers.
 */
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (File::exists($indexPath)) {
        return Response::file($indexPath, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
    return view('welcome');
})->where('any', '^(?!api|storage).*$');
