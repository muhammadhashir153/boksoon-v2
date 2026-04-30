<?php

namespace App\Services\Import;

use App\Support\MediaManager;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use RuntimeException;

final class LegacyDumpImporter
{
    /** @var array<string, array<int, string>> */
    private array $idMaps = [];

    /**
     * @return array{tables:array<string,int>, rows_imported:int, media:array{scanned:int,migrated:int,missing:int,skipped:int}}
     */
    public function import(string $path, bool $fresh = false): array
    {
        $rowsByTable = $this->readDumpRows($path);
        $summary = [
            'tables' => [],
            'rows_imported' => 0,
            'media' => ['scanned' => 0, 'migrated' => 0, 'missing' => 0, 'skipped' => 0],
        ];

        if ($fresh) {
            $this->truncateAll();
        }

        DB::transaction(function () use ($rowsByTable, &$summary): void {
            foreach (['roles', 'ministry', 'admin', 'donations', 'donors', 'blogs', 'books', 'comments', 'testimonials', 'contacts', 'newsletter', 'transactions', 'refresh_tokens'] as $table) {
                $rows = $rowsByTable[$table] ?? [];
                $summary['tables'][$table] = count($rows);
                foreach ($rows as $row) {
                    $insert = $this->mapRow($table, $row, $summary['media']);
                    if ($insert === null) {
                        continue;
                    }

                    DB::table($table)->updateOrInsert(['id' => $insert['id']], $insert);
                    $summary['rows_imported']++;
                }
            }
        });

        return $summary;
    }

    /**
     * @return array<string, int>
     */
    public function summarize(string $path): array
    {
        return array_map(
            static fn (array $rows): int => count($rows),
            $this->readDumpRows($path)
        );
    }

    /**
     * @return array<string, list<array<string, mixed>>>
     */
    private function readDumpRows(string $path): array
    {
        if (! is_file($path)) {
            throw new RuntimeException("Legacy dump not found at: {$path}");
        }

        $content = (string) file_get_contents($path);

        return $this->parseInserts($content);
    }

    /**
     * @return array<string, list<array<string, mixed>>>
     */
    private function parseInserts(string $content): array
    {
        $rowsByTable = [];
        foreach ($this->extractInsertStatements($content) as $statement) {
            if (! preg_match('/^INSERT INTO `(?<table>[^`]+)` \((?<columns>[^)]+)\) VALUES\s*(?<values>.*)$/s', $statement, $match)) {
                continue;
            }

            $table = $match['table'];
            $columns = array_map(
                static fn (string $column): string => trim($column, " `\t\n\r\0\x0B"),
                explode(',', $match['columns'])
            );

            foreach ($this->splitTuples($match['values']) as $tuple) {
                $values = $this->parseTuple($tuple);
                if (count($values) !== count($columns)) {
                    continue;
                }

                $rowsByTable[$table][] = array_combine($columns, $values);
            }
        }

        return $rowsByTable;
    }

    /**
     * @return list<string>
     */
    private function extractInsertStatements(string $content): array
    {
        $statements = [];
        $offset = 0;
        $needle = 'INSERT INTO `';

        while (($start = strpos($content, $needle, $offset)) !== false) {
            $inString = false;
            $escaped = false;
            $length = strlen($content);

            for ($i = $start; $i < $length; $i++) {
                $char = $content[$i];

                if ($escaped) {
                    $escaped = false;
                    continue;
                }

                if ($char === '\\') {
                    $escaped = true;
                    continue;
                }

                if ($char === '\'') {
                    $inString = ! $inString;
                    continue;
                }

                if ($char === ';' && ! $inString) {
                    $statements[] = trim(substr($content, $start, $i - $start), " \r\n\t;");
                    $offset = $i + 1;
                    continue 2;
                }
            }

            break;
        }

        return $statements;
    }

