<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Contact;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\Response;

class ContactController extends ApiController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'number' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string'],
        ]);

        $latest = Contact::query()
            ->where('email', $validated['email'])
            ->latest('created_at')
            ->first();

        if ($latest && $latest->created_at?->gt(now()->subHour())) {
            return $this->fail('You have already contacted us. Please try again later.', Response::HTTP_TOO_MANY_REQUESTS);
        }

        Mail::html(
            view('mail.contact', $validated)->render(),
            function ($message): void {
                $message
                    ->to((string) config('mail.from.address'), (string) config('mail.from.name'))
                    ->subject('New Contact Form Submission');
            }
        );

        $contact = Contact::query()->create([
            ...$validated,
            'created_at' => now(),
        ]);

        return $this->ok(ResourcePresenter::contact($contact), 'Contact submitted successfully.', Response::HTTP_CREATED);
    }
}
