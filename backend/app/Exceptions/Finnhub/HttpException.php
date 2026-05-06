<?php

namespace App\Exceptions\Finnhub;

use RuntimeException;

class HttpException extends RuntimeException
{
    public function __construct(public readonly int $status)
    {
        parent::__construct("Finnhub HTTP {$status}");
    }
}
