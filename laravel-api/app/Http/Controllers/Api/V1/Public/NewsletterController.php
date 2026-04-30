<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Newsletter;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class NewsletterController extends ApiController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', Rule::unique('newsletter', 'email')],
        ], [
            'email.unique' => 'This email is already subscribed to the newsletter.',
        ]);

        $newsletter = Newsletter::query()->create([
            'email' => $validated['email'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->ok(ResourcePresenter::newsletter($newsletter), 'Email subscribed successfully.', Response::HTTP_CREATED);
    }
}
