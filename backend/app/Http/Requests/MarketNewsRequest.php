<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarketNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['sometimes', 'string', 'in:general,forex,crypto,merger'],
            'minId'    => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
