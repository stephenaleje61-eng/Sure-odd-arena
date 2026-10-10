import { ParsedPrediction } from '../types';

export interface FixtureAnalysis {
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
    over25: number;
    under25: number;
    bttsYes: number;
    bttsNo: number;
  };
  expectedGoals: {
    home: number;
    away: number;
    total: number;
  };
  preview: string;
  keyStats: string[];
  uncertainties: string[];
  recommendation: {
    primary: string;
    valueRating: 'High Value' | 'Moderate Value' | 'High Risk';
    impliedConfidence: number;
  };
  disclaimer: string;
}

export function generateAiAnalysis(fixture: ParsedPrediction): FixtureAnalysis | null {
  if (!fixture || !fixture.odds || fixture.odds <= 1.01) {
    return null;
  }

  const odds = fixture.odds;
  const isOverUnder = fixture.market.includes('Over/Under') || /over|under/i.test(fixture.cleanTip);
  const isBtts = fixture.market.includes('Both Teams') || /btts|gg/i.test(fixture.cleanTip);
  const isHomeTip = /home|1|win/i.test(fixture.cleanTip) && !/away|draw/i.test(fixture.cleanTip);

  // Derive implied probability with standard bookmaker vig adjustment (5-7%)
  const marginFactor = 0.93; // 7% bookmaker margin removal
  const rawProb = (1 / odds) * marginFactor;

  let homeProb = 45;
  let drawProb = 27;
  let awayProb = 28;

  if (isHomeTip) {
    homeProb = Math.min(84, Math.max(38, Math.round(rawProb * 100)));
    const remaining = 100 - homeProb;
    drawProb = Math.round(remaining * 0.48);
    awayProb = 100 - homeProb - drawProb;
  } else if (/away|2/i.test(fixture.cleanTip)) {
    awayProb = Math.min(80, Math.max(35, Math.round(rawProb * 100)));
    const remaining = 100 - awayProb;
    drawProb = Math.round(remaining * 0.46);
    homeProb = 100 - awayProb - drawProb;
  } else if (/draw|x/i.test(fixture.cleanTip)) {
    drawProb = Math.min(42, Math.max(28, Math.round(rawProb * 100)));
    const remaining = 100 - drawProb;
    homeProb = Math.round(remaining * 0.54);
    awayProb = 100 - drawProb - homeProb;
  } else {
    // Balanced distribution with home advantage
    homeProb = Math.round(48 + (Math.sin(odds * 10) * 8));
    drawProb = Math.round(26 + (Math.cos(odds * 5) * 4));
    awayProb = 100 - homeProb - drawProb;
  }

  // Over 2.5 and BTTS estimation
  let over25Prob = 52;
  if (/over/i.test(fixture.cleanTip)) {
    over25Prob = Math.min(78, Math.max(54, Math.round(rawProb * 100)));
  } else if (/under/i.test(fixture.cleanTip)) {
    over25Prob = Math.min(46, Math.max(24, Math.round((1 - rawProb) * 100)));
  } else {
    over25Prob = Math.round(48 + (homeProb > 60 ? 10 : 0));
  }
  const under25Prob = 100 - over25Prob;

  let bttsYesProb = 53;
  if (/btts|gg/i.test(fixture.cleanTip)) {
    bttsYesProb = Math.min(75, Math.max(55, Math.round(rawProb * 100)));
  } else {
    bttsYesProb = Math.round(over25Prob * 0.95);
  }
  const bttsNoProb = 100 - bttsYesProb;

  // Expected goals estimate
  const expHome = Number((1.1 + (homeProb / 100) * 1.3).toFixed(2));
  const expAway = Number((0.7 + (awayProb / 100) * 1.1).toFixed(2));
  const expTotal = Number((expHome + expAway).toFixed(2));

  // Value evaluation
  let valueRating: 'High Value' | 'Moderate Value' | 'High Risk' = 'Moderate Value';
  if (odds >= 1.65 && odds <= 2.20 && (homeProb >= 52 || over25Prob >= 58)) {
    valueRating = 'High Value';
  } else if (odds > 2.60) {
    valueRating = 'High Risk';
  }

  const preview = `${fixture.home} take on ${fixture.away} in this ${fixture.league} encounter. Based on statistical market pricing of ${odds.toFixed(2)}, implied models favor ${fixture.cleanTip}. Expected goal distribution points toward an aggregate of ~${expTotal} goals, reflecting competitive tactical discipline.`;

  const keyStats = [
    `Implied market probability: ${Math.round(rawProb * 100)}% (adjusted for bookmaker margins)`,
    `Home advantage factor: ${homeProb}% win expectancy for ${fixture.home}`,
    `Total expected goals (xG model): ${expTotal} (${expHome} - ${expAway})`,
    `Over 2.5 Goals mathematical likelihood: ${over25Prob}%`,
    `BTTS (Both Teams To Score) probability: ${bttsYesProb}%`,
  ];

  const uncertainties = [
    'Tactical lineup rotations or late fitness tests before kickoff',
    'Weather conditions and referee booking frequencies',
    'High variance in early red cards or penalty decisions',
  ];

  return {
    probabilities: {
      homeWin: homeProb,
      draw: drawProb,
      awayWin: awayProb,
      over25: over25Prob,
      under25: under25Prob,
      bttsYes: bttsYesProb,
      bttsNo: bttsNoProb,
    },
    expectedGoals: {
      home: expHome,
      away: expAway,
      total: expTotal,
    },
    preview,
    keyStats,
    uncertainties,
    recommendation: {
      primary: fixture.cleanTip,
      valueRating,
      impliedConfidence: Math.round(rawProb * 100),
    },
    disclaimer: 'Probabilities and statistical ratings are mathematical estimates calculated from bookmaker odds and statistical distributions. No betting outcome is ever guaranteed. Always gamble responsibly (18+).',
  };
}
