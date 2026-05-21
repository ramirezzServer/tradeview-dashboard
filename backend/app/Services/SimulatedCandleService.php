<?php

namespace App\Services;

class SimulatedCandleService
{
    /**
     * @return array{s:string,t:int[],o:float[],h:float[],l:float[],c:float[],v:int[]}
     */
    public function generateCryptoCandles(string $symbol, float $currentPrice, int $from, int $to, string $resolution): array
    {
        $symbol = strtoupper($symbol);
        $currentPrice = max($currentPrice, 0.000001);
        [$count, $step] = $this->candleShape($from, $to, $resolution);
        [$minVolume, $maxVolume] = $this->volumeRange($symbol);

        $timestamps = [];
        for ($i = $count - 1; $i >= 0; $i--) {
            $timestamps[] = $to - ($i * $step);
        }

        $closes = array_fill(0, $count, 0.0);
        $closes[$count - 1] = $currentPrice;

        for ($i = $count - 2; $i >= 0; $i--) {
            $change = $this->fraction($symbol, $from, $to, $i, 'back') * 0.02 - 0.01;
            $closes[$i] = max(0.000001, $closes[$i + 1] / (1 + $change));
        }

        $t = $o = $h = $l = $c = $v = [];
        for ($i = 0; $i < $count; $i++) {
            $open = $i === 0 ? $closes[$i] : $closes[$i - 1];
            $close = $closes[$i];
            $up = 0.001 + ($this->fraction($symbol, $from, $to, $i, 'high') * 0.014);
            $down = 0.001 + ($this->fraction($symbol, $from, $to, $i, 'low') * 0.014);
            $high = max($open, $close) * (1 + $up);
            $low = min($open, $close) * (1 - $down);
            $volume = (int) round($minVolume + $this->fraction($symbol, $from, $to, $i, 'vol') * ($maxVolume - $minVolume));

            $t[] = $timestamps[$i];
            $o[] = $this->roundPrice($open);
            $h[] = $this->roundPrice($high);
            $l[] = $this->roundPrice(max(0.000001, $low));
            $c[] = $this->roundPrice($close);
            $v[] = $volume;
        }

        return ['s' => 'ok', 't' => $t, 'o' => $o, 'h' => $h, 'l' => $l, 'c' => $c, 'v' => $v];
    }

    /**
     * @return array{s:string,t:int[],o:float[],h:float[],l:float[],c:float[],v:int[]}
     */
    public function generateEquityCandles(string $symbol, float $currentPrice, int $from, int $to, string $resolution): array
    {
        $symbol = strtoupper($symbol);
        $currentPrice = max($currentPrice, 0.01);
        [$count, $step] = $this->candleShape($from, $to, $resolution);

        $timestamps = [];
        for ($i = $count - 1; $i >= 0; $i--) {
            $timestamps[] = $to - ($i * $step);
        }

        $closes = array_fill(0, $count, 0.0);
        $closes[$count - 1] = $currentPrice;

        for ($i = $count - 2; $i >= 0; $i--) {
            $change = $this->fraction($symbol, $from, $to, $i, 'equity-back') * 0.018 - 0.009;
            $closes[$i] = max(0.01, $closes[$i + 1] / (1 + $change));
        }

        $t = $o = $h = $l = $c = $v = [];
        for ($i = 0; $i < $count; $i++) {
            $open = $i === 0 ? $closes[$i] : $closes[$i - 1];
            $close = $closes[$i];
            $up = 0.001 + ($this->fraction($symbol, $from, $to, $i, 'equity-high') * 0.012);
            $down = 0.001 + ($this->fraction($symbol, $from, $to, $i, 'equity-low') * 0.012);

            $t[] = $timestamps[$i];
            $o[] = $this->roundPrice($open);
            $h[] = $this->roundPrice(max($open, $close) * (1 + $up));
            $l[] = $this->roundPrice(max(0.01, min($open, $close) * (1 - $down)));
            $c[] = $this->roundPrice($close);
            $v[] = (int) round(500000 + $this->fraction($symbol, $from, $to, $i, 'equity-vol') * 12000000);
        }

        return ['s' => 'ok', 't' => $t, 'o' => $o, 'h' => $h, 'l' => $l, 'c' => $c, 'v' => $v];
    }

    /**
     * @return array{0:int,1:int}
     */
    private function candleShape(int $from, int $to, string $resolution): array
    {
        $days = max(1, (int) ceil(($to - $from) / 86400));

        if ($resolution === '60' && $days <= 1) {
            return [24, 3600];
        }

        if ($days <= 7) return [7, 86400];
        if ($days <= 31) return [30, 86400];
        return [90, 86400];
    }

    /**
     * @return array{0:int,1:int}
     */
    private function volumeRange(string $symbol): array
    {
        return match ($symbol) {
            'BTC' => [20000, 50000],
            'ETH' => [10000, 30000],
            default => [1000, 10000],
        };
    }

    private function fraction(string $symbol, int $from, int $to, int $index, string $salt): float
    {
        $hex = substr(hash('sha256', "{$symbol}:{$from}:{$to}:{$index}:{$salt}"), 0, 12);
        return hexdec($hex) / 0xffffffffffff;
    }

    private function roundPrice(float $price): float
    {
        return round($price, $price >= 1 ? 2 : 8);
    }
}
