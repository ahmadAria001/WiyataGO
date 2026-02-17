<?php

namespace App\Http;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class Utils
{
    /**
     * Summary of returnInertia
     */
    public static function returnInertia(RedirectResponse $response, array $message): RedirectResponse
    {
        return $response->with($message);
    }

    public static function returnJson($response, array $jsonContent): JsonResponse
    {
        return response()->json($jsonContent, $response->status());
    }

    /**
     * Summary of determinReturnMethod
     */
    public static function determinReturnMethod(int $statusCode, array $jsonContent): JsonResponse|RedirectResponse
    {
        if (! request()->inertia() && request()->expectsJson()) {
            return self::returnJson(response(status: $statusCode), $jsonContent);
        }

        // Redirects must store status 302 (Found) or similar.
        // We cannot return 422 (Unprocessable Entity) as a redirect status code.
        // Inertia handles validation errors via session, so 302 is appropriate.
        $redirectStatus = ($statusCode >= 300 && $statusCode < 400) ? $statusCode : 302;

        return self::returnInertia(back($redirectStatus), $jsonContent);
    }
}
