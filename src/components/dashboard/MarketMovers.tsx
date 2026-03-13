import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { topGainers, topLosers, trending } from '@/data/mockStockData';
import { MarketMover } from '@/types/stock';

function MoverRow({ m }: { m: MarketMover }) {
  const positive = m.changePercent >= 0;
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div>
        <p className="text-sm font-medium text-foreground">{m.symbol}</p>
        <p className="text-xs text-muted-foreground">{m.name}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">${m.price.toFixed(2)}</span>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-bull' : 'text-bear'}`}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? '+' : ''}{m.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export function MarketMovers() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Market Movers</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <Tabs defaultValue="gainers">
          <TabsList className="h-8 w-full bg-secondary">
            <TabsTrigger value="gainers" className="text-xs flex-1">Gainers</TabsTrigger>
            <TabsTrigger value="losers" className="text-xs flex-1">Losers</TabsTrigger>
            <TabsTrigger value="trending" className="text-xs flex-1">Trending</TabsTrigger>
          </TabsList>
          <TabsContent value="gainers" className="mt-2 divide-y divide-border">
            {topGainers.map(m => <MoverRow key={m.symbol} m={m} />)}
          </TabsContent>
          <TabsContent value="losers" className="mt-2 divide-y divide-border">
            {topLosers.map(m => <MoverRow key={m.symbol} m={m} />)}
          </TabsContent>
          <TabsContent value="trending" className="mt-2 divide-y divide-border">
            {trending.map(m => <MoverRow key={m.symbol} m={m} />)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
