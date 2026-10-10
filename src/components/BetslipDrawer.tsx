import React, { useState } from 'react';
import { X, Trash2, Ticket, Check, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { BetslipItem } from '../types';

interface BetslipDrawerProps {
  items: BetslipItem[];
  isOpen: boolean;
  onToggle: () => void;
  onRemoveItem: (id: number | string) => void;
  onClearAll: () => void;
}

export const BetslipDrawer: React.FC<BetslipDrawerProps> = ({
  items,
  isOpen,
  onToggle,
  onRemoveItem,
  onClearAll,
}) => {
  const [stake, setStake] = useState<number>(1000);
  const [currency, setCurrency] = useState<'NGN' | 'USD' | 'EUR' | 'GHS'>('NGN');
  const [generatedCode, setGeneratedCode] = useState<{
    bookmaker: string;
    code: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Calculate total combined odds
  const totalOdds = items.reduce((acc, curr) => acc * curr.odds, 1);
  const formattedOdds = items.length > 0 ? Number(totalOdds.toFixed(2)) : 0;
  const potentialPayout = Math.round(stake * totalOdds);

  const handleGenerateCode = (bookmaker: string) => {
    const prefixes: Record<string, string> = {
      SportyBet: 'SB',
      Bet9ja: 'B9JA',
      MSport: 'MSP',
      'Football.com': 'FB',
    };
    const prefix = prefixes[bookmaker] || 'SOA';
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `${prefix}-${rand}`;
    setGeneratedCode({ bookmaker, code });
    setCopied(false);
  };

  const copyBookingCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 z-40 w-full sm:w-96 transition-all duration-300">
      {/* Floating Toggle Bar */}
      <div
        onClick={onToggle}
        className="relative cursor-pointer bg-[#ffd700] hover:bg-[#ffe033] text-black px-4 py-3 flex items-center justify-between shadow-2xl rounded-t-xl select-none"
      >
        {/* Red notification dot badge when items are in betslip */}
        {items.length > 0 && (
          <span className="absolute -top-1.5 -left-1.5 sm:left-auto sm:-right-1.5 flex h-3.5 w-3.5 z-50">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-[#0a0a0a]"></span>
          </span>
        )}
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 font-bold" />
          <span className="font-arena font-bold text-base tracking-wide">
            BETSLIP ({items.length})
          </span>
          <span className="font-mono-numbers text-xs bg-black text-[#ffd700] font-bold px-2 py-0.5 rounded">
            {formattedOdds}x Total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">
            {isOpen ? 'Minimize' : 'View Slip'}
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Drawer Content */}
      {isOpen && (
        <div className="bg-[#121316] border-x border-t border-[#22252c] max-h-[75vh] overflow-y-auto p-4 text-white shadow-2xl">
          {/* Header Actions */}
          <div className="flex items-center justify-between pb-3 border-b border-[#22252c] text-xs">
            <span className="text-gray-400">
              Accumulator Selections ({items.length})
            </span>
            <button
              onClick={onClearAll}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>

          {/* Items List */}
          <div className="py-2 space-y-2 divide-y divide-[#1e2027]">
            {items.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-gray-400 truncate">{item.league}</div>
                  <div className="text-xs font-semibold text-white truncate">
                    {item.home} vs {item.away}
                  </div>
                  <div className="text-xs text-[#ffd700] mt-0.5">
                    Pick: <strong>{item.selection}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono-numbers font-bold text-sm text-[#00ff88]">
                    {item.odds.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                    title="Remove from slip"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Odds & Stake Calculation */}
          <div className="pt-4 border-t border-[#22252c] space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Total Multiplier:</span>
              <span className="font-mono-numbers font-bold text-lg text-[#ffd700]">
                {formattedOdds}
              </span>
            </div>

            {/* Stake Input */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                <span>Stake Amount:</span>
                <div className="flex gap-1">
                  {(['NGN', 'USD', 'GHS'] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        currency === curr
                          ? 'bg-[#ffd700] text-black font-bold'
                          : 'bg-[#1f2228] text-gray-400'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={stake}
                  onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#18191f] border border-[#2a2e38] rounded-lg px-3 py-2 text-sm text-white font-mono-numbers focus:outline-none focus:border-[#ffd700]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-mono-numbers">
                  {currency}
                </span>
              </div>
            </div>

            {/* Quick Stake Buttons */}
            <div className="flex gap-1.5 text-xs font-mono-numbers">
              {[500, 1000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setStake(amt)}
                  className="flex-1 py-1 rounded bg-[#1c1e24] hover:bg-[#252830] text-gray-300 border border-[#262932] transition-colors text-[11px]"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Potential Payout */}
            <div className="p-3 bg-[#18191f] border border-[#282c36] rounded-lg flex justify-between items-center">
              <div>
                <span className="text-[11px] text-gray-400 block">Potential Return</span>
                <span className="font-arena font-bold text-lg text-[#00ff88]">
                  {currency} {potentialPayout.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono-numbers">
                Net Profit: +{(potentialPayout - stake).toLocaleString()}
              </span>
            </div>

            {/* Booking Code Generation */}
            <div>
              <span className="text-xs text-gray-400 block mb-1.5">
                Generate Instant Booking Code:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {['SportyBet', 'Bet9ja', 'MSport', 'Football.com'].map((bookie) => (
                  <button
                    key={bookie}
                    onClick={() => handleGenerateCode(bookie)}
                    className="py-1.5 px-2 bg-[#1b1c22] hover:bg-[#232630] border border-[#2c2f3a] text-xs font-semibold text-gray-200 rounded transition-colors text-left"
                  >
                    {bookie}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Code Display */}
            {generatedCode && (
              <div className="p-3 bg-[#16221c] border border-[#00ff88]/30 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#00ff88] uppercase block">
                    {generatedCode.bookmaker} Code
                  </span>
                  <span className="font-mono-numbers font-bold text-sm text-white">
                    {generatedCode.code}
                  </span>
                </div>
                <button
                  onClick={copyBookingCode}
                  className="px-3 py-1 bg-[#00ff88] hover:bg-[#00e67a] text-black font-bold text-xs rounded transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
