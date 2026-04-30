<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Donor;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class DonorController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $items = Donor::query()->orderByDesc('created_at')->get()->map(fn (Donor $donor) => ResourcePresenter::donor($donor))->all();

        return $this->ok($items, 'Donors retrieved.');
    }

    public function store(Request $request)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('donors', 'email')],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'is_hidden' => ['nullable', 'boolean'],
        ], [
            'email.unique' => 'A donor with this email already exists.',
        ]);

        $donor = Donor::query()->create($validated);

        return $this->ok(ResourcePresenter::donor($donor), 'Donor created.', Response::HTTP_CREATED);
    }

    public function show(Donor $donor)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        return $this->ok(ResourcePresenter::donor($donor), 'Donor retrieved.');
    }

    public function update(Request $request, Donor $donor)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('donors', 'email')->ignore($donor->id)],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'required', 'string'],
            'is_hidden' => ['nullable', 'boolean'],
        ], [
            'email.unique' => 'A donor with this email already exists.',
        ]);

        $donor->update($validated);

        return $this->ok(ResourcePresenter::donor($donor), 'Donor updated.');
    }

    public function destroy(Donor $donor)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        if ($donor->transactions()->exists()) {
            return $this->fail('Cannot delete donor with transactions.', Response::HTTP_CONFLICT);
        }

        $donor->delete();

        return $this->ok(['deleted' => true], 'Donor deleted.');
    }
}
