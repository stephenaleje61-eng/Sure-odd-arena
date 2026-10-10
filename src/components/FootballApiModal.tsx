import React from 'react';
import { X, ExternalLink, Code2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface FootballApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FootballApiModal: React.FC<FootballApiModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121316] border border-[#22252c] rounded-xl shadow-2xl p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#22252c]">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#ffd700] font-semibold block">
              Integration Architecture Guide
            </span>
            <h2 className="text-xl font-bold mt-1 text-white font-arena">
              Connect Live Football API (API-Sports / Football-Data.org)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1f2228] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-sm">
          <p className="text-gray-300 leading-relaxed">
            Currently, Sure Odd Arena fetches live matches, upcoming fixtures, and banker predictions directly from your <strong>Supabase <code className="text-[#ffd700]">odds</code> database</strong> in real time. To automate live score feeds and fixtures from external providers, follow these steps:
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-[#18191f] border border-[#22252c] rounded-lg">
              <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                1. Register for API-Sports Key
              </h3>
              <p className="text-xs text-gray-400">
                Head to <a href="https://www.api-football.com" target="_blank" rel="noopener noreferrer" className="text-[#ffd700] hover:underline inline-flex items-center gap-1">api-football.com <ExternalLink className="w-3 h-3" /></a> and generate a free API key (provides 100 free requests/day covering live scores, lineups, and odds).
              </p>
            </div>

            <div className="p-4 bg-[#18191f] border border-[#22252c] rounded-lg">
              <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                2. Configure Automated Cron / Edge Function
              </h3>
              <p className="text-xs text-gray-400 mb-2">
                Create a Supabase Edge Function or GitHub Action that runs every 15 minutes to fetch upcoming fixtures and upsert into the <code className="text-[#ffd700]">odds</code> table:
              </p>
              <div className="bg-[#0b0c0e] p-3 rounded font-mono-numbers text-xs text-gray-300 overflow-x-auto border border-[#252830]">
                <code>
                  {`// Sample Supabase Edge Function snippet:
const res = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
  headers: { "x-apisports-key": Deno.env.get("API_SPORTS_KEY") }
});
const { response } = await res.json();
for (const match of response) {
  await supabase.from('odds').upsert({
    league: match.league.name,
    home: match.teams.home.name,
    away: match.teams.away.name,
    tip: \`Home Win [\${match.fixture.status.elapsed}' | Live]\`,
    odds: 1.80
  });
}`}
                </code>
              </div>
            </div>

            <div className="p-4 bg-[#18191f] border border-[#22252c] rounded-lg">
              <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                3. Zero Client-Side Secret Exposure
              </h3>
              <p className="text-xs text-gray-400">
                Never place the external Football API secret key into frontend client code. Store it safely inside Cloudflare Pages Environment Secrets or Supabase Vault, synchronizing directly into the database.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#16221c] border border-[#00ff88]/30 rounded-lg flex items-start gap-2 text-xs text-gray-300">
            <ShieldAlert className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
            <p>
              <strong>Current Status:</strong> Your Supabase database is active and connected. Administrators can immediately create, schedule, and grade live matches directly inside the <strong>Admin Dashboard</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