    /**
     * @return list<string>
     */
    private function splitTuples(string $valuesBlock): array
    {
        $rows = [];
        $depth = 0;
        $inString = false;
        $escaped = false;
        $buffer = '';

        $length = strlen($valuesBlock);
        for ($i = 0; $i < $length; $i++) {
            $char = $valuesBlock[$i];

            if ($escaped) {
                $buffer .= $char;
                $escaped = false;
                continue;
            }

            if ($char === '\\') {
                $buffer .= $char;
                $escaped = true;
                continue;
            }

            if ($char === '\'') {
                $inString = ! $inString;
                $buffer .= $char;
                continue;
            }

            if (! $inString) {
                if ($char === '(') {
                    $depth++;
                } elseif ($char === ')') {
                    $depth--;
                }
            }

            $buffer .= $char;

            if (! $inString && $depth === 0 && trim($buffer) !== '') {
                $trimmed = trim($buffer);
                if ($trimmed !== ',') {
                    $rows[] = trim($trimmed, ", \r\n\t");
                }
                $buffer = '';
            }
        }

        return array_values(array_filter($rows));
    }

    /**
     * @return list<mixed>
     */
    private function parseTuple(string $tuple): array
    {
        $tuple = trim($tuple);
        $tuple = trim($tuple, '()');

        $values = [];
        $buffer = '';
        $inString = false;
        $escaped = false;

        $length = strlen($tuple);
        for ($i = 0; $i < $length; $i++) {
            $char = $tuple[$i];

            if ($escaped) {
                $buffer .= $char;
                $escaped = false;
                continue;
            }

            if ($char === '\\') {
                $buffer .= $char;
                $escaped = true;
                continue;
            }

            if ($char === '\'') {
                $inString = ! $inString;
                continue;
            }

            if ($char === ',' && ! $inString) {
                $values[] = $this->normalizeValue($buffer);
                $buffer = '';
                continue;
            }

            $buffer .= $char;
        }

        $values[] = $this->normalizeValue($buffer);

        return $values;
    }

    private function normalizeValue(string $raw): mixed
    {
        $value = trim($raw);
        if (strcasecmp($value, 'NULL') === 0) {
            return null;
        }

        $value = str_replace(["\\'", '\\"', '\\r', '\\n', '\\t'], ["'", '"', "\r", "\n", "\t"], $value);

        if (is_numeric($value) && ! preg_match('/^0\d+/', $value)) {
            return str_contains($value, '.') ? (float) $value : (int) $value;
        }

        return $value;
    }

    /**
     * @param array{scanned:int,migrated:int,missing:int,skipped:int} $mediaSummary
     * @return array<string,mixed>|null
     */
    private function mapRow(string $table, array $row, array &$mediaSummary): ?array
    {
        return match ($table) {
            'roles' => $this->mapRole($row),
            'ministry' => $this->mapMinistry($row),
            'admin' => $this->mapAdmin($row, $mediaSummary),
            'donations' => $this->mapDonation($row, $mediaSummary),
            'donors' => $this->mapDonor($row),
            'blogs' => $this->mapBlog($row, $mediaSummary),
            'books' => $this->mapBook($row, $mediaSummary),
            'comments' => $this->mapComment($row),
            'testimonials' => $this->mapTestimonial($row),
            'contacts' => $this->mapContact($row),
            'newsletter' => $this->mapNewsletter($row),
            'transactions' => $this->mapTransaction($row),
            'refresh_tokens' => $this->mapRefreshToken($row),
            default => null,
        };
    }

