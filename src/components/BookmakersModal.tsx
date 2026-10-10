import React, { useState } from 'react';
import { X, Check, Copy, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import { ParsedPrediction } from '../types';
import { calculateBookmakerComparisons } from '../lib/bookmakers';

interface BookmakersModalProps {
  fixture: ParsedPrediction | null;
  onClose: () => void;
  onAddToBetslip?: (fixture: ParsedPrediction, bookmakerOdds?: number) => void;
}

export const BookmakersModal: React.FC<BookmakersModalProps> = ({
  fixture,
  onClose,
  onAddToBetslip,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!fixture) return null;

  const { prices, comparisonRows, bestOverall } = calculateBookmakerComparisons(fixture);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121316] border border-[#22252c] rounded-xl shadow-2xl p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#22252c]">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#00ff88] font-semibold block">
              Multi-Bookmaker Price Comparator
            </span>
            <h2 className="text-xl font-bold mt-1 text-white font-arena">
              {fixture.home} vs {fixture.away}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Selection: <strong className="text-white">{fixture.cleanTip}</strong> · Best Payout with <strong className="text-[#ffd700]">{bestOverall}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1f2228] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="mt-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#22252c] text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="py-2.5 px-3">Bookmaker</th>
                  <th className="py-2.5 px-3">Selection</th>
                  <th className="py-2.5 px-3 text-right">Odds</th>
                  <th className="py-2.5 px-3 text-center">Booking Code</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2027]">
                {comparisonRows.map((row) => (
                  <tr
                    key={row.bookmaker}
                    className={`hover:bg-[#181920] transition-colors ${
                      row.isBestOdds ? 'bg-[#ffd700]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {row.bookmaker}
                        </span>
                        {row.isBestOdds && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 font-bold">
                            TOP PRICE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-300">
                      {row.selection}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-mono-numbers font-bold text-sm ${
                          row.isBestOdds ? 'text-[#ffd700]' : 'text-white'
                        }`}
                      >
                        {row.odds.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleCopy(row.bookingCode)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-[#1f222a] hover:bg-[#282c37] border border-[#2d313d] text-gray-200 transition-colors"
                        title="Click to copy booking code"
                      >
                        <span className="font-mono-numbers text-[11px]">{row.bookingCode}</span>
                        {copiedCode === row.bookingCode ? (
                          <Check className="w-3 h-3 text-[#00ff88]" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {onAddToBetslip && (
                        <button
                          onClick={() => {
                            onAddToBetslip(fixture, row.odds);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs rounded bg-[#ffd700] hover:bg-[#ffe033] text-black font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <span>Select</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Deep Market Odds Across Bookmakers */}
          <div className="mt-4 p-4 bg-[#18191f] border border-[#22252c] rounded-lg">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Full Market Grid (1X2, Over/Under 2.5, BTTS)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {prices.map((p) => (
                <div key={p.name} className="p-2.5 bg-[#121316] border border-[#22252c] rounded">
                  <div className="text-xs font-bold text-gray-200 pb-1 mb-1 border-b border-[#22252c] flex justify-between items-center">
                    <span>{p.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono-numbers">{p.payoutMargin}% vig</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-gray-400">
                      <span>Home (1):</span>
                      <span className="font-mono-numbers text-white font-semibold">{p.homeWin}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Draw (X):</span>
                      <span className="font-mono-numbers text-gray-300">{p.draw}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Away (2):</span>
                      <span className="font-mono-numbers text-white">{p.awayWin}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 pt-1 border-t border-[#1e2026]">
                      <span>Over 2.5:</span>
                      <span className="font-mono-numbers text-[#ffd700]">{p.over25}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>BTTS Yes:</span>
                      <span className="font-mono-numbers text-[#00ff88]">{p.bttsYes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-[#16171d] border border-[#22252c] rounded-lg flex items-start gap-2 text-xs text-gray-400">
            <AlertCircle className="w-4 h-4 text-[#ffd700] shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> Bookmaker odds are dynamic and subject to market fluctuation until placed. Booking codes are generated for quick slip loading in Nigerian and global apps. Bet responsibly (18+).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
