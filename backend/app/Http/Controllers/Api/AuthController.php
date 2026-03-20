<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/auth/register
     *
     * Creates a new user account and returns an API token immediately
     * so the frontend can authenticate without a separate login step.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->validated('name'),
            'email'    => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ], 'Account created successfully.', 201);
    }

    /**
     * POST /api/auth/login
     *
     * Validates credentials and returns a fresh API token.
     * Previous tokens are NOT revoked — the user may be logged in from
     * multiple devices simultaneously. Call logout to revoke the current one.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            return $this->error('Invalid email or password.', 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ], 'Logged in successfully.');
    }

    /**
     * POST /api/auth/logout
     *
     * Revokes only the current token (the one used for this request).
     * Other sessions / devices remain active.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully.');
    }

    /**
     * GET /api/auth/me
     *
     * Returns the currently authenticated user's profile.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->success($this->formatUser($request->user()), 'User fetched successfully.');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function formatUser(User $user): array
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'created_at' => $user->created_at?->toISOString(),
        ];
    }
}
