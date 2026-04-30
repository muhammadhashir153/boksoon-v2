<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Testimonial;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TestimonialController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $items = Testimonial::query()->with('author')->orderByDesc('created_at')->get()->map(fn (Testimonial $testimonial) => ResourcePresenter::testimonial($testimonial))->all();

        return $this->ok($items, 'Testimonials retrieved.');
    }

    public function store(Request $request)
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'reviewer_name' => ['required', 'string', 'max:255'],
            'review' => ['required', 'string'],
        ]);

        $testimonial = Testimonial::query()->create([
            ...$validated,
            'added_by' => $this->actor()?->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->ok(ResourcePresenter::testimonial($testimonial->load('author')), 'Testimonial created.', Response::HTTP_CREATED);
    }

    public function show(Testimonial $testimonial)
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        return $this->ok(ResourcePresenter::testimonial($testimonial->load('author')), 'Testimonial retrieved.');
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'reviewer_name' => ['required', 'string', 'max:255'],
            'review' => ['required', 'string'],
        ]);

        $testimonial->update([...$validated, 'updated_at' => now()]);

        return $this->ok(ResourcePresenter::testimonial($testimonial->fresh('author')), 'Testimonial updated.');
    }

    public function destroy(Testimonial $testimonial)
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $testimonial->delete();

        return $this->ok(['deleted' => true], 'Testimonial deleted.');
    }
}
