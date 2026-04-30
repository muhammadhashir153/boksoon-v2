<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Donation;
use App\Support\ResourcePresenter;

class DonationController extends ApiController
{
    public function index()
    {
        $donations = Donation::query()
            ->with('admin')
            ->where('is_deleted', false)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Donation $donation) => ResourcePresenter::donation($donation))
            ->all();

        return $this->ok($donations, 'Donations retrieved.');
    }

    public function show(Donation $donation)
    {
        if ($donation->is_deleted) {
            return $this->fail('Donation not found.', 404);
        }

        return $this->ok(ResourcePresenter::donation($donation->load('admin')), 'Donation retrieved.');
    }
}
