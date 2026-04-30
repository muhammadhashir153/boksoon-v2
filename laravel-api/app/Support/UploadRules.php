<?php

namespace App\Support;

use Illuminate\Validation\Rules\File;

final class UploadRules
{
    /**
     * @return array<int, \Illuminate\Contracts\Validation\ValidationRule|string>
     */
    public static function image(int $maxKilobytes = 4096): array
    {
        return [
            'nullable',
            File::image()
                ->types(['jpg', 'jpeg', 'png', 'webp'])
                ->max($maxKilobytes),
        ];
    }

    /**
     * @return array<int, \Illuminate\Contracts\Validation\ValidationRule|string>
     */
    public static function requiredImage(int $maxKilobytes = 4096): array
    {
        return [
            'required',
            File::image()
                ->types(['jpg', 'jpeg', 'png', 'webp'])
                ->max($maxKilobytes),
        ];
    }
}
