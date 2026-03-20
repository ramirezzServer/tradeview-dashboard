<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CandleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resolution' => ['required', 'string', 'in:1,5,15,30,60,D,W,M'],
            'from'       => ['required', 'integer', 'min:0'],
            'to'         => ['required', 'integer', 'min:0', 'gte:from'],
        ];
    }

    public function messages(): array
    {
        return [
            'resolution.in' => 'Resolution must be one of: 1, 5, 15, 30, 60, D, W, M.',
        ];
    }
}
