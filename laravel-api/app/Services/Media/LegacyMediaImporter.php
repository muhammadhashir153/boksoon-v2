<?php

namespace App\Services\Media;

use App\Models\Models\AdminUser;
use App\Models\Models\Blog;
use App\Models\Models\Book;
use App\Models\Models\Donation;
use App\Support\MediaManager;
use Illuminate\Database\Eloquent\Model;

final class LegacyMediaImporter
{
    /**
     * @return array{scanned:int,migrated:int,missing:int,skipped:int}
     */
    public function import(bool $write = false): array
    {
        $summary = ['scanned' => 0, 'migrated' => 0, 'missing' => 0, 'skipped' => 0];

        foreach ($this->mappings() as [$modelClass, $field, $directory]) {
            $modelClass::query()->whereNotNull($field)->chunk(100, function ($records) use (&$summary, $field, $directory, $write): void {
                foreach ($records as $record) {
                    $summary['scanned']++;

                    $current = (string) $record->{$field};
                    $normalized = MediaManager::normalizeStoredPath($current);
                    if (! $normalized || ! str_starts_with($normalized, 'assets/')) {
                        $summary['skipped']++;
                        continue;
                    }

                    $migrated = MediaManager::migrateLegacyPath($normalized, $directory);
                    if (! $migrated) {
                        $summary['missing']++;
                        continue;
                    }

                    if ($write && $migrated !== $current) {
                        $record->{$field} = $migrated;
                        $record->save();
                    }

                    $summary['migrated']++;
                }
            });
        }

        return $summary;
    }

    /**
     * @return array<int, array{class-string<Model>, string, string}>
     */
    private function mappings(): array
    {
        return [
            [AdminUser::class, 'dp', 'media/profile'],
            [Donation::class, 'placeholder', 'media/donations'],
            [Blog::class, 'banner_image', 'media/blogs'],
            [Book::class, 'cover_image', 'media/books'],
        ];
    }
}
