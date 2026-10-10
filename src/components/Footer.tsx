import React from 'react';
import { Trophy, ShieldAlert, Heart, ExternalLink } from 'lucide-react';
import { NavTab } from './Header';

interface FooterProps {
  onNavigate: (tab: NavTab) => void;
  onOpenDeployModal: () => void;
  onOpenApiModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenDeployModal,
  onOpenApiModal,
}) => {
  return (
    <footer className="bg-[#070709] border-t border-[#1a1c22] mt-16 pt-12 pb-16 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#181a20]">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#ffd700] text-black flex items-center justify-center font-bold">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="font-arena font-black text-lg text-white tracking-wider">
                SURE ODD <span className="text-[#ffd700]">ARENA</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Production football prediction engine and sports betting intelligence platform. Powered by real database tracking, algorithmic probabilities, and live community chat.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[#00ff88]"></span>
              <span>Supabase Realtime Cluster Active</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Arena Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#ffd700] transition-colors"
                >
                  Homepage Predictions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('free2odds')}
                  className="hover:text-[#ffd700] transition-colors"
                >
                  Free 2 Odds Daily Slip
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('vip')}
                  className="hover:text-[#ffd700] transition-colors"
                >
                  VIP High-Roller Club
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('live')}
                  className="hover:text-[#ffd700] transition-colors"
                >
                  In-Play & Live Matches
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tables')}
                  className="hover:text-[#ffd700] transition-colors"
                >
                  Football League Tables
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('chat')}
                  className="hover:text-[#ffd700] transition-colors"
                >
                  Real-time Bettors Chat
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Bookmakers & Deployment */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Supported Bookmakers
            </h4>
            <ul className="space-y-2">
              <li className="text-gray-300">SportyBet Nigeria & Global</li>
              <li className="text-gray-300">MSport Fast Payouts</li>
              <li className="text-gray-300">Football.com Arena</li>
              <li className="text-gray-300">Bet9ja Premier Odds</li>
            </ul>

            <div className="mt-4 pt-3 border-t border-[#181a20] space-y-1.5">
              <a
                href="https://chat.whatsapp.com/HTpr2ABAmU47puBpmngjCa?s=cl&p=a&mlu=4&ilr=4"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline font-bold block text-[11px]"
              >
                💬 Join VIP WhatsApp Group
              </a>
              <button
                onClick={onOpenDeployModal}
                className="text-[#ffd700] hover:underline block text-[11px]"
              >
                Cloudflare Pages Deploy Docs
              </button>
              <button
                onClick={onOpenApiModal}
                className="text-[#00ff88] hover:underline block text-[11px]"
              >
                API-Sports Integration Guide
              </button>
            </div>
          </div>
        </div>

        {/* Responsible Gambling & Legal Notice */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[10px] border border-red-500/30">
              18+ ONLY
            </span>
            <span>
              Gambling carries financial risk. Predictions are statistical evaluations, not guarantees. Bet responsibly.
            </span>
          </div>

          <div className="text-center md:text-right">
            <span>© {new Date().getFullYear()} Sure Odd Arena. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
