import React, { useState } from 'react';
import { Tv, Clock, RefreshCw, Code2, AlertTriangle, Building2, Ticket, Sparkles } from 'lucide-react';
import { ParsedPrediction } from '../types';

interface LiveMatchesProps {
  predictions: ParsedPrediction[];
  loading: boolean;
  onRefresh: () => void;
  onOpenApiModal: () => void;
  onAddToBetslip: (prediction: ParsedPrediction) => void;
  onOpenAiAnalysis: (prediction: ParsedPrediction) => void;
  onNavigateToAdmin: () => void;
}

export const LiveMatches: React.FC<LiveMatchesProps> = ({
  predictions,
  loading,
  onRefresh,
  onOpenApiModal,
  onAddToBetslip,
  onOpenAiAnalysis,
  onNavigateToAdmin,
}) => {
  const [filter, setFilter] = useState<'all' | 'live-only' | 'upcoming'>('all');

  // Filter for live matches or fixtures scheduled for today/upcoming
  const liveMatches = predictions.filter((p) => p.status === 'live');
  const upcomingMatches = predictions.filter((p) => p.status === 'upcoming');

  const displayed =
    filter === 'live-only'
      ? liveMatches
      : filter === 'upcoming'
      ? upcomingMatches
      : predictions.filter((p) => p.status !== 'completed');

  const nowTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-[#1f2228] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs uppercase font-bold text-red-400 tracking-wider">
              IN-PLAY & TODAY'S FIXTURES
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-arena tracking-tight text-white mt-1">
            Live Matches & Fixtures
          </h2>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
            <span>Source: <strong className="text-gray-200">Supabase DB (table: odds)</strong></span>
            <span>·</span>
            <span>Last updated: <strong className="text-[#ffd700] font-mono-numbers">{nowTimestamp}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#121316] p-1 rounded-lg border border-[#22252c] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                filter === 'all' ? 'bg-[#ffd700] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Fixtures ({predictions.filter(p => p.status !== 'completed').length})
            </button>
            <button
              onClick={() => setFilter('live-only')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                filter === 'live-only' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Live In-Play ({liveMatches.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                filter === 'upcoming' ? 'bg-[#1f2228] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Upcoming ({upcomingMatches.length})
            </button>
          </div>

          <button
            onClick={onOpenApiModal}
            className="px-3.5 py-2 bg-[#181920] hover:bg-[#20232c] border border-[#292c36] text-xs font-semibold text-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Football API instructions"
          >
            <Code2 className="w-3.5 h-3.5 text-[#00ff88]" />
            <span className="hidden sm:inline">Connect API</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 bg-[#14151a] hover:bg-[#1a1c22] border border-[#22252c] rounded-lg text-gray-300 hover:text-white"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ffd700]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {displayed.length === 0 ? (
        <div className="py-16 text-center bg-[#121316] border border-[#22252c] rounded-xl max-w-lg mx-auto my-8 p-6">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white font-arena">
            Data unavailable - Add fixtures in admin
          </h3>
          <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
            No live or scheduled fixtures found in your Supabase <code className="text-[#ffd700]">odds</code> table for this filter. Add new fixtures in Admin or configure API-Sports.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={onNavigateToAdmin}
              className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffe033] text-black font-bold text-xs rounded-lg transition-colors"
            >
              Add Fixtures In Admin
            </button>
            <button
              onClick={onOpenApiModal}
              className="px-4 py-2 bg-[#181920] hover:bg-[#222530] text-gray-200 border border-[#2c303c] font-semibold text-xs rounded-lg transition-colors"
            >
              API Setup Guide
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {displayed.map((match) => (
            <div
              key={match.id}
              className="bg-[#121316] border border-[#20232a] hover:border-[#2b2f3a] rounded-xl p-4 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-[#1b1d24]">
                  <span className="font-semibold text-gray-300 truncate mr-2">
                    {match.league}
                  </span>
                  {match.status === 'live' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      <span>IN-PLAY</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-mono-numbers flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>{match.kickoff}</span>
                    </span>
                  )}
                </div>

                <div className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white font-arena">
                      {match.home}
                    </span>
                    <span className="text-xs font-mono-numbers text-gray-400">
                      {match.status === 'live' ? '1' : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white font-arena">
                      {match.away}
                    </span>
                    <span className="text-xs font-mono-numbers text-gray-400">
                      {match.status === 'live' ? '0' : '-'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#171920] border border-[#232630] rounded-lg text-xs flex items-center justify-between mb-3">
                  <span className="text-gray-400 truncate mr-2">Tip: <strong className="text-[#ffd700]">{match.cleanTip}</strong></span>
                  <span className="font-mono-numbers font-bold text-white shrink-0">@{match.odds.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1b1d24] flex items-center justify-between">
                <button
                  onClick={() => onOpenAiAnalysis(match)}
                  className="text-xs text-gray-400 hover:text-[#ffd700] flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>xG & Stats</span>
                </button>

                <button
                  onClick={() => onAddToBetslip(match)}
                  className="px-3 py-1.5 bg-[#ffd700] hover:bg-[#ffe033] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Add Slip</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
