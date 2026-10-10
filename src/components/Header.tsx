import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  ShieldAlert,
  MessageSquare,
  BarChart3,
  Tv,
  Lock,
  Layers,
  Sparkles,
  Ticket,
  Cloud,
  Code2,
  Menu,
  X,
  UserCheck,
  User,
  UserPlus,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

export const WHATSAPP_VIP_URL = 'https://chat.whatsapp.com/HTpr2ABAmU47puBpmngjCa?s=cl&p=a&mlu=4&ilr=4';

export type NavTab =
  | 'home'
  | 'free2odds'
  | 'vip'
  | 'live'
  | 'upcoming'
  | 'tables'
  | 'aianalysis'
  | 'chat'
  | 'admin';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  betslipCount: number;
  onOpenBetslip: () => void;
  onOpenDeployModal: () => void;
  onOpenApiModal: () => void;
  isAdminLoggedIn: boolean;
  currentUser?: { email: string; name?: string } | null;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  betslipCount,
  onOpenBetslip,
  onOpenDeployModal,
  onOpenApiModal,
  isAdminLoggedIn,
  currentUser,
  onOpenAuthModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'home', label: 'Home', icon: <Flame className="w-4 h-4 text-[#ffd700]" /> },
    { id: 'free2odds', label: 'Free 2 Odds', icon: <Ticket className="w-4 h-4 text-[#00ff88]" />, badge: 'HOT' },
    { id: 'vip', label: 'VIP', icon: <Lock className="w-4 h-4 text-[#ffd700]" /> },
    { id: 'live', label: 'Live Matches', icon: <Tv className="w-4 h-4 text-[#00ff88]" />, badge: 'LIVE' },
    { id: 'upcoming', label: 'Upcoming', icon: <Layers className="w-4 h-4 text-gray-400" /> },
    { id: 'tables', label: 'League Tables', icon: <BarChart3 className="w-4 h-4 text-blue-400" /> },
    { id: 'aianalysis', label: 'AI Analysis', icon: <Sparkles className="w-4 h-4 text-[#ffd700]" /> },
    { id: 'chat', label: 'Live Chat', icon: <MessageSquare className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1f2228]">
      {/* Moving WhatsApp VIP Prediction Marquee Ticker */}
      <div className="bg-gradient-to-r from-[#07190d] via-[#0d2a19] to-[#07190d] border-b border-[#25D366]/40 py-1.5 px-3 select-none overflow-hidden relative group">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
          {/* Static Left Badge */}
          <a
            href={WHATSAPP_VIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full shadow-md transition-transform hover:scale-105 z-10"
            title="Join VIP Prediction WhatsApp Group"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-black" />
            <span className="tracking-wide">VIP WHATSAPP</span>
          </a>

          {/* Continuous Moving Marquee */}
          <a
            href={WHATSAPP_VIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 overflow-hidden whitespace-nowrap flex items-center cursor-pointer text-xs font-semibold text-gray-200 hover:text-white"
            title="Click to join VIP WhatsApp for 100% Sure Predictions"
          >
            <div className="animate-marquee-smooth flex items-center gap-8 py-0.5">
              {[1, 2].map((loop) => (
                <div key={loop} className="flex items-center gap-6 text-[11px] sm:text-xs">
                  <span className="flex items-center gap-1.5 text-white font-bold">
                    🔥 <span className="text-[#ffd700]">JOIN OUR VIP WHATSAPP PREDICTION GROUP</span>
                  </span>
                  <span className="text-[#25D366] font-extrabold">
                    ★ 100% SURE VIP PREDICTIONS, 2+ ODDS DAILY BANKER & FIXED ODD DROPS
                  </span>
                  <span className="text-gray-300">
                    📈 Over 95% Win Accuracy · High-Roller Slips · Daily Winning Multipliers
                  </span>
                  <span className="text-[#ffd700] underline flex items-center gap-1 font-bold">
                    👉 Click to Join: chat.whatsapp.com/HTpr2ABAmU47puBpmngjCa
                  </span>
                  <span className="text-gray-500">|</span>
                </div>
              ))}
            </div>
          </a>

          {/* Static Right CTA */}
          <a
            href={WHATSAPP_VIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 hidden md:inline-flex items-center gap-1 px-3 py-0.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-[11px] rounded-full shadow-md transition-all hover:scale-105 z-10"
          >
            <span>JOIN VIP GROUP</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Top Bar for ticker and quick actions */}
      <div className="bg-[#101114] border-b border-[#181a20] px-4 py-1 text-xs text-gray-400 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
          </span>
          <span className="text-gray-300 font-medium">SURE ODD ARENA ENGINE:</span>
          <span className="text-gray-400 hidden sm:inline">Real-time Supabase Database Sync active · Banker 2 Odds daily</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAuthModal}
            className="hover:text-white flex items-center gap-1 transition-colors text-[11px] font-semibold text-[#ffd700]"
            title="User Account & Sign Up"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{currentUser ? (currentUser.name || currentUser.email.split('@')[0]) : 'Sign Up / In'}</span>
          </button>
          <span className="text-gray-700">|</span>
          <button
            onClick={onOpenDeployModal}
            className="hover:text-white flex items-center gap-1 transition-colors text-[11px]"
            title="Cloudflare Pages Deploy Info"
          >
            <Cloud className="w-3.5 h-3.5 text-[#ffd700]" />
            <span className="hidden md:inline">Deploy</span>
          </button>
          <span className="text-gray-700">|</span>
          <button
            onClick={onOpenApiModal}
            className="hover:text-white flex items-center gap-1 transition-colors text-[11px]"
            title="Football API Info"
          >
            <Code2 className="w-3.5 h-3.5 text-[#00ff88]" />
            <span className="hidden md:inline">Football API</span>
          </button>
          <span className="text-gray-700">|</span>
          <button
            onClick={() => onSelectTab('admin')}
            className={`flex items-center gap-1 transition-colors text-[11px] font-semibold ${
              isAdminLoggedIn ? 'text-[#00ff88]' : 'text-gray-400 hover:text-[#ffd700]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isAdminLoggedIn ? 'Admin (Active)' : 'Admin Login'}</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffd700] via-[#f59e0b] to-[#121316] p-0.5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0a0a0a] rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#ffd700]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-arena font-black text-xl tracking-wider text-white">
                SURE ODD
              </span>
              <span className="font-arena font-black text-xl tracking-wider text-[#ffd700]">
                ARENA
              </span>
            </div>
            <div className="text-[10px] text-gray-400 tracking-widest uppercase font-semibold">
              PREDICTIONS & LIVE ARENA
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 relative ${
                  isActive
                    ? 'bg-[#181920] text-[#ffd700] border border-[#2b2f3a]'
                    : 'text-gray-300 hover:text-white hover:bg-[#14151a]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                      item.badge === 'LIVE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        : 'bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side controls (Betslip + Sign Up + Mobile Menu) */}
        <div className="flex items-center gap-2">
          {/* Betslip Button with Red Notification Dot Badge */}
          <button
            onClick={onOpenBetslip}
            className={`relative px-3.5 py-2 rounded-lg font-bold text-xs tracking-wider transition-all flex items-center gap-2 shadow-md ${
              betslipCount > 0
                ? 'bg-[#ffd700] hover:bg-[#ffe033] text-black gold-glow'
                : 'bg-[#181920] hover:bg-[#20222a] text-gray-300 border border-[#262932]'
            }`}
          >
            {/* Red notification dot badge when items are in betslip */}
            {betslipCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-[#0a0a0a]"></span>
              </span>
            )}
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">BETSLIP</span>
            {betslipCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-black text-[#ffd700] text-[11px] font-mono-numbers flex items-center justify-center font-bold">
                {betslipCount}
              </span>
            )}
          </button>

          {/* User Sign Up / Account Button */}
          <button
            onClick={onOpenAuthModal}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 border ${
              currentUser
                ? 'bg-[#181920] border-[#00ff88]/40 text-[#00ff88] hover:border-[#00ff88]'
                : 'bg-[#16171d] hover:bg-[#1f212a] border-[#292c36] text-gray-200 hover:text-[#ffd700]'
            }`}
            title={currentUser ? `Signed in as ${currentUser.email}` : 'Sign up with email & password'}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {currentUser ? (currentUser.name || currentUser.email.split('@')[0]) : 'Sign Up'}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-[#181920] rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#101114] border-b border-[#22252c] px-4 py-3 space-y-1">
          {/* Mobile WhatsApp VIP Link */}
          <a
            href={WHATSAPP_VIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between bg-[#0e2716] border border-[#25D366]/40 text-[#25D366] mb-2"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Join VIP WhatsApp Group</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Sign Up Button */}
          <button
            onClick={() => {
              onOpenAuthModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between bg-[#1b1c24] border border-[#2b2f3d] text-[#ffd700] mb-2"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#ffd700]" />
              <span>{currentUser ? `Account: ${currentUser.email}` : 'Sign Up / Sign In (Email & Password)'}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700]">
              {currentUser ? 'Active' : 'Free'}
            </span>
          </button>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  isActive
                    ? 'bg-[#181920] text-[#ffd700] border border-[#2a2e38]'
                    : 'text-gray-300 hover:bg-[#14151a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#1c1e24] flex items-center justify-between text-xs text-gray-400 px-1">
            <button
              onClick={() => {
                onSelectTab('admin');
                setMobileMenuOpen(false);
              }}
              className="text-[#ffd700] font-bold py-1.5"
            >
              Admin Dashboard (/admin)
            </button>
            <span className="text-gray-600">v1.0 Production</span>
          </div>
        </div>
      )}
    </header>
  );
};