    private function mapRole(array $row): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('roles', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function mapMinistry(array $row): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('ministry', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function mapAdmin(array $row, array &$mediaSummary): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('admin', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'name' => (string) ($row['name'] ?? 'Unknown User'),
            'email' => (string) $row['email'],
            'dp' => $this->mapMediaPath($row['dp'] ?? null, 'media/profile', $mediaSummary),
            'pass' => (string) $row['pass'],
            'role' => $this->resolveId('roles', (int) $row['role']),
            'ministry_id' => $this->nullableResolvedId('ministry', $row['ministry_id'] ?? null),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function mapDonation(array $row, array &$mediaSummary): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('donations', (int) $row['id'], $id);

        $placeholder = $row['placeholder'] ?? null;
        if (is_string($placeholder) && $placeholder !== '' && ! str_contains($placeholder, '/')) {
            $placeholder = 'assets/img/uploads/'.$placeholder;
        }

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'title' => (string) $row['title'],
            'description' => (string) $row['description'],
            'start_date' => $this->normalizeDate($row['start_date'] ?? null),
            'end_date' => $this->normalizeDate($row['end_date'] ?? null),
            'target_amount' => (float) $row['target_amount'],
            'raised_amount' => (float) ($row['raised_amount'] ?? 0),
            'admin_id' => $this->nullableResolvedId('admin', $row['admin_id'] ?? null),
            'placeholder' => $this->mapMediaPath($placeholder, 'media/donations', $mediaSummary),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function mapDonor(array $row): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('donors', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'email' => (string) $row['email'],
            'phone_number' => $row['phone_number'] ?: null,
            'address' => (string) $row['address'],
            'is_hidden' => (bool) ($row['is_hidden'] ?? false),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function mapBlog(array $row, array &$mediaSummary): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('blogs', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'slug' => (string) $row['slug'],
            'title' => (string) $row['title'],
            'banner_image' => $this->mapMediaPath($row['banner_image'] ?? null, 'media/blogs', $mediaSummary),
            'content' => (string) $row['content'],
            'ministry_id' => $this->resolveId('ministry', (int) $row['ministry_id']),
            'publisher_id' => $this->nullableResolvedId('admin', $row['publisher_id'] ?? null),
            'is_published' => (bool) ($row['is_published'] ?? false),
            'published_at' => $row['published_at'] ?: null,
            'is_deleted' => (bool) ($row['is_deleted'] ?? false),
            'deleted_at' => $row['deleted_at'] ?: null,
            'created_at' => $row['created_at'] ?? now(),
            'updated_at' => $row['updated_at'] ?? now(),
        ];
    }

    private function mapBook(array $row, array &$mediaSummary): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('books', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'title' => (string) $row['title'],
            'slug' => (string) $row['slug'],
            'cover_image' => $this->mapMediaPath($row['cover_image'] ?? null, 'media/books', $mediaSummary),
            'description' => (string) $row['description'],
            'link_url' => (string) $row['link_url'],
            'link_label' => (string) ($row['link_label'] ?? 'Check Out on Amazon'),
            'language' => $row['language'] ?: null,
            'author_name' => (string) ($row['author_name'] ?? 'Boksoon Kim'),
            'sort_order' => (int) ($row['sort_order'] ?? 0),
            'is_published' => (bool) ($row['is_published'] ?? true),
            'is_deleted' => (bool) ($row['is_deleted'] ?? false),
            'added_by' => $this->nullableResolvedId('admin', $row['added_by'] ?? null),
            'created_at' => $row['created_at'] ?? now(),
            'updated_at' => $row['updated_at'] ?? now(),
            'deleted_at' => $row['deleted_at'] ?: null,
        ];
    }

    private function mapComment(array $row): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('comments', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'blog_id' => $this->resolveId('blogs', (int) $row['blog_id']),
            'name' => (string) $row['name'],
            'email' => (string) $row['email'],
            'message' => (string) $row['message'],
            'is_verified' => (bool) ($row['is_verified'] ?? false),
            'is_published' => (bool) ($row['is_published'] ?? false),
            'verification_token' => $row['verification_token'] ?: null,
            'created_at' => $row['created_at'] ?? now(),
            'updated_at' => $row['updated_at'] ?? now(),
        ];
    }

    private function mapTestimonial(array $row): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('testimonials', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'reviewer_name' => (string) $row['reviewer_name'],
            'review' => (string) $row['review'],
            'added_by' => $this->nullableResolvedId('admin', $row['added_by'] ?? null),
            'created_at' => $row['created_at'] ?? now(),
            'updated_at' => $row['updated_at'] ?? now(),
        ];
    }

