<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Contact;
use App\Support\ResourcePresenter;
use Symfony\Component\HttpFoundation\Response;

class ContactController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $contacts = Contact::query()
            ->latest('created_at')
            ->get()
            ->map(fn (Contact $contact) => ResourcePresenter::contact($contact))
            ->all();

        return $this->ok($contacts, 'Contacts retrieved.');
    }

    public function show(Contact $contact)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        return $this->ok(ResourcePresenter::contact($contact), 'Contact retrieved.');
    }
}
