import { RawOdd, ParsedPrediction } from '../types';

/**
 * Parses a raw database record from the `odds` table into a rich ParsedPrediction.
 * Handles both plain tips like "Home Win" or "Arsenal Win" as well as
 * formatted tips with tags like "[VIP] Over 2.5 Goals [18:30 | Won]".
 */
export function parsePrediction(raw: RawOdd): ParsedPrediction {
  const rawTip = String(raw.tip || '').trim();
  const rawOdds = typeof raw.odds === 'number' ? raw.odds : parseFloat(String(raw.odds)) || 1.85;

  let isVip = false;
  let result: 'pending' | 'won' | 'lost' | 'void' = 'pending';
  let kickoff = '19:00';
  let date = 'Today';
  let status: 'live' | 'upcoming' | 'completed' = 'upcoming';

  let workingTip = rawTip;

  // Check VIP flag
  if (/\[VIP\]/i.test(workingTip)) {
    isVip = true;
    workingTip = workingTip.replace(/\[VIP\]/gi, '').trim();
  }

  // Check result flags
  if (/\[.*?\bwon\b.*?\]/i.test(workingTip) || /\b(won|win)\b$/i.test(workingTip)) {
    result = 'won';
    status = 'completed';
  } else if (/\[.*?\blost\b.*?\]/i.test(workingTip) || /\b(lost|loss)\b$/i.test(workingTip)) {
    result = 'lost';
    status = 'completed';
  } else if (/\[.*?\bvoid\b.*?\]/i.test(workingTip)) {
    result = 'void';
    status = 'completed';
  } else if (/\[.*?\blive\b.*?\]/i.test(workingTip)) {
    status = 'live';
  }

  // Extract kickoff time if present e.g. [18:30 | Today] or [20:00]
  const timeMatch = workingTip.match(/(\d{1,2}:\d{2})/);
  if (timeMatch) {
    kickoff = timeMatch[1];
  }

  // Extract date if present
  if (/today/i.test(workingTip)) {
    date = 'Today';
  } else if (/tomorrow/i.test(workingTip)) {
    date = 'Tomorrow';
  } else if (/upcoming/i.test(workingTip)) {
    date = 'Upcoming';
  }

  // Determine market category from tip text
  let market = '1X2 (Match Winner)';
  if (/over|under|goals/i.test(workingTip)) {
    market = 'Over/Under Goals';
  } else if (/btts|gg|both teams/i.test(workingTip)) {
    market = 'Both Teams To Score';
  } else if (/double chance|1x|x2|12/i.test(workingTip)) {
    market = 'Double Chance';
  } else if (/draw no bet|dnb/i.test(workingTip)) {
    market = 'Draw No Bet';
  } else if (/handicap/i.test(workingTip)) {
    market = 'Handicap';
  } else if (/correct score/i.test(workingTip)) {
    market = 'Correct Score';
  } else if (/ht\/ft|half time/i.test(workingTip)) {
    market = 'Half Time / Full Time';
  }

  // Clean the tip text for clean display
  let cleanTip = workingTip
    .replace(/\[.*?\]/g, '') // remove bracketed metadata
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanTip) {
    cleanTip = rawTip || 'Match Prediction';
  }

  // Calculate dynamic confidence based on odds:
  // Lower odds generally have higher statistical probability
  let confidence = Math.min(96, Math.max(55, Math.round((1 / rawOdds) * 115)));
  if (rawOdds >= 2.5) confidence = Math.min(68, Math.max(50, Math.round((1 / rawOdds) * 130)));

  // If match has a live flag or time is around now
  if (/live/i.test(workingTip) || /\[live\]/i.test(rawTip)) {
    status = 'live';
  }

  return {
    id: raw.id,
    league: raw.league || 'International',
    home: raw.home || 'Home Team',
    away: raw.away || 'Away Team',
    rawTip,
    cleanTip,
    odds: Number(rawOdds.toFixed(2)),
    market,
    kickoff,
    date,
    result,
    isVip,
    status,
    confidence,
  };
}

/**
 * Formats user input from Admin into a string that stores neatly into odds.tip
 */
export function formatTipForDatabase(params: {
  tip: string;
  market?: string;
  kickoff?: string;
  isVip?: boolean;
  result?: string;
  date?: string;
}): string {
  const parts: string[] = [];
  if (params.isVip) parts.push('[VIP]');
  parts.push(params.tip.trim());

  const meta: string[] = [];
  if (params.kickoff) meta.push(params.kickoff);
  if (params.date && params.date !== 'Today') meta.push(params.date);
  if (params.result && params.result !== 'pending') meta.push(params.result);

  if (meta.length > 0) {
    parts.push(`[${meta.join(' | ')}]`);
  }

  return parts.join(' ');
}
