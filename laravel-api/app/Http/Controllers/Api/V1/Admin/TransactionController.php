<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Donation;
use App\Models\Models\Donor;
use App\Models\Models\Transaction;
use App\Services\Transactions\TransactionService;
use App\Support\ModelLookup;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class TransactionController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $items = Transaction::query()
            ->with(['donor', 'donation'])
            ->where('is_deleted', false)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Transaction $transaction) => ResourcePresenter::transaction($transaction))
            ->all();

        return $this->ok($items, 'Transactions retrieved.');
    }

    public function store(Request $request, TransactionService $service)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

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
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $service->syncDonationTotals($donation);

            return $transaction;
        });

        return $this->ok(ResourcePresenter::transaction($transaction->fresh(['donor', 'donation'])), 'Transaction created.', Response::HTTP_CREATED);
    }

    public function show(Transaction $transaction)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        if ($transaction->is_deleted) {
            return $this->fail('Transaction not found.', Response::HTTP_NOT_FOUND);
        }

        return $this->ok(ResourcePresenter::transaction($transaction->load(['donor', 'donation'])), 'Transaction retrieved.');
    }

    public function update(Request $request, Transaction $transaction, TransactionService $service)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'donation_id' => ['nullable'],
            'donor_id' => ['nullable'],
            'amount' => ['nullable', 'numeric', 'min:0.01'],
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

        DB::transaction(function () use ($validated, $transaction, $service) {
            $originalDonationId = $transaction->donation_id;
            if (array_key_exists('donor_id', $validated) || array_key_exists('email', $validated)) {
                $existingDonor = ModelLookup::find(Donor::class, $validated['donor_id'] ?? null);
                $transaction->donor_id = $service->upsertDonor($validated, $existingDonor instanceof Donor ? $existingDonor : null)->id;
            }

            if (array_key_exists('donation_id', $validated)) {
                $donation = ModelLookup::find(Donation::class, $validated['donation_id']);
                if ($donation instanceof Donation) {
                    $transaction->donation_id = $donation->id;
                }
            }

            if (array_key_exists('amount', $validated)) {
                $transaction->amount = $validated['amount'];
            }
            if (array_key_exists('payment_method', $validated)) {
                $transaction->payment_method = $validated['payment_method'] ?: 'online';
            }
            if (array_key_exists('currency', $validated)) {
                $transaction->currency = $service->normalizeCurrency($validated['currency']);
            }
            if (array_key_exists('status', $validated)) {
                $transaction->status = $service->normalizeStatus($validated['status']);
            }
            if (array_key_exists('last_four', $validated) || array_key_exists('card_last_four', $validated) || array_key_exists('card_number', $validated)) {
                $transaction->last_four = $service->normalizeLastFour($validated);
            }

            $transaction->updated_at = now();
            $transaction->save();

            if ($transaction->donation_id !== $originalDonationId) {
                $oldDonation = Donation::query()->find($originalDonationId);
                if ($oldDonation instanceof Donation) {
                    $service->syncDonationTotals($oldDonation);
                }
            }

            $service->syncDonationTotals($transaction->donation);
        });

        return $this->ok(ResourcePresenter::transaction($transaction->fresh(['donor', 'donation'])), 'Transaction updated.');
    }

    public function destroy(Transaction $transaction, TransactionService $service)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $donation = $transaction->donation;
        $transaction->update([
            'is_deleted' => true,
            'deleted_at' => now(),
            'updated_at' => now(),
        ]);
        Log::notice('transaction.soft_deleted', [
            'actor_id' => $this->actor()?->id,
            'transaction_id' => $transaction->id,
        ]);
        if ($donation) {
            $service->syncDonationTotals($donation);
        }

        return $this->ok(['deleted' => true], 'Transaction moved to trash.');
    }

    public function trash()
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $items = Transaction::query()
            ->with(['donor', 'donation'])
            ->where('is_deleted', true)
            ->orderByDesc('deleted_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Transaction $transaction) => ResourcePresenter::transaction($transaction))
            ->all();

        return $this->ok($items, 'Transaction trash retrieved.');
    }

    public function restore(Transaction $transaction, TransactionService $service)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $transaction->update([
            'is_deleted' => false,
            'deleted_at' => null,
            'updated_at' => now(),
        ]);

        if ($transaction->donation) {
            $service->syncDonationTotals($transaction->donation);
        }
        Log::info('transaction.restored', [
            'actor_id' => $this->actor()?->id,
            'transaction_id' => $transaction->id,
        ]);

        return $this->ok(ResourcePresenter::transaction($transaction->fresh(['donor', 'donation'])), 'Transaction restored from trash.');
    }

    public function forceDelete(Transaction $transaction, TransactionService $service)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $donation = $transaction->donation;
        $transaction->delete();
        if ($donation) {
            $service->syncDonationTotals($donation);
        }
        Log::notice('transaction.force_deleted', [
            'actor_id' => $this->actor()?->id,
            'transaction_id' => $transaction->id,
        ]);

        return $this->ok(['deleted' => true], 'Transaction permanently deleted.');
    }
}
