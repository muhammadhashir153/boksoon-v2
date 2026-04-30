<?php

namespace App\Console\Commands;

use App\Services\Import\LegacyDumpImporter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class VerifyLegacyDumpImportCommand extends Command
{
    /**
     * @var list<string>
     */
    private const TABLES = [
        'roles',
        'ministry',
        'admin',
        'donations',
        'donors',
        'blogs',
        'books',
        'comments',
        'testimonials',
        'contacts',
        'newsletter',
        'transactions',
        'refresh_tokens',
    ];

    protected $signature = 'ngo:verify-import
        {path? : Optional path to the SQL dump file}
        {--only=* : Limit verification to specific tables}';

    protected $description = 'Compare the legacy SQL dump row counts with the converted Laravel database tables.';

    public function handle(LegacyDumpImporter $importer): int
    {
        $path = (string) ($this->argument('path') ?: config('ngo_api.legacy_dump_staging_path'));
        if ($path === '') {
            $this->error('No dump path provided. Pass a file path or set LEGACY_DUMP_STAGING_PATH.');

            return self::FAILURE;
        }

        $dumpCounts = $importer->summarize($path);
        $tables = self::TABLES;
        $only = array_values(array_filter((array) $this->option('only')));

        if ($only !== []) {
            $tables = array_values(array_intersect($tables, $only));
        }

        if ($tables === []) {
            $this->warn('No matching dump tables found for verification.');

            return self::SUCCESS;
        }

        $rows = [];
        $mismatches = [];

        foreach ($tables as $table) {
            $dumpCount = $dumpCounts[$table] ?? 0;
            $dbCount = DB::table($table)->count();
            $status = $dumpCount === $dbCount ? 'ok' : 'mismatch';

            if ($status !== 'ok') {
                $mismatches[] = $table;
            }

            $rows[] = [$table, $dumpCount, $dbCount, $status];
        }

        $this->table(['Table', 'Dump Rows', 'DB Rows', 'Status'], $rows);

        if ($mismatches !== []) {
            $this->error('Verification found mismatches in: '.implode(', ', $mismatches));

            return self::FAILURE;
        }

        $this->info('Verification passed. The converted Laravel database matches the dump row counts for the checked tables.');

        return self::SUCCESS;
    }
}
