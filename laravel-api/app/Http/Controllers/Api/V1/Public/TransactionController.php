<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Donation;
use App\Models\Models\Donor;
use App\Models\Models\Transaction;
use App\Services\Transactions\TransactionService;
use App\Support\ModelLookup;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TransactionController extends ApiController
{
    public function store(Request $request, TransactionService $service)
    {
        $validated = $request->validate([
            'donation_id' => ['required'],
            'donor_id' => ['nullable'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'currency' => ['nullable', 'string', 'max:3'],
            'status' => ['nullable', 'string', 'max:20'],
            'last_four' => ['nullable', 'string'],
            'card_last_four' => ['nullable', 'string'],
            'card_number' => ['nullable', 'string'],
            'name' => ['nullable', 'string', 'max:255'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'is_hidden' => ['nullable', 'boolean'],
        ]);

        $donation = ModelLookup::find(Donation::class, $validated['donation_id']);
        if (! $donation instanceof Donation) {
            return $this->fail('Donation not found.', Response::HTTP_NOT_FOUND);
        }

        $existingDonor = ModelLookup::find(Donor::class, $validated['donor_id'] ?? null);
        if (($validated['donor_id'] ?? null) && ! $existingDonor instanceof Donor) {
            return $this->fail('Donor not found.', Response::HTTP_NOT_FOUND);
        }

        if (! $existingDonor instanceof Donor) {
            $name = trim((string) ($validated['name'] ?? $validated['full_name'] ?? trim(($validated['first_name'] ?? '').' '.($validated['last_name'] ?? ''))));
            $email = trim((string) ($validated['email'] ?? ''));
            $address = trim((string) ($validated['address'] ?? ''));

            if ($name === '' || $email === '' || $address === '') {
                return $this->fail('Donor name, email, and address are required.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $transaction = DB::transaction(function () use ($validated, $service, $donation, $existingDonor) {
            $donor = $service->upsertDonor($validated, $existingDonor instanceof Donor ? $existingDonor : null);

            $transaction = Transaction::query()->create([
                'donor_id' => $donor->id,
                'donation_id' => $donation->id,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'] ?? 'online',
                'last_four' => $service->normalizeLastFour($validated),
                'currency' => $service->normalizeCurrency($validated['currency'] ?? 'USD'),
                'status' => $service->normalizeStatus($validated['status'] ?? 'completed'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $service->syncDonationTotals($donation);

            return $transaction;
        });

        return $this->ok([
            ...ResourcePresenter::transaction($transaction->fresh(['donor', 'donation'])),
            'raised_amount_after_transaction' => (float) $donation->fresh()->raised_amount,
        ], 'Transaction created.', Response::HTTP_CREATED);
    }
}
