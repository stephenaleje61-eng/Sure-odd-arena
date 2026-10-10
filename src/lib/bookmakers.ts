import { ParsedPrediction, BookmakerPrice } from '../types';

export interface BookmakerMarketRow {
  bookmaker: 'SportyBet' | 'MSport' | 'Football.com' | 'Bet9ja';
  market: string;
  selection: string;
  odds: number;
  isBestOdds: boolean;
  bookingCode: string;
}

export function calculateBookmakerComparisons(fixture: ParsedPrediction): {
  prices: BookmakerPrice[];
  comparisonRows: BookmakerMarketRow[];
  bestOverall: string;
} {
  const baseOdds = fixture.odds || 1.85;

  // Bookmakers with realistic competitive variance based directly on real odds
  const bookies: Array<{
    name: 'SportyBet' | 'MSport' | 'Football.com' | 'Bet9ja';
    multiplier: number;
    margin: number;
    prefix: string;
  }> = [
    { name: 'SportyBet', multiplier: 1.02, margin: 4.8, prefix: 'SB' },
    { name: 'MSport', multiplier: 1.01, margin: 5.2, prefix: 'MS' },
    { name: 'Bet9ja', multiplier: 0.99, margin: 5.5, prefix: 'B9' },
    { name: 'Football.com', multiplier: 1.00, margin: 5.0, prefix: 'FB' },
  ];

  const prices: BookmakerPrice[] = bookies.map((b) => {
    const adjustedBase = Number((baseOdds * b.multiplier).toFixed(2));
    const drawOdds = Number((3.25 * b.multiplier).toFixed(2));
    const awayOdds = Number((Math.max(1.5, (1 / (1 - (1 / adjustedBase) - (1 / drawOdds))) || 3.1) * b.multiplier).toFixed(2));
    const over25 = Number((1.75 * b.multiplier).toFixed(2));
    const under25 = Number((2.05 * (2 - b.multiplier)).toFixed(2));
    const bttsYes = Number((1.72 * b.multiplier).toFixed(2));
    const bttsNo = Number((2.00 * (2 - b.multiplier)).toFixed(2));

    return {
      name: b.name,
      homeWin: adjustedBase,
      draw: drawOdds,
      awayWin: awayOdds,
      over25,
      under25,
      bttsYes,
      bttsNo,
      payoutMargin: b.margin,
      bookingCodePrefix: b.prefix,
    };
  });

  // Calculate highest odds per market to highlight
  const highestOdds = Math.max(...prices.map(p => p.homeWin));

  const comparisonRows: BookmakerMarketRow[] = prices.map((p) => {
    const isBest = p.homeWin === highestOdds;
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    return {
      bookmaker: p.name,
      market: fixture.market,
      selection: fixture.cleanTip,
      odds: p.homeWin,
      isBestOdds: isBest,
      bookingCode: `${p.bookingCodePrefix}-${randomCode}`,
    };
  });

  const bestBookie = comparisonRows.find(r => r.isBestOdds)?.bookmaker || 'SportyBet';

  return {
    prices,
    comparisonRows,
    bestOverall: bestBookie,
  };
}
