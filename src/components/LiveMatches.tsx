import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tv,
  Clock,
  RefreshCw,
  Search,
  Sparkles,
  Ticket,
  Flame,
  Calendar,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import {
  LiveMatch,
  LEAGUES_CONFIG,
  fetchAllTopLeaguesMatches,
  fetchLeagueScoreboard,
  formatDateParam,
  liveMatchToPrediction
} from '../lib/liveScoreApi';
import { ParsedPrediction, BetslipItem } from '../types';
import { supabase } from '../lib/supabase';

interface LiveMatchesProps {
  initialFilter?: 'live' | 'today' | 'tomorrow' | 'upcoming';
  onAddToBetslip: (prediction: ParsedPrediction) => void;
  onOpenAiAnalysis: (prediction: ParsedPrediction) => void;
  betslipItems?: BetslipItem[];
  isAdminLoggedIn?: boolean;
}

export const LiveMatches: React.FC<LiveMatchesProps> = ({
  initialFilter = 'today',
  onAddToBetslip,
  onOpenAiAnalysis,
  betslipItems = [],
  isAdminLoggedIn = false,
}) => {
  // State
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'live' | 'today' | 'tomorrow' | 'upcoming'>(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [syncedIds, setSyncedIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute date string for ESPN API
  const getDateParamForFilter = useCallback((filter: 'live' | 'today' | 'tomorrow' | 'upcoming'): string | undefined => {
    const today = new Date();
    if (filter === 'live' || filter === 'today') {
      return undefined; // Current day is default
    } else if (filter === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return formatDateParam(tomorrow);
    } else if (filter === 'upcoming') {
      const future = new Date(today);
      future.setDate(today.getDate() + 7);
      return formatDateParam(future);
    }
    return undefined;
  }, []);

  // Fetch real matches
  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const dateParam = getDateParamForFilter(dateFilter);
      let data: LiveMatch[] = [];

      if (selectedLeague === 'all') {
        data = await fetchAllTopLeaguesMatches(dateParam);
      } else {
        data = await fetchLeagueScoreboard(selectedLeague, dateParam);
      }

      setMatches(data);
      setCountdown(30);
    } catch (err) {
      console.error('Error fetching real live score matches:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedLeague, dateFilter, getDateParamForFilter]);

  // Initial and dependencies load
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Auto-refresh timer for real-time scores
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadMatches();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, loadMatches]);

  // Live in-play matches specifically
  const inPlayMatches = useMemo(() => {
    return matches.filter((m) => m.statusState === 'in');
  }, [matches]);

  // Filtered list
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Date / State filter
      if (dateFilter === 'live' && m.statusState !== 'in') return false;

      // League filter
      if (selectedLeague !== 'all' && m.leagueId !== selectedLeague) return false;

      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          m.homeTeam.displayName.toLowerCase().includes(query) ||
          m.awayTeam.displayName.toLowerCase().includes(query) ||
          m.leagueName.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [matches, dateFilter, selectedLeague, searchTerm]);

  // Check if a match is already in slip
  const isMatchInSlip = (matchId: string) => {
    return betslipItems.some((item) => String(item.id) === `live_${matchId}`);
  };

  // Sync a real match directly to Supabase odds table
  const handleSyncToSupabase = async (match: LiveMatch) => {
    try {
      const pred = liveMatchToPrediction(match);
      const tipString = `${pred.cleanTip} [${match.statusDetail} | ${match.dateFormatted}]`;

      const { error } = await supabase.from('odds').insert([
        {
          league: match.leagueName,
          home: match.homeTeam.displayName,
          away: match.awayTeam.displayName,
          tip: tipString,
          odds: match.odds,
        },
      ]);

      if (error) {
        showToast(`Failed to sync: ${error.message}`);
      } else {
        setSyncedIds((prev) => ({ ...prev, [match.id]: true }));
        showToast(`Synced ${match.homeTeam.displayName} vs ${match.awayTeam.displayName} to Supabase!`);
      }
    } catch (err: any) {
      showToast(`Sync error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#142318] border border-[#00ff88] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-[#1f2228] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <span className="text-xs uppercase font-bold text-red-400 tracking-wider">
              REAL-TIME FOOTBALL ENGINE
            </span>
            <span className="text-gray-600">·</span>
            <span className="text-xs text-gray-400">Live Scores & Future Fixtures</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-arena tracking-tight text-white mt-1">
            Live Matches & Fixtures Arena
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real live scores with elapsed clocks, in-play goal trackers, and future fixture schedules across Europe.
          </p>
        </div>

        {/* Live Status Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* In-play live badge */}
          {inPlayMatches.length > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>{inPlayMatches.length} Match{inPlayMatches.length > 1 ? 'es' : ''} In-Play</span>
            </div>
          )}

          {/* Auto Refresh pill */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono-numbers flex items-center gap-1.5 transition-colors ${
              autoRefresh
                ? 'bg-[#181920] border-[#00ff88]/30 text-[#00ff88]'
                : 'bg-[#181920] border-[#252832] text-gray-400'
            }`}
            title="Toggle Live Auto-Refresh"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-[#00ff88] animate-ping' : 'bg-gray-500'}`} />
            <span>{autoRefresh ? `Auto: ${countdown}s` : 'Paused'}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={loadMatches}
            className="p-2 bg-[#181920] hover:bg-[#20222a] border border-[#252832] rounded-lg text-gray-300 hover:text-white transition-colors"
            title="Refresh Real Live Scores Now"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ffd700]' : ''}`} />
          </button>
        </div>
      </div>

      {/* IN-PLAY LIVE TICKER (If live matches currently running) */}
      {inPlayMatches.length > 0 && (
        <div className="my-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>IN-PLAY LIVE MATCH TICKER ({inPlayMatches.length})</span>
            </div>
            <span className="text-xs text-gray-500 font-mono-numbers">Live Elapsed Clock</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inPlayMatches.map((m) => {
              const pred = liveMatchToPrediction(m);
              const inSlip = isMatchInSlip(m.id);

              return (
                <div
                  key={m.id}
                  className="bg-gradient-to-r from-[#1c1214] via-[#14151c] to-[#121318] border border-red-500/30 rounded-xl p-4 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-red-950/40">
                    <span className="text-red-400 font-semibold">{m.leagueName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono-numbers font-black text-[11px] animate-pulse">
                      {m.statusDetail}
                    </span>
                  </div>

                  {/* Matchup with Big Scores */}
                  <div className="py-3 flex items-center justify-between gap-2">
                    {/* Home */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img
                        src={m.homeTeam.logo}
                        alt={m.homeTeam.displayName}
                        className="w-7 h-7 object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="font-arena font-bold text-sm text-white truncate">
                        {m.homeTeam.displayName}
                      </span>
                    </div>

                    {/* Scoreboard */}
                    <div className="px-3 py-1 bg-black/60 border border-red-500/40 rounded-lg flex items-center gap-2 font-arena font-black text-xl text-white font-mono-numbers shrink-0">
                      <span className="text-[#ffd700]">{m.homeTeam.score}</span>
                      <span className="text-gray-500">-</span>
                      <span className="text-[#ffd700]">{m.awayTeam.score}</span>
                    </div>

                    {/* Away */}
                    <div className="flex items-center justify-end gap-2 min-w-0 flex-1 text-right">
                      <span className="font-arena font-bold text-sm text-white truncate">
                        {m.awayTeam.displayName}
                      </span>
                      <img
                        src={m.awayTeam.logo}
                        alt={m.awayTeam.displayName}
                        className="w-7 h-7 object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Live Betting Action */}
                  <div className="pt-2 border-t border-[#1f2228] flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-gray-400 block text-[10px]">Live Pick</span>
                      <span className="text-[#ffd700] font-semibold">{m.tip}</span>
                    </div>

                    <button
                      onClick={() => onAddToBetslip(pred)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        inSlip
                          ? 'bg-[#00ff88] text-black font-extrabold'
                          : 'bg-[#ffd700] hover:bg-[#ffe033] text-black'
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{inSlip ? 'In Slip' : `Slip @ ${m.odds.toFixed(2)}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Date Tabs (Live, Today, Tomorrow, Upcoming) */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-5 pb-3 border-b border-[#1f2228]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors shrink-0 ${
              dateFilter === 'today'
                ? 'bg-[#ffd700] text-black'
                : 'bg-[#14151a] text-gray-300 hover:bg-[#1a1c22]'
            }`}
          >
            TODAY'S MATCHES ({matches.length})
          </button>

          <button
            onClick={() => setDateFilter('live')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors flex items-center gap-1.5 shrink-0 ${
              dateFilter === 'live'
                ? 'bg-red-500 text-white font-extrabold'
                : 'bg-[#14151a] text-gray-300 hover:bg-[#1a1c22]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            <span>LIVE NOW ({inPlayMatches.length})</span>
          </button>

          <button
            onClick={() => setDateFilter('tomorrow')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors shrink-0 ${
              dateFilter === 'tomorrow'
                ? 'bg-[#1e2028] text-white border border-[#303440]'
                : 'bg-[#14151a] text-gray-300 hover:bg-[#1a1c22]'
            }`}
          >
            TOMORROW
          </button>

          <button
            onClick={() => setDateFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors shrink-0 ${
              dateFilter === 'upcoming'
                ? 'bg-[#00ff88] text-black font-extrabold'
                : 'bg-[#14151a] text-gray-300 hover:bg-[#1a1c22]'
            }`}
          >
            NEXT 7 DAYS SCHEDULE
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search club or league..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#121316] border border-[#22252c] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]"
          />
        </div>
      </div>

      {/* League Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
        <button
          onClick={() => setSelectedLeague('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedLeague === 'all'
              ? 'bg-[#ffd700] text-black font-bold'
              : 'bg-[#121316] text-gray-300 hover:bg-[#181920] border border-[#22252c]'
          }`}
        >
          All Leagues ({matches.length})
        </button>

        {LEAGUES_CONFIG.map((l) => {
          const isSelected = selectedLeague === l.code;
          return (
            <button
              key={l.code}
              onClick={() => setSelectedLeague(l.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#ffd700] text-black font-bold shadow-md'
                  : 'bg-[#121316] text-gray-300 hover:bg-[#181920] border border-[#22252c]'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          );
        })}
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-2 border-[#ffd700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-300 font-semibold">Connecting to real live score API feed...</p>
          <p className="text-xs text-gray-500 mt-1">Retrieving official team crests, live elapsed times, and kickoff schedules</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="py-16 text-center bg-[#121316] border border-[#22252c] rounded-xl max-w-lg mx-auto my-8 p-6">
          <Calendar className="w-12 h-12 text-[#ffd700] mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-white font-arena">
            No matches scheduled for this filter
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Try switching the league pill to "All Leagues" or check "Today's Matches" or "Next 7 Days Schedule".
          </p>
          <button
            onClick={() => {
              setSelectedLeague('all');
              setDateFilter('today');
              setSearchTerm('');
            }}
            className="mt-4 px-4 py-2 bg-[#ffd700] text-black font-bold text-xs rounded-lg"
          >
            Show All Today's Matches
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => {
            const pred = liveMatchToPrediction(match);
            const inSlip = isMatchInSlip(match.id);
            const isSynced = syncedIds[match.id];

            return (
              <div
                key={match.id}
                className="bg-[#121316] hover:bg-[#15171d] border border-[#20232a] hover:border-[#2f3340] rounded-xl p-4 transition-all flex flex-col justify-between shadow-md relative group"
              >
                <div>
                  {/* Card Header: League & Status */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pb-2.5 border-b border-[#1b1d24]">
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <span className="font-semibold text-gray-300 truncate">
                        {match.leagueName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {match.statusState === 'in' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          <span>{match.statusDetail}</span>
                        </span>
                      ) : match.statusState === 'post' ? (
                        <span className="text-[10px] font-bold text-gray-300 bg-gray-500/15 border border-gray-500/30 px-2 py-0.5 rounded-full">
                          FULL TIME (FT)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-[#ffd700] font-mono-numbers">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{match.kickoffTime}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match Teams & Live Scores */}
                  <div className="py-4 space-y-3">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={match.homeTeam.logo}
                          alt={match.homeTeam.displayName}
                          className="w-6 h-6 object-contain shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="font-bold text-sm text-white truncate font-arena">
                          {match.homeTeam.displayName}
                        </span>
                      </div>

                      <div className="font-mono-numbers font-black text-lg text-white">
                        {match.statusState !== 'pre' ? (
                          <span className={match.statusState === 'in' ? 'text-[#ffd700]' : 'text-gray-300'}>
                            {match.homeTeam.score}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600 font-normal">vs</span>
                        )}
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={match.awayTeam.logo}
                          alt={match.awayTeam.displayName}
                          className="w-6 h-6 object-contain shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="font-bold text-sm text-white truncate font-arena">
                          {match.awayTeam.displayName}
                        </span>
                      </div>

                      <div className="font-mono-numbers font-black text-lg text-white">
                        {match.statusState !== 'pre' ? (
                          <span className={match.statusState === 'in' ? 'text-[#ffd700]' : 'text-gray-300'}>
                            {match.awayTeam.score}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600 font-normal">--</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Venue & Date info */}
                  {match.venue && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2 truncate">
                      <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                      <span className="truncate">{match.venue}</span>
                      <span>·</span>
                      <span>{match.dateFormatted}</span>
                    </div>
                  )}

                  {/* Prediction Tip & Market Odds */}
                  <div className="p-2.5 bg-[#171920] border border-[#222530] rounded-lg mb-3">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
                      <span>Market: {match.market}</span>
                      <span className="text-gray-400 font-mono-numbers">{match.dateFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#ffd700] truncate mr-2">
                        {match.tip}
                      </span>
                      <span className="font-mono-numbers font-bold text-sm text-white">
                        @{match.odds.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: AI Stats, Sync to Supabase, Add to Betslip */}
                <div className="pt-2 border-t border-[#1b1d24] flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenAiAnalysis(pred)}
                      className="p-1.5 text-xs text-gray-400 hover:text-[#ffd700] hover:bg-[#1a1c24] rounded transition-colors flex items-center gap-1"
                      title="Run AI Probability Model"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                      <span className="hidden sm:inline">AI xG</span>
                    </button>

                    {isAdminLoggedIn && (
                      <button
                        onClick={() => handleSyncToSupabase(match)}
                        className={`p-1.5 text-xs rounded transition-colors flex items-center gap-1 ${
                          isSynced
                            ? 'text-[#00ff88]'
                            : 'text-gray-400 hover:text-white hover:bg-[#1a1c24]'
                        }`}
                        title="Save to Supabase Odds Database"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isSynced ? 'Saved' : 'Save'}</span>
                      </button>
                    )}
                  </div>

                  {/* Add to Betslip Button */}
                  <button
                    onClick={() => onAddToBetslip(pred)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      inSlip
                        ? 'bg-[#00ff88] text-black font-extrabold'
                        : 'bg-[#ffd700] hover:bg-[#ffe033] text-black'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{inSlip ? 'In Slip' : 'Add Slip'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
