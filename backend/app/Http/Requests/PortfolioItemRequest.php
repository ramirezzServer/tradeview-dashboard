<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PortfolioItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isPost = $this->isMethod('POST');

        return [
            'symbol'       => [$isPost ? 'required' : 'sometimes', 'string', 'regex:/^[A-Z0-9.:\-]{1,20}$/'],
            // quantity: supports fractional shares (e.g. 0.5 BTC)
            'quantity'     => [$isPost ? 'required' : 'sometimes', 'numeric', 'min:0.00000001'],
            // average_cost: the average price paid per share/unit
            'average_cost' => [$isPost ? 'required' : 'sometimes', 'numeric', 'min:0'],
            'currency'     => ['sometimes', 'string', 'size:3'],
            'purchased_at' => ['sometimes', 'nullable', 'date'],
            'notes'        => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'symbol.regex'    => 'Symbol must contain only uppercase letters, digits, dots, colons, or hyphens.',
            'quantity.min'    => 'Quantity must be greater than zero.',
            'average_cost.min' => 'Average cost must be a positive number.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('symbol')) {
            $this->merge(['symbol' => strtoupper(trim($this->input('symbol', '')))]);
        }

        if ($this->has('currency')) {
            $this->merge(['currency' => strtoupper(trim($this->input('currency', 'USD')))]);
        }
    }
}
