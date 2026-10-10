export interface RawOdd {
  id: number | string;
  league: string;
  home: string;
  away: string;
  tip: string;
  odds: number | string;
}

export interface ParsedPrediction {
  id: number | string;
  league: string;
  home: string;
  away: string;
  rawTip: string;
  cleanTip: string;
  odds: number;
  market: string;
  kickoff: string;
  date: string;
  result: 'pending' | 'won' | 'lost' | 'void';
  isVip: boolean;
  status: 'live' | 'upcoming' | 'completed';
  country?: string;
  confidence: number;
}

export interface ChatMessage {
  id: number | string;
  username: string;
  message: string;
  created_at: string;
  channel?: string;
}

export interface LeagueStanding {
  pos: number;
  team: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: ('W' | 'D' | 'L')[];
}

export interface BookmakerPrice {
  name: 'SportyBet' | 'MSport' | 'Football.com' | 'Bet9ja';
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
  bttsYes: number;
  bttsNo: number;
  payoutMargin: number;
  bookingCodePrefix: string;
}

export interface BetslipItem {
  id: number | string;
  home: string;
  away: string;
  league: string;
  selection: string;
  odds: number;
}
