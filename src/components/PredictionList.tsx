import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Ticket,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PlusCircle,
  Tv,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar
} from 'lucide-react';
import { ParsedPrediction, BetslipItem } from '../types';

interface PredictionListProps {
  predictions: ParsedPrediction[];
  loading: boolean;
  onRefresh: () => void;
  onAddToBetslip: (prediction: ParsedPrediction) => void;
  onOpenAiAnalysis: (prediction: ParsedPrediction) => void;
  onOpenBookmakers: (prediction: ParsedPrediction) => void;
  onNavigateToAdmin: () => void;
  onQuickSeed?: () => void;
  onNavigateToChat: () => void;
  betslipItems: BetslipItem[];
}

export const PredictionList: React.FC<PredictionListProps> = ({
  predictions,
  loading,
  onRefresh,
  onAddToBetslip,
  onOpenAiAnalysis,
  onOpenBookmakers,
  onNavigateToAdmin,
  onQuickSeed,
  onNavigateToChat,
  betslipItems,
}) => {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'today' | 'upcoming' | 'live' | 'completed'>('today');
  const [selectedLeague, setSelectedLeague] = useState<string>('All');
  const [selectedMarket, setSelectedMarket] = useState<string>('All');
  const [selectedOddsRange, setSelectedOddsRange] = useState<string>('All');

  // Compute unique leagues for filter dropdown
  const leagueOptions = useMemo(() => {
    const leagues = Array.from(new Set(predictions.map((p) => p.league)));
    return ['All', ...leagues];
  }, [predictions]);

  // Compute unique markets for filter dropdown
  const marketOptions = useMemo(() => {
    const markets = Array.from(new Set(predictions.map((p) => p.market)));
    return ['All', ...markets];
  }, [predictions]);

  // Filtered predictions
  const filteredPredictions = useMemo(() => {
    return predictions.filter((p) => {
      // Tab filter
      if (selectedTab === 'live' && p.status !== 'live') return false;
      if (selectedTab === 'upcoming' && p.status !== 'upcoming') return false;
      if (selectedTab === 'completed' && p.status !== 'completed') return false;
      if (selectedTab === 'today' && p.status === 'completed') return false; // Show active today's tips

      // Search filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          p.home.toLowerCase().includes(query) ||
          p.away.toLowerCase().includes(query) ||
          p.league.toLowerCase().includes(query) ||
          p.cleanTip.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // League filter
      if (selectedLeague !== 'All' && p.league !== selectedLeague) {
        return false;
      }

      // Market filter
      if (selectedMarket !== 'All' && p.market !== selectedMarket) {
        return false;
      }

      // Odds range filter
      if (selectedOddsRange === '1.20-1.50' && (p.odds < 1.2 || p.odds > 1.5)) return false;
      if (selectedOddsRange === '1.50-2.00' && (p.odds < 1.5 || p.odds > 2.0)) return false;
      if (selectedOddsRange === '2.00+' && p.odds < 2.0) return false;

      return true;
    });
  }, [predictions, selectedTab, searchTerm, selectedLeague, selectedMarket, selectedOddsRange]);

  const isInSlip = (id: number | string) => {
    return betslipItems.some((item) => String(item.id) === String(id));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Tab Switcher & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1f2228]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedTab('today')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors shrink-0 ${
              selectedTab === 'today'
                ? 'bg-[#ffd700] text-black'
                : 'bg-[#14151a] text-gray-300 hover:bg-[#1a1c22]'
            }`}
          >
            TODAY'S TIPS ({predictions.filter((p) => p.status !== 'completed').length})
          </button>

          <button
            onClick={() => setSelectedTab('live')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors flex items-center gap-1.5 shrink-0 ${
              selectedTab === 'live'
                ? 'bg-red-500 text-white'
                : 'bg-[#14151a] text-gray-300 hover:bg-[#1a1c22]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            <span>LIVE MATCHES ({predictions.filter((p) => p.status === 'live').length})</span>
          </button>

          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors shrink-0 ${
              selectedTab === 'upcoming'
                ? 'bg-[#1e2028] text-white border border-[#303440]'
                : 'bg-[#14151a] text-gray-300 hover:bg-[#1a1c22]'
            }`}
          >
            UPCOMING ({predictions.filter((p) => p.status === 'upcoming').length})
          </button>

          <button
            onClick={() => setSelectedTab('completed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors shrink-0 ${
              selectedTab === 'completed'
                ? 'bg-[#00ff88] text-black font-extrabold'
                : 'bg-[#14151a] text-gray-300 hover:bg-[#1a1c22]'
            }`}
          >
            RESULTS / WON ({predictions.filter((p) => p.status === 'completed').length})
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-white rounded-lg bg-[#14151a] hover:bg-[#1a1c22] border border-[#22252c] transition-colors"
            title="Refresh from Supabase Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ffd700]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search team or league..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#121316] border border-[#22252c] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]"
          />
        </div>

        {/* League Dropdown */}
        <div>
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="w-full px-3 py-2 bg-[#121316] border border-[#22252c] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700]"
          >
            {leagueOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#121316]">
                League: {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Market Dropdown */}
        <div>
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="w-full px-3 py-2 bg-[#121316] border border-[#22252c] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700]"
          >
            {marketOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#121316]">
                Market: {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Odds Range Dropdown */}
        <div>
          <select
            value={selectedOddsRange}
            onChange={(e) => setSelectedOddsRange(e.target.value)}
            className="w-full px-3 py-2 bg-[#121316] border border-[#22252c] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700]"
          >
            <option value="All" className="bg-[#121316]">Odds: All Ranges</option>
            <option value="1.20-1.50" className="bg-[#121316]">Odds: 1.20 - 1.50 (High Safety)</option>
            <option value="1.50-2.00" className="bg-[#121316]">Odds: 1.50 - 2.00 (Balanced Banker)</option>
            <option value="2.00+" className="bg-[#121316]">Odds: 2.00+ (High Value)</option>
          </select>
        </div>
      </div>

      {/* Grid of Predictions or Empty State */}
      {loading && predictions.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-[#ffd700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading predictions from Supabase table <code className="text-[#ffd700]">odds</code>...</p>
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div className="py-16 px-4 bg-[#121316] border border-[#22252c] rounded-xl text-center max-w-xl mx-auto my-8">
          <HelpCircle className="w-12 h-12 text-[#ffd700] mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-white font-arena">
            No predictions yet - Admin needs to add tips
          </h3>
          <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
            The Supabase table <code className="text-[#ffd700]">odds</code> currently has 0 matching records for this filter. You can add tips in the Admin dashboard or click below to seed fresh real fixtures immediately.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToAdmin}
              className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffe033] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Go to Admin Dashboard</span>
            </button>
            {onQuickSeed && (
              <button
                onClick={onQuickSeed}
                className="px-4 py-2 bg-[#181920] hover:bg-[#222530] text-gray-200 border border-[#2d313d] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4 text-[#00ff88]" />
                <span>Seed 8 Real Matches</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPredictions.map((fixture) => {
            const added = isInSlip(fixture.id);

            return (
              <div
                key={fixture.id}
                className="bg-[#121316] hover:bg-[#15171c] border border-[#20232a] hover:border-[#2e323e] rounded-xl p-4 transition-all flex flex-col justify-between shadow-md relative group"
              >
                {/* Card Top: League & Kickoff & Status */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 pb-2.5 border-b border-[#1b1d24]">
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <span className="font-semibold text-gray-300 truncate">
                        {fixture.league}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {fixture.status === 'live' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          <span>LIVE</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400 font-mono-numbers">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span>{fixture.kickoff}</span>
                        </span>
                      )}

                      {fixture.result === 'won' && (
                        <span className="text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>WON</span>
                        </span>
                      )}
                      {fixture.result === 'lost' && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <XCircle className="w-3 h-3" />
                          <span>LOST</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teams Matchup */}
                  <div className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-[#1f222a] text-white flex items-center justify-center text-[10px] font-bold font-arena shrink-0">
                          {fixture.home.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-white truncate font-arena">
                          {fixture.home}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-semibold uppercase">
                        HOME
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-[#1f222a] text-white flex items-center justify-center text-[10px] font-bold font-arena shrink-0">
                          {fixture.away.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-white truncate font-arena">
                          {fixture.away}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-semibold uppercase">
                        AWAY
                      </span>
                    </div>
                  </div>

                  {/* Market & Tip Box */}
                  <div className="p-3 bg-[#171920] border border-[#232733] rounded-lg mt-1 mb-3">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                      <span>Market: {fixture.market}</span>
                      <span className="text-[#00ff88] font-bold text-[10px]">
                        {fixture.confidence}% Confidence
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-sm text-[#ffd700] truncate mr-2">
                        {fixture.cleanTip}
                      </div>
                      <div className="font-mono-numbers font-bold text-base text-white">
                        @{fixture.odds.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Action Buttons */}
                <div className="pt-2 border-t border-[#1b1d24] flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenAiAnalysis(fixture)}
                      className="p-1.5 text-xs text-gray-400 hover:text-[#ffd700] hover:bg-[#1c1e26] rounded transition-colors flex items-center gap-1"
                      title="AI Algorithmic Probability Analysis"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                      <span className="text-[11px] font-semibold hidden sm:inline">AI Analysis</span>
                    </button>

                    <button
                      onClick={() => onOpenBookmakers(fixture)}
                      className="p-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#1c1e26] rounded transition-colors flex items-center gap-1"
                      title="Compare SportyBet, MSport, Bet9ja"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#00ff88]" />
                      <span className="text-[11px] font-semibold hidden sm:inline">Odds</span>
                    </button>
                  </div>

                  {/* Add to Betslip Button */}
                  <button
                    onClick={() => onAddToBetslip(fixture)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      added
                        ? 'bg-[#00ff88] text-black font-extrabold'
                        : 'bg-[#ffd700] hover:bg-[#ffe033] text-black'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{added ? 'In Slip' : 'Add Slip'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Community Banner */}
      <div className="mt-10 p-5 bg-gradient-to-r from-[#171922] via-[#12131a] to-[#101115] border border-[#22252c] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-[#00ff88] tracking-wider block">
            Sure Odd Arena Community
          </span>
          <h3 className="text-lg font-bold text-white font-arena mt-0.5">
            Discuss Today's Match Predictions Live With Thousands of Bettors
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Realtime chat channels for SportyBet, Bet9ja, MSport & Football.com tipsters.
          </p>
        </div>
        <button
          onClick={onNavigateToChat}
          className="px-5 py-2.5 rounded-lg bg-[#00ff88] hover:bg-[#00e67a] text-black font-bold text-xs tracking-wider transition-colors shrink-0 flex items-center gap-2 shadow-lg green-glow"
        >
          <span>JOIN LIVE CHAT</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
