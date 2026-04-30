<?php

namespace App\Services\Transactions;

use App\Models\Models\Donation;
use App\Models\Models\Donor;
use App\Models\Models\Transaction;

final class TransactionService
{
    public function normalizeStatus(null|string $value): string
    {
        $aliases = [
            'complete' => 'completed',
            'completed' => 'completed',
            'completet' => 'completed',
            'cancel' => 'cancelled',
            'canceled' => 'cancelled',
            'cancelled' => 'cancelled',
            'refund' => 'refunded',
            'refunded' => 'refunded',
            'failed' => 'failed',
            'pending' => 'pending',
        ];

        return $aliases[strtolower(trim((string) $value))] ?? 'pending';
    }

    public function normalizeCurrency(null|string $value): string
    {
        $currency = strtoupper(trim((string) ($value ?: 'USD')));

        return $currency !== '' ? substr($currency, 0, 3) : 'USD';
    }

    public function normalizeLastFour(array $data): ?string
    {
        $candidate = $data['last_four'] ?? $data['card_last_four'] ?? $data['card_number'] ?? null;
        if (! $candidate) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $candidate);

        return $digits !== '' ? substr($digits, -4) : null;
    }

    public function upsertDonor(array $data, ?Donor $existing = null): Donor
    {
        $name = trim((string) ($data['name'] ?? $data['full_name'] ?? trim(($data['first_name'] ?? '').' '.($data['last_name'] ?? ''))));
        $email = trim((string) ($data['email'] ?? ''));
        $phoneNumber = trim((string) ($data['phone_number'] ?? $data['number'] ?? ''));
        $address = trim((string) ($data['address'] ?? ''));
        $isHidden = filter_var($data['is_hidden'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if ($existing) {
            $name = $name !== '' ? $name : (string) $existing->name;
            $email = $email !== '' ? $email : (string) $existing->email;
            $phoneNumber = $phoneNumber !== '' ? $phoneNumber : (string) $existing->phone_number;
            $address = $address !== '' ? $address : (string) $existing->address;
        }

        $donor = $existing ?: Donor::query()->firstOrNew(['email' => $email]);
        $donor->fill([
            'name' => $name,
            'email' => $email,
            'phone_number' => $phoneNumber !== '' ? $phoneNumber : null,
            'address' => $address,
            'is_hidden' => $isHidden,
        ]);
        $donor->save();

        return $donor;
    }

    public function syncDonationTotals(Donation $donation): void
    {
        $donation->raised_amount = max(0, (float) Transaction::query()
            ->where('donation_id', $donation->id)
            ->where('is_deleted', false)
            ->where('status', 'completed')
            ->sum('amount'));

        $donation->save();
    }
}
