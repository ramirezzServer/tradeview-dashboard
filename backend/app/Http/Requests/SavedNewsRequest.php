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
            'source'           => ['nullable', 'string'],
            'summary'          => ['nullable', 'string'],
            'category'         => ['nullable', 'string'],
            'article_datetime' => ['nullable', 'integer'],
            'notes'            => ['nullable', 'string'],
        ];
    }
}
