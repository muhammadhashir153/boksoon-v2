<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class MediaManager
{
    public static function store(?UploadedFile $file, string $directory, ?string $currentPath = null): ?string
    {
        if (! $file) {
            return $currentPath;
        }

        if ($currentPath) {
            self::delete($currentPath);
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: 'bin');
        $filename = Str::orderedUuid()->toString().'.'.$extension;

        return $file->storeAs(trim($directory, '/'), $filename, self::disk());
    }

    public static function delete(?string $path): void
    {
        if (! $path || self::isAbsoluteUrl($path)) {
            return;
        }

        Storage::disk(self::disk())->delete(self::normalizeStoredPath($path));
    }

    public static function url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (self::isAbsoluteUrl($path)) {
            return $path;
        }

        $normalized = self::normalizeStoredPath($path);

        if (self::isLegacyAssetPath($normalized)) {
            $migrated = self::migrateLegacyPath($normalized, self::guessLegacyTargetDirectory($normalized));

            return $migrated ? Storage::disk(self::disk())->url($migrated) : null;
        }

        return Storage::disk(self::disk())->url($normalized);
    }

    public static function migrateLegacyPath(?string $path, string $directory): ?string
    {
        if (! $path) {
            return null;
        }

        $relative = self::normalizeStoredPath($path);
        if (! self::isLegacyAssetPath($relative)) {
            return $relative;
        }

        $sourceRoot = rtrim((string) config('ngo_api.legacy_media_source_path'), DIRECTORY_SEPARATOR);
        if ($sourceRoot === '') {
            return null;
        }

        $sourcePath = $sourceRoot.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relative);
        if (! is_file($sourcePath)) {
            return null;
        }

        $basename = pathinfo($sourcePath, PATHINFO_BASENAME);
        $name = pathinfo($basename, PATHINFO_FILENAME);
        $extension = pathinfo($basename, PATHINFO_EXTENSION);
        $safeName = Str::slug($name) ?: 'asset';
        $target = trim($directory, '/').'/'.sha1($relative).'-'.$safeName.($extension !== '' ? '.'.$extension : '');

        $disk = Storage::disk(self::disk());
        if (! $disk->exists($target)) {
            $stream = fopen($sourcePath, 'rb');
            if ($stream === false) {
                return null;
            }

            $disk->put($target, $stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }

        return $target;
    }

    public static function normalizeStoredPath(?string $path): ?string
    {
        if ($path === null) {
            return null;
        }

        $normalized = trim(str_replace('\\', '/', $path));
        if ($normalized === '') {
            return null;
        }

        if (self::isAbsoluteUrl($normalized)) {
            $appUrl = rtrim((string) config('app.url'), '/');
            $legacyBase = rtrim((string) config('ngo_api.legacy_frontend_url'), '/');

            foreach ([$appUrl.'/storage/', $legacyBase.'/'] as $prefix) {
                if ($prefix !== '/' && str_starts_with($normalized, $prefix)) {
                    $normalized = substr($normalized, strlen($prefix));
                    break;
                }
            }
        }

        if (str_starts_with($normalized, '/storage/')) {
            $normalized = substr($normalized, strlen('/storage/'));
        }

        return ltrim($normalized, '/');
    }

    public static function disk(): string
    {
        return (string) config('ngo_api.media_disk', 'public');
    }

    private static function isLegacyAssetPath(string $path): bool
    {
        return str_starts_with($path, 'assets/');
    }

    private static function isAbsoluteUrl(string $path): bool
    {
        return str_starts_with($path, 'http://') || str_starts_with($path, 'https://');
    }

    private static function guessLegacyTargetDirectory(string $path): string
    {
        return match (true) {
            str_contains($path, '/profile') => 'media/profile',
            str_contains($path, '/books') => 'media/books',
            str_contains($path, '/editor') => 'media/editor',
            str_contains($path, '/blog') => 'media/blogs',
            str_contains($path, '/donation') => 'media/donations',
            default => 'media/legacy',
        };
    }
}
