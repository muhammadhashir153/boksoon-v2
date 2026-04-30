<?php

namespace App\Console\Commands;

use App\Services\Media\LegacyMediaImporter;
use Illuminate\Console\Command;

class ImportLegacyMediaCommand extends Command
{
    protected $signature = 'ngo:import-legacy-media {--write : Persist rewritten media paths to the database}';

    protected $description = 'Copy legacy frontend media into Laravel storage and optionally rewrite stored paths.';

    public function handle(LegacyMediaImporter $importer): int
    {
        $summary = $importer->import((bool) $this->option('write'));

        $this->info('Legacy media import finished.');
        $this->table(
            ['Scanned', 'Migrated', 'Missing', 'Skipped', 'Mode'],
            [[
                $summary['scanned'],
                $summary['migrated'],
                $summary['missing'],
                $summary['skipped'],
                $this->option('write') ? 'write' : 'dry-run',
            ]]
        );

        return self::SUCCESS;
    }
}
