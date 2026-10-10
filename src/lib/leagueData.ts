import { LeagueStanding } from '../types';
import { supabase } from './supabase';

export interface LeagueInfo {
  id: string;
  name: string;
  country: string;
  flag: string;
  season: string;
  standings: LeagueStanding[];
}

export const DEFAULT_LEAGUE_TABLES: Record<string, LeagueInfo> = {
  'epl': {
    id: 'epl',
    name: 'Premier League',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    season: '2025/2026',
    standings: [
      { pos: 1, team: 'Arsenal', p: 28, w: 20, d: 5, l: 3, gf: 62, ga: 22, gd: 40, pts: 65, form: ['W', 'W', 'W', 'D', 'W'] },
      { pos: 2, team: 'Manchester City', p: 28, w: 19, d: 6, l: 3, gf: 65, ga: 27, gd: 38, pts: 63, form: ['W', 'D', 'W', 'W', 'W'] },
      { pos: 3, team: 'Liverpool', p: 28, w: 18, d: 7, l: 3, gf: 60, ga: 25, gd: 35, pts: 61, form: ['W', 'W', 'D', 'W', 'D'] },
      { pos: 4, team: 'Aston Villa', p: 28, w: 16, d: 5, l: 7, gf: 54, ga: 36, gd: 18, pts: 53, form: ['L', 'W', 'W', 'L', 'W'] },
      { pos: 5, team: 'Tottenham Hotspur', p: 28, w: 15, d: 5, l: 8, gf: 55, ga: 39, gd: 16, pts: 50, form: ['W', 'L', 'W', 'W', 'D'] },
      { pos: 6, team: 'Chelsea', p: 28, w: 14, d: 7, l: 7, gf: 51, ga: 38, gd: 13, pts: 49, form: ['W', 'W', 'D', 'D', 'W'] },
      { pos: 7, team: 'Newcastle United', p: 28, w: 13, d: 6, l: 9, gf: 49, ga: 40, gd: 9, pts: 45, form: ['D', 'W', 'L', 'W', 'L'] },
      { pos: 8, team: 'Manchester United', p: 28, w: 13, d: 5, l: 10, gf: 42, ga: 39, gd: 3, pts: 44, form: ['L', 'W', 'L', 'W', 'W'] },
      { pos: 9, team: 'Brighton & Hove Albion', p: 28, w: 11, d: 9, l: 8, gf: 45, ga: 42, gd: 3, pts: 42, form: ['D', 'D', 'W', 'L', 'D'] },
      { pos: 10, team: 'West Ham United', p: 28, w: 11, d: 7, l: 10, gf: 43, ga: 46, gd: -3, pts: 40, form: ['L', 'D', 'W', 'L', 'W'] },
    ],
  },
  'laliga': {
    id: 'laliga',
    name: 'La Liga',
    country: 'Spain',
    flag: '🇪🇸',
    season: '2025/2026',
    standings: [
      { pos: 1, team: 'Real Madrid', p: 28, w: 21, d: 6, l: 1, gf: 63, ga: 18, gd: 45, pts: 69, form: ['W', 'W', 'D', 'W', 'W'] },
      { pos: 2, team: 'Barcelona', p: 28, w: 20, d: 4, l: 4, gf: 68, ga: 28, gd: 40, pts: 64, form: ['W', 'W', 'W', 'L', 'W'] },
      { pos: 3, team: 'Atletico Madrid', p: 28, w: 17, d: 5, l: 6, gf: 48, ga: 24, gd: 24, pts: 56, form: ['D', 'W', 'W', 'W', 'D'] },
      { pos: 4, team: 'Athletic Club Bilbao', p: 28, w: 15, d: 7, l: 6, gf: 44, ga: 26, gd: 18, pts: 52, form: ['W', 'D', 'W', 'D', 'W'] },
      { pos: 5, team: 'Villarreal', p: 28, w: 14, d: 6, l: 8, gf: 46, ga: 35, gd: 11, pts: 48, form: ['W', 'W', 'L', 'W', 'L'] },
      { pos: 6, team: 'Real Sociedad', p: 28, w: 12, d: 8, l: 8, gf: 38, ga: 29, gd: 9, pts: 44, form: ['D', 'L', 'W', 'D', 'W'] },
    ],
  },
  'seriea': {
    id: 'seriea',
    name: 'Serie A',
    country: 'Italy',
    flag: '🇮🇹',
    season: '2025/2026',
    standings: [
      { pos: 1, team: 'Inter Milan', p: 28, w: 21, d: 4, l: 3, gf: 66, ga: 20, gd: 46, pts: 67, form: ['W', 'W', 'W', 'W', 'D'] },
      { pos: 2, team: 'Juventus', p: 28, w: 17, d: 8, l: 3, gf: 44, ga: 18, gd: 26, pts: 59, form: ['W', 'D', 'W', 'D', 'W'] },
      { pos: 3, team: 'AC Milan', p: 28, w: 17, d: 6, l: 5, gf: 52, ga: 30, gd: 22, pts: 57, form: ['W', 'L', 'W', 'W', 'D'] },
      { pos: 4, team: 'Napoli', p: 28, w: 16, d: 5, l: 7, gf: 46, ga: 28, gd: 18, pts: 53, form: ['D', 'W', 'W', 'L', 'W'] },
      { pos: 5, team: 'Atalanta', p: 28, w: 15, d: 6, l: 7, gf: 55, ga: 34, gd: 21, pts: 51, form: ['W', 'W', 'D', 'W', 'L'] },
      { pos: 6, team: 'AS Roma', p: 28, w: 14, d: 6, l: 8, gf: 45, ga: 33, gd: 12, pts: 48, form: ['W', 'D', 'W', 'L', 'W'] },
    ],
  },
  'bundesliga': {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    flag: '🇩🇪',
    season: '2025/2026',
    standings: [
      { pos: 1, team: 'Bayern Munich', p: 26, w: 20, d: 4, l: 2, gf: 74, ga: 24, gd: 50, pts: 64, form: ['W', 'W', 'W', 'D', 'W'] },
      { pos: 2, team: 'Bayer Leverkusen', p: 26, w: 18, d: 6, l: 2, gf: 63, ga: 26, gd: 37, pts: 60, form: ['W', 'D', 'W', 'W', 'W'] },
      { pos: 3, team: 'Borussia Dortmund', p: 26, w: 16, d: 5, l: 5, gf: 56, ga: 33, gd: 23, pts: 53, form: ['W', 'W', 'L', 'W', 'D'] },
      { pos: 4, team: 'RB Leipzig', p: 26, w: 15, d: 5, l: 6, gf: 52, ga: 30, gd: 22, pts: 50, form: ['L', 'W', 'W', 'D', 'W'] },
      { pos: 5, team: 'Eintracht Frankfurt', p: 26, w: 13, d: 6, l: 7, gf: 47, ga: 38, gd: 9, pts: 45, form: ['W', 'D', 'L', 'W', 'W'] },
    ],
  },
  'ligue1': {
    id: 'ligue1',
    name: 'Ligue 1',
    country: 'France',
    flag: '🇫🇷',
    season: '2025/2026',
    standings: [
      { pos: 1, team: 'Paris Saint-Germain', p: 27, w: 20, d: 5, l: 2, gf: 68, ga: 22, gd: 46, pts: 65, form: ['W', 'W', 'D', 'W', 'W'] },
      { pos: 2, team: 'AS Monaco', p: 27, w: 16, d: 5, l: 6, gf: 52, ga: 32, gd: 20, pts: 53, form: ['W', 'L', 'W', 'W', 'D'] },
      { pos: 3, team: 'Marseille', p: 27, w: 15, d: 6, l: 6, gf: 49, ga: 30, gd: 19, pts: 51, form: ['D', 'W', 'W', 'L', 'W'] },
      { pos: 4, team: 'Lille OSC', p: 27, w: 14, d: 7, l: 6, gf: 44, ga: 27, gd: 17, pts: 49, form: ['W', 'D', 'W', 'D', 'W'] },
    ],
  },
  'ucl': {
    id: 'ucl',
    name: 'UEFA Champions League',
    country: 'Europe',
    flag: '🇪🇺',
    season: '2025/2026',
    standings: [
      { pos: 1, team: 'Liverpool', p: 8, w: 7, d: 1, l: 0, gf: 21, ga: 4, gd: 17, pts: 22, form: ['W', 'W', 'W', 'W', 'D'] },
      { pos: 2, team: 'Inter Milan', p: 8, w: 6, d: 2, l: 0, gf: 17, ga: 3, gd: 14, pts: 20, form: ['W', 'W', 'D', 'W', 'W'] },
      { pos: 3, team: 'Barcelona', p: 8, w: 6, d: 1, l: 1, gf: 22, ga: 9, gd: 13, pts: 19, form: ['W', 'W', 'W', 'L', 'W'] },
      { pos: 4, team: 'Arsenal', p: 8, w: 6, d: 1, l: 1, gf: 18, ga: 6, gd: 12, pts: 19, form: ['W', 'D', 'W', 'W', 'W'] },
      { pos: 5, team: 'Real Madrid', p: 8, w: 5, d: 1, l: 2, gf: 19, ga: 10, gd: 9, pts: 16, form: ['L', 'W', 'W', 'W', 'L'] },
      { pos: 6, team: 'Bayern Munich', p: 8, w: 5, d: 0, l: 3, gf: 20, ga: 11, gd: 9, pts: 15, form: ['W', 'W', 'L', 'W', 'L'] },
    ],
  },
  'npfl': {
    id: 'npfl',
    name: 'Nigeria Premier Football League (NPFL)',
    country: 'Nigeria',
    flag: '🇳🇬',
    season: '2025/2026',
    standings: [
      { pos: 1, team: 'Remo Stars', p: 26, w: 16, d: 3, l: 7, gf: 38, ga: 20, gd: 18, pts: 51, form: ['W', 'W', 'L', 'W', 'W'] },
      { pos: 2, team: 'Rivers United', p: 26, w: 15, d: 5, l: 6, gf: 35, ga: 19, gd: 16, pts: 50, form: ['W', 'D', 'W', 'W', 'L'] },
      { pos: 3, team: 'Enyimba FC', p: 26, w: 14, d: 6, l: 6, gf: 36, ga: 21, gd: 15, pts: 48, form: ['D', 'W', 'W', 'D', 'W'] },
      { pos: 4, team: 'Rangers International', p: 26, w: 13, d: 7, l: 6, gf: 33, ga: 22, gd: 11, pts: 46, form: ['W', 'D', 'D', 'W', 'W'] },
      { pos: 5, team: 'Shooting Stars SC (3SC)', p: 26, w: 12, d: 6, l: 8, gf: 32, ga: 26, gd: 6, pts: 42, form: ['L', 'W', 'W', 'D', 'L'] },
      { pos: 6, team: 'Kano Pillars', p: 26, w: 11, d: 6, l: 9, gf: 34, ga: 31, gd: 3, pts: 39, form: ['W', 'L', 'D', 'W', 'D'] },
      { pos: 7, team: 'Plateau United', p: 26, w: 11, d: 4, l: 11, gf: 30, ga: 28, gd: 2, pts: 37, form: ['D', 'W', 'L', 'L', 'W'] },
      { pos: 8, team: 'Bendel Insurance', p: 26, w: 9, d: 9, l: 8, gf: 24, ga: 23, gd: 1, pts: 36, form: ['D', 'D', 'W', 'D', 'L'] },
    ],
  },
};

export async function fetchLeagueStandings(leagueKey: string): Promise<LeagueStanding[]> {
  try {
    const { data, error } = await supabase
      .from('league_standings')
      .select('*')
      .eq('league', leagueKey)
      .order('pos', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as LeagueStanding[];
    }
  } catch {
    // fallback gracefully to default
  }

  return DEFAULT_LEAGUE_TABLES[leagueKey]?.standings || DEFAULT_LEAGUE_TABLES['epl'].standings;
}
