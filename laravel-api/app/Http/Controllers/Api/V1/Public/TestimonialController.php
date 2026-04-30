<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Testimonial;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;

class TestimonialController extends ApiController
{
    public function index(Request $request)
    {
        $query = Testimonial::query()->with('author')->orderByDesc('created_at');

        if ($request->filled('limit')) {
            $query->limit(max(1, (int) $request->integer('limit')));
        }

        $testimonials = $query->get()
            ->map(fn (Testimonial $testimonial) => ResourcePresenter::testimonial($testimonial))
            ->all();

        return $this->ok($testimonials, 'Testimonials retrieved.');
    }
}
