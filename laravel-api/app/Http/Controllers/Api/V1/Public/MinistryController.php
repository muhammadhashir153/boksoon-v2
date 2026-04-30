<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Ministry;
use App\Support\ResourcePresenter;

class MinistryController extends ApiController
{
    public function index()
    {
        $ministries = Ministry::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Ministry $ministry) => ResourcePresenter::ministry($ministry))
            ->all();

        return $this->ok($ministries, 'Ministries retrieved.');
    }

    public function show(Ministry $ministry)
    {
        return $this->ok(ResourcePresenter::ministry($ministry), 'Ministry retrieved.');
    }
}
