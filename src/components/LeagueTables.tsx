import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trophy, BarChart3, RefreshCw, Calendar, Shield } from 'lucide-react';
import { DEFAULT_LEAGUE_TABLES, fetchLeagueStandings } from '../lib/leagueData';
import { LeagueStanding } from '../types';

export const LeagueTables: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<string>('epl');
  const [season, setSeason] = useState<string>('2025/2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  const leagueKeys = Object.keys(DEFAULT_LEAGUE_TABLES);
  const currentLeagueInfo = DEFAULT_LEAGUE_TABLES[selectedLeague] || DEFAULT_LEAGUE_TABLES['epl'];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchLeagueStandings(selectedLeague).then((data) => {
      if (isMounted) {
        setStandings(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedLeague, season]);

  // Search filter
  const filteredStandings = useMemo(() => {
    if (!searchTerm) return standings;
    return standings.filter((row) =>
      row.team.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [standings, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-[#1f2228] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#ffd700] tracking-wider">
            <Trophy className="w-4 h-4 text-[#ffd700]" />
            <span>OFFICIAL STANDINGS & FORM</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-arena tracking-tight text-white mt-1">
            Football Leagues & Standings
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Last updated: <strong className="text-gray-300 font-mono-numbers">{lastUpdated}</strong> · Live goal difference & points tally
          </p>
        </div>

        {/* Season Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="px-3 py-1.5 bg-[#121316] border border-[#22252c] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700]"
          >
            <option value="2025/2026">Season 2025/2026</option>
            <option value="2024/2025">Season 2024/2025</option>
          </select>
        </div>
      </div>

      {/* League Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
        {leagueKeys.map((key) => {
          const l = DEFAULT_LEAGUE_TABLES[key];
          const isSelected = selectedLeague === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedLeague(key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#ffd700] text-black font-bold shadow-md'
                  : 'bg-[#121316] text-gray-300 hover:bg-[#1a1c22] border border-[#22252c]'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="my-4 max-w-sm relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder={`Search team in ${currentLeagueInfo.name}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-[#121316] border border-[#22252c] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]"
        />
      </div>

      {/* Standings Table */}
      <div className="bg-[#121316] border border-[#22252c] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#171920] border-b border-[#22252c] text-[11px] uppercase tracking-wider text-gray-400">
                <th className="py-3 px-3 text-center w-12">Pos</th>
                <th className="py-3 px-4">Club</th>
                <th className="py-3 px-2 text-center">P</th>
                <th className="py-3 px-2 text-center">W</th>
                <th className="py-3 px-2 text-center">D</th>
                <th className="py-3 px-2 text-center">L</th>
                <th className="py-3 px-2 text-center hidden sm:table-cell">GF</th>
                <th className="py-3 px-2 text-center hidden sm:table-cell">GA</th>
                <th className="py-3 px-2 text-center">GD</th>
                <th className="py-3 px-3 text-center font-bold text-white">Pts</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">Form (Last 5)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2028]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-[#ffd700] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading standings...</span>
                  </td>
                </tr>
              ) : filteredStandings.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-gray-400">
                    No teams found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredStandings.map((row) => {
                  const isTop4 = row.pos <= 4;
                  const isRelegation = row.pos >= filteredStandings.length - 2;

                  return (
                    <tr
                      key={row.team}
                      className="hover:bg-[#181920] transition-colors"
                    >
                      {/* Pos */}
                      <td className="py-3 px-3 text-center font-mono-numbers">
                        <span
                          className={`inline-block w-6 h-6 leading-6 rounded-md text-[11px] font-bold ${
                            isTop4
                              ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30'
                              : isRelegation
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'text-gray-400'
                          }`}
                        >
                          {row.pos}
                        </span>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#1f222a] text-[10px] flex items-center justify-center font-arena font-bold text-gray-300">
                            {row.team.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="font-arena text-sm">{row.team}</span>
                        </div>
                      </td>

                      {/* P, W, D, L */}
                      <td className="py-3 px-2 text-center text-gray-300 font-mono-numbers">{row.p}</td>
                      <td className="py-3 px-2 text-center text-gray-300 font-mono-numbers">{row.w}</td>
                      <td className="py-3 px-2 text-center text-gray-300 font-mono-numbers">{row.d}</td>
                      <td className="py-3 px-2 text-center text-gray-300 font-mono-numbers">{row.l}</td>

                      {/* GF, GA */}
                      <td className="py-3 px-2 text-center text-gray-400 font-mono-numbers hidden sm:table-cell">{row.gf}</td>
                      <td className="py-3 px-2 text-center text-gray-400 font-mono-numbers hidden sm:table-cell">{row.ga}</td>

                      {/* GD */}
                      <td className="py-3 px-2 text-center font-mono-numbers font-semibold">
                        <span className={row.gd > 0 ? 'text-[#00ff88]' : row.gd < 0 ? 'text-red-400' : 'text-gray-400'}>
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </span>
                      </td>

                      {/* Pts */}
                      <td className="py-3 px-3 text-center font-mono-numbers font-black text-sm text-[#ffd700]">
                        {row.pts}
                      </td>

                      {/* Form */}
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1 font-mono-numbers">
                          {row.form?.map((result, i) => (
                            <span
                              key={i}
                              className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                                result === 'W'
                                  ? 'bg-[#00ff88] text-black'
                                  : result === 'D'
                                  ? 'bg-gray-500 text-white'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {result}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-3 bg-[#101115] border-t border-[#1f2228] flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#00ff88]/20 border border-[#00ff88]"></span>
              <span>Champions League / Top Promotion</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500"></span>
              <span>Relegation Zone</span>
            </span>
          </div>
          <span>P = Played · GD = Goal Difference · Pts = Points</span>
        </div>
      </div>
    </div>
  );
};
