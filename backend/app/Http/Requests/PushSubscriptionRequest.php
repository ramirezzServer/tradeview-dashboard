<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PushSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'endpoint' => ['required', 'url', 'max:2048'],
            'keys' => [$this->isMethod('POST') ? 'required' : 'sometimes', 'array'],
            'keys.p256dh' => [$this->isMethod('POST') ? 'required' : 'sometimes', 'string', 'max:4096'],
            'keys.auth' => [$this->isMethod('POST') ? 'required' : 'sometimes', 'string', 'max:512'],
        ];
    }
}
