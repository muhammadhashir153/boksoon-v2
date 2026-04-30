<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class PrepareLegacyDumpImportCommand extends Command
{
    protected $signature = 'ngo:prepare-legacy-dump {path? : Optional path to the SQL dump file}';

    protected $description = 'Validate the configured legacy dump path and prepare for the later schema conversion pass.';

    public function handle(): int
    {
        $path = (string) ($this->argument('path') ?: config('ngo_api.legacy_dump_staging_path'));

        if ($path === '') {
            $this->warn('No legacy dump path is configured yet. Set LEGACY_DUMP_STAGING_PATH or pass a path explicitly.');

            return self::SUCCESS;
        }

        if (! is_file($path)) {
            $this->error("Legacy dump not found at: {$path}");

            return self::FAILURE;
        }

        $this->info('Legacy dump file detected.');
        $this->line("Path: {$path}");
        $this->line('Next phase will map this dump into the strict UUID-first Laravel schema and rewrite media paths into API storage.');

        return self::SUCCESS;
    }
}
