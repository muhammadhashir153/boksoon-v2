<?php

namespace App\Console\Commands;

use App\Services\Import\LegacyDumpImporter;
use Illuminate\Console\Command;

class ImportLegacyDumpCommand extends Command
{
    protected $signature = 'ngo:import-legacy-dump
        {path? : Optional path to the SQL dump file}
        {--fresh : Truncate imported tables before loading the dump}';

    protected $description = 'Convert a legacy SQL dump into the new UUID-first Laravel schema.';

    public function handle(LegacyDumpImporter $importer): int
    {
        $path = (string) ($this->argument('path') ?: config('ngo_api.legacy_dump_staging_path'));
        if ($path === '') {
            $this->error('No dump path provided. Pass a file path or set LEGACY_DUMP_STAGING_PATH.');

            return self::FAILURE;
        }

        $summary = $importer->import($path, (bool) $this->option('fresh'));

        $this->info('Legacy dump imported into the new schema.');

        $rows = [];
        foreach ($summary['tables'] as $table => $count) {
            $rows[] = [$table, $count];
        }

        $this->table(['Table', 'Rows'], $rows);
        $this->table(
            ['Imported Rows', 'Media Scanned', 'Media Migrated', 'Media Missing', 'Media Skipped'],
            [[
                $summary['rows_imported'],
                $summary['media']['scanned'],
                $summary['media']['migrated'],
                $summary['media']['missing'],
                $summary['media']['skipped'],
            ]]
        );

        return self::SUCCESS;
    }
}
