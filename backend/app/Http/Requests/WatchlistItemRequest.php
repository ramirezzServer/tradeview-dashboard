<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WatchlistItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Symbol is required only when adding a new item
            'symbol'     => [$this->isMethod('POST') ? 'required' : 'sometimes', 'string', 'max:20', 'regex:/^[A-Z0-9.:\-]{1,20}$/'],
            'notes'      => ['sometimes', 'nullable', 'string', 'max:500'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'symbol.regex' => 'Symbol must contain only uppercase letters, digits, dots, colons, or hyphens.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('symbol')) {
            $this->merge(['symbol' => strtoupper(trim($this->input('symbol', '')))]);
        }
    }
}
