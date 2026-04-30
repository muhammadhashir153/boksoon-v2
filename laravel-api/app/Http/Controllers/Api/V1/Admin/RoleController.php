<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Role;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $roles = Role::query()->orderBy('name')->get()->map(fn (Role $role) => ResourcePresenter::role($role))->all();

        return $this->ok($roles, 'Roles retrieved.');
    }

    public function store(Request $request)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $role = Role::query()->create($validated);

        return $this->ok(ResourcePresenter::role($role), 'Role created.', Response::HTTP_CREATED);
    }

    public function show(Role $role)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        return $this->ok(ResourcePresenter::role($role), 'Role retrieved.');
    }

    public function update(Request $request, Role $role)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $role->update($validated);

        return $this->ok(ResourcePresenter::role($role), 'Role updated.');
    }

    public function destroy(Role $role)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $role->delete();

        return $this->ok(['deleted' => true], 'Role deleted.');
    }
}
