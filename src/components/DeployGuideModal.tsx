import React, { useState } from 'react';
import { X, Check, Copy, Cloud, Terminal, ShieldCheck } from 'lucide-react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121316] border border-[#22252c] rounded-xl shadow-2xl p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#22252c]">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#ffd700] font-semibold">
              <Cloud className="w-4 h-4 text-[#ffd700]" />
              <span>Production Deployment Guide</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white font-arena">
              Deploy to Cloudflare Pages
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1f2228] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-gray-300">
          <p>
            Sure Odd Arena is built as a production-grade single page application (Vite + React + Tailwind CSS) optimized for sub-50ms worldwide edge delivery via <strong>Cloudflare Pages</strong>.
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-[#18191f] border border-[#22252c] rounded-lg">
              <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00ff88]" />
                Cloudflare Pages Build Settings
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-numbers">
                <div className="bg-[#101114] p-2.5 rounded border border-[#252830]">
                  <span className="text-gray-400 block text-[11px]">Framework Preset</span>
                  <span className="text-white font-bold">Vite</span>
                </div>
                <div className="bg-[#101114] p-2.5 rounded border border-[#252830]">
                  <span className="text-gray-400 block text-[11px]">Build command</span>
                  <span className="text-[#ffd700] font-bold">npm run build</span>
                </div>
                <div className="bg-[#101114] p-2.5 rounded border border-[#252830]">
                  <span className="text-gray-400 block text-[11px]">Build output directory</span>
                  <span className="text-[#00ff88] font-bold">dist</span>
                </div>
                <div className="bg-[#101114] p-2.5 rounded border border-[#252830]">
                  <span className="text-gray-400 block text-[11px]">Node.js Version</span>
                  <span className="text-white font-bold">20.x or higher</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#18191f] border border-[#22252c] rounded-lg">
              <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#ffd700]" />
                Environment Variables (Configured in Project)
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                The frontend communicates directly with your Supabase backend using the publishable public key:
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-[#101114] rounded border border-[#252830] text-xs">
                  <div className="truncate mr-2">
                    <span className="text-gray-400 block text-[10px]">SUPABASE URL</span>
                    <span className="font-mono-numbers text-white">{SUPABASE_URL}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(SUPABASE_URL, 'url')}
                    className="p-1.5 bg-[#1f2228] hover:bg-[#282d38] rounded text-gray-300"
                  >
                    {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-[#00ff88]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#101114] rounded border border-[#252830] text-xs">
                  <div className="truncate mr-2">
                    <span className="text-gray-400 block text-[10px]">SUPABASE PUBLISHABLE KEY</span>
                    <span className="font-mono-numbers text-gray-300 truncate max-w-xs block">{SUPABASE_ANON_KEY}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(SUPABASE_ANON_KEY, 'key')}
                    className="p-1.5 bg-[#1f2228] hover:bg-[#282d38] rounded text-gray-300"
                  >
                    {copiedKey === 'key' ? <Check className="w-3.5 h-3.5 text-[#00ff88]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
