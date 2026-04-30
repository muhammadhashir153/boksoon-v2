<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Donation;
use App\Support\MediaManager;
use App\Support\ResourcePresenter;
use App\Support\UploadRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DonationController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $items = Donation::query()
            ->with('admin')
            ->where('is_deleted', false)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Donation $donation) => ResourcePresenter::donation($donation))
            ->all();

        return $this->ok($items, 'Donations retrieved.');
    }

    public function store(Request $request)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'target_amount' => ['required', 'numeric', 'min:0.01'],
            'placeholder' => UploadRules::image(),
        ]);

        $donation = Donation::query()->create([
            ...$validated,
            'admin_id' => $this->actor()?->id,
            'placeholder' => MediaManager::store($request->file('placeholder'), 'media/donations'),
            'is_deleted' => false,
        ]);

        return $this->ok(ResourcePresenter::donation($donation->load('admin')), 'Donation created.', Response::HTTP_CREATED);
    }

    public function show(Donation $donation)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        if ($donation->is_deleted) {
            return $this->fail('Donation not found.', Response::HTTP_NOT_FOUND);
        }

        return $this->ok(ResourcePresenter::donation($donation->load('admin')), 'Donation retrieved.');
    }

    public function update(Request $request, Donation $donation)
    {
        if ($this->isUnsupportedMultipartPatch($request)) {
            return $this->fail(
                'Use POST /api/v1/admin/donations/{donation} for multipart donation updates. PHP does not reliably parse multipart PATCH requests.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'target_amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'placeholder' => UploadRules::image(),
        ]);

        $donation->fill(collect($validated)->except('placeholder')->all());
        if ($request->hasFile('placeholder')) {
            $donation->placeholder = MediaManager::store($request->file('placeholder'), 'media/donations', $donation->placeholder);
        }
        $donation->save();

        return $this->ok(ResourcePresenter::donation($donation->fresh('admin')), 'Donation updated.');
    }

    public function destroy(Donation $donation)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $donation->update([
            'is_deleted' => true,
            'deleted_at' => now(),
            'updated_at' => now(),
        ]);
        Log::notice('donation.soft_deleted', [
            'actor_id' => $this->actor()?->id,
            'donation_id' => $donation->id,
        ]);

        return $this->ok(['deleted' => true], 'Donation moved to trash.');
    }

    public function trash()
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $items = Donation::query()
            ->with('admin')
            ->where('is_deleted', true)
            ->orderByDesc('deleted_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Donation $donation) => ResourcePresenter::donation($donation))
            ->all();

        return $this->ok($items, 'Donation trash retrieved.');
    }

    public function restore(Donation $donation)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $donation->update([
            'is_deleted' => false,
            'deleted_at' => null,
            'updated_at' => now(),
        ]);
        Log::info('donation.restored', [
            'actor_id' => $this->actor()?->id,
            'donation_id' => $donation->id,
        ]);

        return $this->ok(ResourcePresenter::donation($donation->fresh('admin')), 'Donation restored from trash.');
    }

    public function forceDelete(Donation $donation)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        if ($donation->transactions()->exists()) {
            return $this->fail('Cannot permanently delete a donation while transactions still exist. Remove the related transactions from trash first.', Response::HTTP_CONFLICT);
        }

        MediaManager::delete($donation->placeholder);
        $donation->delete();
        Log::notice('donation.force_deleted', [
            'actor_id' => $this->actor()?->id,
            'donation_id' => $donation->id,
        ]);

        return $this->ok(['deleted' => true], 'Donation permanently deleted.');
    }

    private function isUnsupportedMultipartPatch(Request $request): bool
    {
        $contentType = (string) $request->header('Content-Type', '');

        return in_array($request->method(), ['PATCH', 'PUT'], true)
            && str_contains(strtolower($contentType), 'multipart/form-data');
    }
}