    private function mapContact(array $row): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('contacts', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'name' => (string) ($row['name'] ?? 'Unknown Contact'),
            'email' => (string) ($row['email'] ?? 'missing@example.invalid'),
            'number' => $row['number'] ?: null,
            'message' => (string) ($row['message'] ?? ''),
            'created_at' => $row['created_at'] ?? now(),
            'updated_at' => $row['created_at'] ?? now(),
        ];
    }

    private function mapNewsletter(array $row): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('newsletter', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'email' => (string) $row['email'],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function mapTransaction(array $row): array
    {
        $id = $this->sourceUuid($row);
        $this->remember('transactions', (int) $row['id'], $id);

        return [
            'id' => $id,
            'legacy_id' => (int) $row['id'],
            'donor_id' => $this->resolveId('donors', (int) $row['donor_id']),
            'amount' => (float) $row['amount'],
            'payment_method' => (string) ($row['payment_method'] ?? 'online'),
            'donation_id' => $this->resolveId('donations', (int) $row['donation_id']),
            'last_four' => $row['last_four'] ?: null,
            'currency' => (string) ($row['currency'] ?? 'USD'),
            'status' => (string) ($row['status'] ?? 'pending'),
            'created_at' => $row['created_at'] ?? now(),
            'updated_at' => $row['updated_at'] ?? now(),
        ];
    }

    private function mapRefreshToken(array $row): array
    {
        return [
            'id' => $this->validUuid($row['uuid'] ?? null) ?? (string) Str::orderedUuid(),
            'admin_uuid' => $this->resolveUuidBySource('admin', $row['admin_uuid'] ?? null),
            'token_hash' => (string) $row['token_hash'],
            'expires_at' => $row['expires_at'] ?? now(),
            'revoked_at' => $row['revoked_at'] ?: null,
            'created_at' => $row['created_at'] ?? now(),
        ];
    }

    private function sourceUuid(array $row): string
    {
        return $this->validUuid($row['uuid'] ?? null) ?? (string) Str::orderedUuid();
    }

    private function validUuid(mixed $value): ?string
    {
        return is_string($value) && Str::isUuid($value) ? $value : null;
    }

    private function remember(string $table, int $legacyId, string $uuid): void
    {
        $this->idMaps[$table][$legacyId] = $uuid;
    }

    private function resolveId(string $table, int $legacyId): string
    {
        if (isset($this->idMaps[$table][$legacyId])) {
            return $this->idMaps[$table][$legacyId];
        }

        $resolved = DB::table($table)->where('legacy_id', $legacyId)->value('id');
        if (! is_string($resolved) || $resolved === '') {
            throw new RuntimeException("Unable to resolve {$table} legacy id {$legacyId}");
        }

        $this->idMaps[$table][$legacyId] = $resolved;

        return $resolved;
    }

    private function nullableResolvedId(string $table, mixed $legacyId): ?string
    {
        if ($legacyId === null || $legacyId === '' || (int) $legacyId === 0) {
            return null;
        }

        return $this->resolveId($table, (int) $legacyId);
    }

    private function resolveUuidBySource(string $table, mixed $uuid): string
    {
        $uuid = $this->validUuid($uuid);
        if (! $uuid) {
            throw new RuntimeException("Invalid source UUID for {$table}");
        }

        $resolved = DB::table($table)->where('id', $uuid)->value('id');
        if (is_string($resolved) && $resolved !== '') {
            return $resolved;
        }

        return $uuid;
    }

    private function normalizeDate(mixed $value): ?string
    {
        if (! is_string($value) || $value === '' || $value === '0000-00-00') {
            return null;
        }

        return $value;
    }

    /**
     * @param array{scanned:int,migrated:int,missing:int,skipped:int} $mediaSummary
     */
    private function mapMediaPath(mixed $path, string $directory, array &$mediaSummary): ?string
    {
        if (! is_string($path) || trim($path) === '') {
            return null;
        }

        $mediaSummary['scanned']++;

        $normalized = MediaManager::normalizeStoredPath($path);
        if (! $normalized) {
            $mediaSummary['skipped']++;
            return null;
        }

        $migrated = MediaManager::migrateLegacyPath($normalized, $directory);
        if ($migrated) {
            $mediaSummary['migrated']++;
            return $migrated;
        }

        if (str_starts_with($normalized, 'assets/')) {
            $mediaSummary['missing']++;
        } else {
            $mediaSummary['skipped']++;
        }

        return $normalized;
    }

    private function truncateAll(): void
    {
        Schema::disableForeignKeyConstraints();
        foreach (['refresh_tokens', 'transactions', 'newsletter', 'contacts', 'testimonials', 'comments', 'books', 'blogs', 'donors', 'donations', 'admin', 'ministry', 'roles'] as $table) {
            DB::table($table)->truncate();
        }
        Schema::enableForeignKeyConstraints();
    }
}
