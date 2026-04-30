<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Newsletter;
use App\Support\ResourcePresenter;
use Symfony\Component\HttpFoundation\Response;

class NewsletterController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $newsletters = Newsletter::query()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Newsletter $newsletter) => ResourcePresenter::newsletter($newsletter))
            ->all();

        return $this->ok($newsletters, 'Newsletter subscriptions retrieved.');
    }

    public function show(Newsletter $newsletter)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        return $this->ok(ResourcePresenter::newsletter($newsletter), 'Newsletter subscription retrieved.');
    }
}
