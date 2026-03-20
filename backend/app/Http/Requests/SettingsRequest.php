<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'theme'                    => ['sometimes', 'string', 'in:dark,light'],
            'currency'                 => ['sometimes', 'string', 'size:3'],
            'default_resolution'       => ['sometimes', 'string', 'in:1,5,15,30,60,D,W,M'],
            'default_symbol'           => ['sometimes', 'string', 'max:20', 'regex:/^[A-Z0-9.:\-]{1,20}$/'],
            'preferred_news_category'  => ['sometimes', 'string', 'in:general,forex,crypto,merger'],
            'dashboard_layout'         => ['sometimes', 'nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'theme.in'                   => 'Theme must be dark or light.',
            'default_resolution.in'      => 'Resolution must be one of: 1, 5, 15, 30, 60, D, W, M.',
            'preferred_news_category.in' => 'News category must be: general, forex, crypto, or merger.',
            'default_symbol.regex'       => 'Default symbol must contain only uppercase letters, digits, dots, colons, or hyphens.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('default_symbol')) {
            $this->merge(['default_symbol' => strtoupper(trim($this->input('default_symbol', '')))]);
        }

        if ($this->has('currency')) {
            $this->merge(['currency' => strtoupper(trim($this->input('currency', 'USD')))]);
        }
    }
}
