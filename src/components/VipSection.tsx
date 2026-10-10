import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Crown,
  KeyRound,
  CheckCircle2,
  Ticket,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Flame,
  MessageCircle
} from 'lucide-react';
import { ParsedPrediction } from '../types';
import { WHATSAPP_VIP_URL } from './Header';

interface VipSectionProps {
  predictions: ParsedPrediction[];
  onAddToBetslip: (prediction: ParsedPrediction) => void;
  onOpenAiAnalysis: (prediction: ParsedPrediction) => void;
}

export const VipSection: React.FC<VipSectionProps> = ({
  predictions,
  onAddToBetslip,
  onOpenAiAnalysis,
}) => {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('sure_odd_vip_unlocked') === 'true';
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toUpperCase() === 'VIP2024' || passcode.trim().toLowerCase() === 'admin') {
      setIsUnlocked(true);
      localStorage.setItem('sure_odd_vip_unlocked', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid VIP Access Passcode. Enter "VIP2024" or contact admin.');
    }
  };

  const handleLockAgain = () => {
    setIsUnlocked(false);
    localStorage.removeItem('sure_odd_vip_unlocked');
  };

  // High odds or VIP candidates
  const vipPicks = predictions.filter((p) => p.isVip || p.odds >= 1.70);
  const displayPicks = vipPicks.length > 0 ? vipPicks : predictions.slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd700]/10 border border-[#ffd700]/30 text-xs font-bold text-[#ffd700] mb-2">
          <Crown className="w-3.5 h-3.5 text-[#ffd700]" />
          <span>EXCLUSIVE INNER CIRCLE</span>
        </div>
        <h2 className="text-3xl font-black font-arena tracking-tight text-white">
          Sure Odd VIP Arena
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mt-1">
          High-yield correct score projections, premium weekend accumulators, and insider banker slips.
        </p>
      </div>

      {!isUnlocked ? (
        /* Locked Gate UI */
        <div className="bg-[#121316] border border-[#22252c] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1c1d24] border border-[#2d313c] flex items-center justify-center mx-auto mb-4 text-[#ffd700]">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white font-arena">
              VIP Gate Restricted
            </h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              This area contains high-confidence correct scores, banker multis, and risk-managed stake allocations. Enter your VIP Passcode to unlock.
            </p>

            {/* Passcode Form */}
            <form onSubmit={handleUnlock} className="mt-6 space-y-3">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="Enter VIP Passcode (e.g. VIP2024)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#181920] border border-[#2a2e38] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700]"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-400 text-left font-semibold">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#ffd700] hover:bg-[#ffe033] text-black font-extrabold text-xs tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg gold-glow"
              >
                <Unlock className="w-4 h-4" />
                <span>UNLOCK VIP PREDICTIONS</span>
              </button>
            </form>

            <div className="mt-4 p-3 bg-[#181a22] border border-[#252834] rounded-lg text-left text-xs text-gray-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#ffd700]">Instant Access Hint:</span>
                <span className="font-mono-numbers text-[11px] bg-black px-2 py-0.5 rounded text-white font-bold">
                  Code: VIP2024
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Subscribers and testers can use <code>VIP2024</code> to preview the full suite of premium predictions.
              </p>
            </div>

            {/* Direct WhatsApp VIP Group Link Card */}
            <a
              href={WHATSAPP_VIP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 p-3.5 bg-gradient-to-r from-[#0d2a17] to-[#12381f] border border-[#25D366]/40 hover:border-[#25D366] rounded-xl flex items-center justify-between transition-all group/wa text-left shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-black flex items-center justify-center font-bold shrink-0">
                  <MessageCircle className="w-5 h-5 fill-black" />
                </div>
                <div>
                  <span className="font-arena font-bold text-sm text-white block">
                    Join VIP WhatsApp Predictions
                  </span>
                  <span className="text-[11px] text-gray-300">
                    Get 100% sure banker tips and fixed odds on WhatsApp
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#25D366] group-hover/wa:translate-x-0.5 transition-transform shrink-0" />
            </a>
          </div>

          {/* Blurred Teaser Behind */}
          <div className="mt-8 pt-8 border-t border-[#1f2228] opacity-30 pointer-events-none filter blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#181920] rounded-xl border border-[#252830]">
                <div className="text-xs text-gray-400">UEFA Champions League</div>
                <div className="text-sm font-bold text-white mt-1">Real Madrid vs Manchester City</div>
                <div className="text-xs text-[#ffd700] mt-1">Correct Score 2-1 @ 9.50</div>
              </div>
              <div className="p-4 bg-[#181920] rounded-xl border border-[#252830]">
                <div className="text-xs text-gray-400">English Premier League</div>
                <div className="text-sm font-bold text-white mt-1">Liverpool vs Arsenal</div>
                <div className="text-xs text-[#ffd700] mt-1">Over 3.5 Goals & BTTS @ 2.85</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Unlocked VIP Dashboard */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Unlocked Banner */}
          <div className="p-4 bg-gradient-to-r from-[#1c1a12] via-[#14151a] to-[#121318] border border-[#ffd700]/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffd700] text-black flex items-center justify-center font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-arena font-bold text-base text-white">
                    VIP Pass Authorized
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 font-bold">
                    PREMIUM ACTIVE
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  Showing top-grade insider accumulator & banker picks
                </span>
              </div>
            </div>

            <button
              onClick={handleLockAgain}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded bg-[#1f2228] transition-colors"
            >
              Lock Gate
            </button>
          </div>

          {/* VIP Picks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayPicks.map((pick) => (
              <div
                key={pick.id}
                className="bg-[#121316] border border-[#ffd700]/20 hover:border-[#ffd700]/50 rounded-xl p-5 transition-all shadow-lg relative"
              >
                <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-[#1e2027]">
                  <span className="text-[#ffd700] font-semibold">{pick.league}</span>
                  <span className="text-[11px] text-gray-500 font-mono-numbers">
                    Kickoff: {pick.kickoff}
                  </span>
                </div>

                <div className="py-3">
                  <h4 className="font-arena font-bold text-base text-white">
                    {pick.home} vs {pick.away}
                  </h4>
                  <div className="mt-2 p-2.5 bg-[#181a20] rounded-lg border border-[#252832] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">
                        VIP Target Pick
                      </span>
                      <span className="text-sm font-bold text-[#00ff88]">
                        {pick.cleanTip}
                      </span>
                    </div>
                    <span className="font-mono-numbers font-black text-lg text-[#ffd700]">
                      @{pick.odds.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenAiAnalysis(pick)}
                    className="text-xs text-gray-400 hover:text-[#ffd700] flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                    <span>Algorithmic Stats</span>
                  </button>

                  <button
                    onClick={() => onAddToBetslip(pick)}
                    className="px-3.5 py-1.5 bg-[#ffd700] hover:bg-[#ffe033] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Add To Slip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
