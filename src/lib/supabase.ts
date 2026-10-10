import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://wbwramyjxeogizylfxwu.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_wJwVmd3Gp2oqen_VzK9NDg_QLe8fFlM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface PredictionOdd {
  id: string | number;
  league: string;
  home: string;
  away: string;
  tip: string;
  odds: number | string;
  // Optional columns that may be stored or calculated
  date?: string;
  kickoff?: string;
  market?: string;
  result?: 'pending' | 'won' | 'lost' | 'void' | string;
  is_vip?: boolean;
  status?: 'live' | 'upcoming' | 'completed' | 'postponed' | string;
  country?: string;
  score?: string;
  home_logo?: string;
  away_logo?: string;
  confidence?: number;
  created_at?: string;
}

export interface ChatMessage {
  id: string | number;
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
  form?: ('W' | 'D' | 'L')[];
}
