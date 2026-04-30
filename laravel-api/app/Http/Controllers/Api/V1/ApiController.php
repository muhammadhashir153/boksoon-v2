<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Models\AdminUser;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Auth;

abstract class ApiController extends BaseController
{
    protected function ok(array $data = [], string $message = 'OK', int $status = 200, array $meta = []): JsonResponse
    {
        return ApiResponse::success($data, $message, $status, $meta);
    }

    protected function fail(string $message, int $status = 400, array $errors = [], array $meta = []): JsonResponse
    {
        return ApiResponse::error($message, $status, $errors, $meta);
    }

    protected function actor(): ?AdminUser
    {
        $user = Auth::user();

        return $user instanceof AdminUser ? $user : null;
    }

    protected function actorHasRole(string ...$roles): bool
    {
        $actor = $this->actor();

        return $actor !== null && in_array($actor->role_name, $roles, true);
    }
}
