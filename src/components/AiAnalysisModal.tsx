import React from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, Activity, Target } from 'lucide-react';
import { ParsedPrediction } from '../types';
import { generateAiAnalysis } from '../lib/aiAnalysis';

interface AiAnalysisModalProps {
  fixture: ParsedPrediction | null;
  onClose: () => void;
  onAddToBetslip?: (fixture: ParsedPrediction) => void;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  fixture,
  onClose,
  onAddToBetslip,
}) => {
  if (!fixture) return null;

  const analysis = generateAiAnalysis(fixture);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121316] border border-[#22252c] rounded-xl shadow-2xl p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#22252c]">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#ffd700] font-semibold">
              <Sparkles className="w-4 h-4 text-[#ffd700]" />
              <span>Statistical & Odds Implied Engine</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white font-arena">
              {fixture.home} vs {fixture.away}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {fixture.league} · Market: {fixture.market} · Base Odds: {fixture.odds.toFixed(2)}
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

        {!analysis ? (
          <div className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-200">Insufficient Data</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mt-1">
              Statistical models require valid market odds and fixture parameters to calculate fair probabilities.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {/* Match Preview */}
            <div className="p-4 bg-[#18191f] border border-[#262a34] rounded-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                <Activity className="w-4 h-4 text-[#00ff88]" />
                <span>AI Algorithmic Match Preview</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-300">
                {analysis.preview}
              </p>
            </div>

            {/* Implied Probabilities Bars */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Win / Draw / Loss Probabilities (Margin-Adjusted)
                </span>
                <span className="text-xs text-gray-400 font-mono-numbers">100% Normalized</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-[#18191f] border border-[#22252c] rounded-lg text-center">
                  <span className="text-xs text-gray-400 block truncate">{fixture.home} Win</span>
                  <span className="text-lg font-bold text-[#ffd700] font-mono-numbers">
                    {analysis.probabilities.homeWin}%
                  </span>
                  <div className="w-full bg-[#252830] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[#ffd700] h-full"
                      style={{ width: `${analysis.probabilities.homeWin}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#18191f] border border-[#22252c] rounded-lg text-center">
                  <span className="text-xs text-gray-400 block">Draw</span>
                  <span className="text-lg font-bold text-gray-300 font-mono-numbers">
                    {analysis.probabilities.draw}%
                  </span>
                  <div className="w-full bg-[#252830] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-gray-400 h-full"
                      style={{ width: `${analysis.probabilities.draw}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#18191f] border border-[#22252c] rounded-lg text-center">
                  <span className="text-xs text-gray-400 block truncate">{fixture.away} Win</span>
                  <span className="text-lg font-bold text-[#00ff88] font-mono-numbers">
                    {analysis.probabilities.awayWin}%
                  </span>
                  <div className="w-full bg-[#252830] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[#00ff88] h-full"
                      style={{ width: `${analysis.probabilities.awayWin}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Over/Under & BTTS Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#18191f] border border-[#22252c] rounded-lg">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Over 2.5 Goals Expectancy</span>
                  <span className="font-mono-numbers font-bold text-[#ffd700]">
                    {analysis.probabilities.over25}%
                  </span>
                </div>
                <div className="w-full bg-[#252830] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ffd700] h-full"
                    style={{ width: `${analysis.probabilities.over25}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                  <span>Under 2.5: {analysis.probabilities.under25}%</span>
                  <span>Exp Total: {analysis.expectedGoals.total} goals</span>
                </div>
              </div>

              <div className="p-3 bg-[#18191f] border border-[#22252c] rounded-lg">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Both Teams To Score (BTTS)</span>
                  <span className="font-mono-numbers font-bold text-[#00ff88]">
                    {analysis.probabilities.bttsYes}%
                  </span>
                </div>
                <div className="w-full bg-[#252830] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#00ff88] h-full"
                    style={{ width: `${analysis.probabilities.bttsYes}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                  <span>BTTS No: {analysis.probabilities.bttsNo}%</span>
                  <span>Goal Distribution</span>
                </div>
              </div>
            </div>

            {/* Key Stats & Model Insights */}
            <div>
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#ffd700]" />
                Key Model Insights
              </h4>
              <ul className="space-y-1.5">
                {analysis.keyStats.map((stat, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-[#00ff88] font-bold">✓</span>
                    <span>{stat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tactical Uncertainties */}
            <div className="p-3 bg-[#1a1712] border border-[#3a2f18] rounded-lg">
              <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Uncertainty & Risk Factors
              </h4>
              <ul className="space-y-1">
                {analysis.uncertainties.map((item, i) => (
                  <li key={i} className="text-xs text-amber-200/80">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendation & Bet Slip CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-[#1c1e24] to-[#14161c] border border-[#2c303c] rounded-lg gap-3">
              <div>
                <span className="text-xs text-gray-400 block">Algorithmic Selection</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-bold text-white font-arena">
                    {analysis.recommendation.primary}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/30 font-semibold">
                    {analysis.recommendation.valueRating}
                  </span>
                </div>
              </div>
              {onAddToBetslip && (
                <button
                  onClick={() => {
                    onAddToBetslip(fixture);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-[#ffd700] hover:bg-[#ffe033] text-black font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Add Tip @ {fixture.odds.toFixed(2)}</span>
                </button>
              )}
            </div>

            {/* Disclaimer */}
            <div className="text-[11px] text-gray-500 italic border-t border-[#22252c] pt-3">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
              {analysis.disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
