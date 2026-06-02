<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SavedNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->isMethod('PUT')) {
            return [
                'notes' => ['nullable', 'string', 'max:1000'],
            ];
        }

        return [
            'article_url'      => ['required', 'url', 'max:2048'],
            'headline'         => ['required', 'string', 'max:500'],
            'source'           => ['nullable', 'string', 'max:255'],
            'summary'          => ['nullable', 'string', 'max:5000'],
            'category'         => ['nullable', 'string', 'max:50'],
            'article_datetime' => ['nullable', 'integer', 'min:0'],
            'notes'            => ['nullable', 'string', 'max:1000'],
        ];
    }
}
