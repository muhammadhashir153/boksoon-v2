<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Ministry;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MinistryController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $ministries = Ministry::query()->orderBy('name')->get()->map(fn (Ministry $ministry) => ResourcePresenter::ministry($ministry))->all();

        return $this->ok($ministries, 'Ministries retrieved.');
    }

    public function store(Request $request)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $ministry = Ministry::query()->create($validated);

        return $this->ok(ResourcePresenter::ministry($ministry), 'Ministry created.', Response::HTTP_CREATED);
    }

    public function show(Ministry $ministry)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        return $this->ok(ResourcePresenter::ministry($ministry), 'Ministry retrieved.');
    }

    public function update(Request $request, Ministry $ministry)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $ministry->update($validated);

        return $this->ok(ResourcePresenter::ministry($ministry), 'Ministry updated.');
    }

    public function destroy(Ministry $ministry)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $ministry->delete();

        return $this->ok(['deleted' => true], 'Ministry deleted.');
    }
}
