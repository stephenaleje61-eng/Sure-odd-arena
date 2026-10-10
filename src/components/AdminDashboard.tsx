import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  PlusCircle,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Database,
  MessageSquare,
  LogOut,
  X,
  Flame,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ParsedPrediction, RawOdd } from '../types';
import { formatTipForDatabase } from '../lib/oddsParser';

interface AdminDashboardProps {
  isAdminLoggedIn: boolean;
  onLoginStateChange: (state: boolean) => void;
  predictions: ParsedPrediction[];
  onRefreshData: () => void;
  onSeedMatches: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAdminLoggedIn,
  onLoginStateChange,
  predictions,
  onRefreshData,
  onSeedMatches,
}) => {
  // Login form states
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin tabs
  const [activeTab, setActiveTab] = useState<'predictions' | 'chat' | 'database'>('predictions');

  // Prediction Form State (Add / Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);

  const [formLeague, setFormLeague] = useState('Premier League');
  const [formHome, setFormHome] = useState('');
  const [formAway, setFormAway] = useState('');
  const [formTip, setFormTip] = useState('');
  const [formOdds, setFormOdds] = useState('1.85');
  const [formMarket, setFormMarket] = useState('1X2 (Match Winner)');
  const [formKickoff, setFormKickoff] = useState('19:00');
  const [formDate, setFormDate] = useState('Today');
  const [formResult, setFormResult] = useState('pending');
  const [formIsVip, setFormIsVip] = useState(false);
  const [formIsLive, setFormIsLive] = useState(false);

  // Status message
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<ParsedPrediction | null>(null);

  // Chat moderation state
  const [moderationMessages, setModerationMessages] = useState<Array<{ id: number | string; username: string; message: string; created_at: string }>>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Login handler: credentials admin / SureArena2024!
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === 'admin' && passwordInput.trim() === 'SureArena2024!') {
      onLoginStateChange(true);
      setLoginError('');
      showFeedback('success', 'Admin authenticated successfully.');
    } else {
      setLoginError('Invalid credentials. Use admin / SureArena2024!');
    }
  };

  const handleLogout = () => {
    onLoginStateChange(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormHome('');
    setFormAway('');
    setFormTip('');
    setFormOdds('1.85');
    setFormMarket('1X2 (Match Winner)');
    setFormKickoff('19:00');
    setFormDate('Today');
    setFormResult('pending');
    setFormIsVip(false);
    setFormIsLive(false);
  };

  // Setup form for editing
  const startEditing = (p: ParsedPrediction) => {
    setIsEditing(true);
    setEditId(p.id);
    setFormLeague(p.league);
    setFormHome(p.home);
    setFormAway(p.away);
    setFormTip(p.cleanTip);
    setFormOdds(String(p.odds));
    setFormMarket(p.market);
    setFormKickoff(p.kickoff);
    setFormDate(p.date || 'Today');
    setFormResult(p.result);
    setFormIsVip(p.isVip);
    setFormIsLive(p.status === 'live');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save (Create or Update) prediction to Supabase odds table
  const handleSubmitPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHome.trim() || !formAway.trim() || !formTip.trim()) {
      showFeedback('error', 'Please fill in home team, away team, and prediction tip.');
      return;
    }

    const oddsNumber = parseFloat(formOdds);
    if (isNaN(oddsNumber) || oddsNumber <= 1.0) {
      showFeedback('error', 'Please enter valid odds greater than 1.00');
      return;
    }

    // Format tip with tags
    const finalTip = formatTipForDatabase({
      tip: formTip.trim(),
      market: formMarket,
      kickoff: formKickoff,
      date: formDate,
      isVip: formIsVip,
      result: formIsLive ? 'live' : formResult,
    });

    try {
      if (isEditing && editId !== null) {
        // Update in Supabase
        const { error } = await supabase
          .from('odds')
          .update({
            league: formLeague,
            home: formHome.trim(),
            away: formAway.trim(),
            tip: finalTip,
            odds: oddsNumber,
          })
          .eq('id', editId);

        if (error) throw error;
        showFeedback('success', `Prediction #${editId} updated in Supabase odds table.`);
      } else {
        // Insert into Supabase
        const { error } = await supabase.from('odds').insert([
          {
            league: formLeague,
            home: formHome.trim(),
            away: formAway.trim(),
            tip: finalTip,
            odds: oddsNumber,
          },
        ]);

        if (error) throw error;
        showFeedback('success', 'New prediction created in Supabase odds table.');
      }

      resetForm();
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Failed to save: ${err.message || 'Database error'}`);
    }
  };

  // Confirm delete
  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.from('odds').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      showFeedback('success', `Prediction #${deleteTarget.id} deleted from Supabase.`);
      setDeleteTarget(null);
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Failed to delete: ${err.message}`);
    }
  };

  // Load chat messages for moderation
  const loadModerationChat = async () => {
    setLoadingChat(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('id', { ascending: false })
        .limit(50);
      if (!error && data) {
        setModerationMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  // Delete message from Supabase
  const deleteChatMessage = async (msgId: number | string) => {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', msgId);
      if (!error) {
        setModerationMessages((prev) => prev.filter((m) => m.id !== msgId));
        showFeedback('success', `Chat message #${msgId} deleted.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-[#121316] border border-[#22252c] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#ffd700] text-black flex items-center justify-center mx-auto mb-4 font-bold shadow-md">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-black font-arena text-center text-white">
            Admin Dashboard Login
          </h2>
          <p className="text-xs text-gray-400 text-center mt-1">
            Sign in to manage predictions, moderate chat, and sync Supabase odds.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="w-full px-3 py-2 bg-[#181920] border border-[#262932] rounded-lg text-sm text-white focus:outline-none focus:border-[#ffd700]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-[#181920] border border-[#262932] rounded-lg text-sm text-white focus:outline-none focus:border-[#ffd700]"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-semibold">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#ffd700] hover:bg-[#ffe033] text-black font-extrabold text-xs tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg gold-glow"
            >
              <Unlock className="w-4 h-4" />
              <span>AUTHENTICATE ADMIN</span>
            </button>
          </form>

          <div className="mt-4 p-3 bg-[#181920] border border-[#22252c] rounded-lg text-[11px] text-gray-400 text-center">
            Credentials: <code className="text-[#ffd700]">admin</code> / <code className="text-[#ffd700]">SureArena2024!</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast Feedback */}
      {actionMessage && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            actionMessage.type === 'success'
              ? 'bg-[#122216] border border-[#00ff88] text-white'
              : 'bg-[#251313] border border-red-500 text-white'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121316] border border-[#22252c] rounded-xl p-6 max-w-md w-full shadow-2xl text-white">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-center font-arena">
              Confirm Delete Prediction?
            </h3>
            <p className="text-xs text-gray-400 text-center mt-2 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">
                {deleteTarget.home} vs {deleteTarget.away} (#{deleteTarget.id})
              </strong>{' '}
              from Supabase? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-[#1f2228] hover:bg-[#282d38] text-gray-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold"
              >
                Yes, Delete From Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#1f2228] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#00ff88] tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#00ff88]" />
            <span>AUTHENTICATED ADMINISTRATOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-arena tracking-tight text-white mt-1">
            Arena Master Control Panel
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Direct read/write access to Supabase database (<code className="text-[#ffd700]">odds</code> & <code className="text-[#ffd700]">messages</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSeedMatches}
            className="px-3 py-1.5 bg-[#181920] hover:bg-[#222530] border border-[#2d313d] text-xs font-semibold text-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Seed 8 real matches"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>Seed Fixtures</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 py-4 border-b border-[#1f2228]">
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === 'predictions'
              ? 'bg-[#ffd700] text-black'
              : 'bg-[#121316] text-gray-300 hover:bg-[#1a1c22]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>PREDICTIONS ({predictions.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('chat');
            loadModerationChat();
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-[#ffd700] text-black'
              : 'bg-[#121316] text-gray-300 hover:bg-[#1a1c22]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>CHAT MODERATION</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === 'database'
              ? 'bg-[#ffd700] text-black'
              : 'bg-[#121316] text-gray-300 hover:bg-[#1a1c22]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>DATABASE STATUS</span>
        </button>
      </div>

      {/* Tab 1: Predictions Management */}
      {activeTab === 'predictions' && (
        <div className="mt-6 space-y-8">
          {/* Add / Edit Form Card */}
          <div className="bg-[#121316] border border-[#22252c] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e2027]">
              <div className="flex items-center gap-2">
                <span className="font-arena font-bold text-lg text-white">
                  {isEditing ? `Edit Prediction #${editId}` : 'Add New Prediction'}
                </span>
                {isEditing && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                    EDITING MODE
                  </span>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitPrediction} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* League */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    League
                  </label>
                  <select
                    value={formLeague}
                    onChange={(e) => setFormLeague(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181920] border border-[#262932] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700]"
                  >
                    <option value="Premier League">English Premier League</option>
                    <option value="La Liga">Spanish La Liga</option>
                    <option value="Serie A">Italian Serie A</option>
                    <option value="Bundesliga">German Bundesliga</option>
                    <option value="Ligue 1">French Ligue 1</option>
                    <option value="Champions League">UEFA Champions League</option>
                    <option value="Europa League">UEFA Europa League</option>
                    <option value="NPFL Nigeria">Nigeria Premier Football League (NPFL)</option>
                    <option value="International">International</option>
                  </select>
                </div>

                {/* Home Team */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Home Team *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arsenal"
                    value={formHome}
                    onChange={(e) => setFormHome(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181920] border border-[#262932] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700]"
                  />
                </div>

                {/* Away Team */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Away Team *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chelsea"
                    value={formAway}
                    onChange={(e) => setFormAway(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181920] border border-[#262932] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Prediction Tip */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Prediction Tip / Selection *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arsenal Win (1) or Over 2.5"
                    value={formTip}
                    onChange={(e) => setFormTip(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181920] border border-[#262932] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700]"
                  />
                </div>

                {/* Odds */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Decimal Odds *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    placeholder="1.85"
                    value={formOdds}
                    onChange={(e) => setFormOdds(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181920] border border-[#262932] rounded-lg text-xs text-white font-mono-numbers focus:outline-none focus:border-[#ffd700]"
                  />
                </div>

                {/* Market */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Market
                  </label>
                  <select
                    value={formMarket}
                    onChange={(e) => setFormMarket(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181920] border border-[#262932] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700]"
                  >
                    <option value="1X2 (Match Winner)">1X2 (Match Winner)</option>
                    <option value="Over/Under Goals">Over/Under Goals</option>
                    <option value="Both Teams To Score">Both Teams To Score (BTTS)</option>
                    <option value="Double Chance">Double Chance (1X, 12, X2)</option>
                    <option value="Draw No Bet">Draw No Bet (DNB)</option>
                    <option value="Correct Score">Correct Score</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                {/* Kickoff */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Kickoff Time
                  </label>
                  <input
                    type="text"
                    placeholder="19:00"
                    value={formKickoff}
                    onChange={(e) => setFormKickoff(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181920] border border-[#262932] rounded-lg text-xs text-white font-mono-numbers focus:outline-none focus:border-[#ffd700]"
                  />
                </div>

                {/* Result */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Match Status / Result
                  </label>
                  <select
                    value={formResult}
                    onChange={(e) => setFormResult(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181920] border border-[#262932] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700]"
                  >
                    <option value="pending">Pending (Upcoming)</option>
                    <option value="won">Won (Completed)</option>
                    <option value="lost">Lost (Completed)</option>
                  </select>
                </div>

                {/* Live toggle */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="liveCheckbox"
                    checked={formIsLive}
                    onChange={(e) => setFormIsLive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00ff88]"
                  />
                  <label htmlFor="liveCheckbox" className="text-xs font-semibold text-white">
                    Mark In-Play / Live
                  </label>
                </div>

                {/* VIP toggle */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="vipCheckbox"
                    checked={formIsVip}
                    onChange={(e) => setFormIsVip(e.target.checked)}
                    className="w-4 h-4 rounded text-[#ffd700]"
                  />
                  <label htmlFor="vipCheckbox" className="text-xs font-semibold text-[#ffd700]">
                    VIP Only Tip
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-[#181920] hover:bg-[#20232c] text-gray-300 text-xs font-semibold rounded-lg"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#ffd700] hover:bg-[#ffe033] text-black font-extrabold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md gold-glow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isEditing ? 'Update Prediction' : 'Save To Supabase'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Predictions List */}
          <div className="bg-[#121316] border border-[#22252c] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#1f2228] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="font-arena font-bold text-base text-white">
                All Predictions in Supabase table <code className="text-[#ffd700]">odds</code> ({predictions.length})
              </span>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#181920] border border-[#262932] rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#171920] border-b border-[#22252c] text-[11px] uppercase tracking-wider text-gray-400">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">League</th>
                    <th className="py-2.5 px-4">Fixture</th>
                    <th className="py-2.5 px-3">Tip</th>
                    <th className="py-2.5 px-3 text-right">Odds</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2028]">
                  {predictions
                    .filter((p) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        p.home.toLowerCase().includes(q) ||
                        p.away.toLowerCase().includes(q) ||
                        p.league.toLowerCase().includes(q)
                      );
                    })
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-[#181920] transition-colors">
                        <td className="py-3 px-3 font-mono-numbers text-gray-400">
                          #{item.id}
                        </td>
                        <td className="py-3 px-3 text-gray-300 truncate max-w-[120px]">
                          {item.league}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {item.home} vs {item.away}
                        </td>
                        <td className="py-3 px-3 text-[#ffd700] font-semibold truncate max-w-[150px]">
                          {item.cleanTip}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-numbers font-bold text-[#00ff88]">
                          {item.odds.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.result === 'won'
                                ? 'bg-[#00ff88]/20 text-[#00ff88]'
                                : item.result === 'lost'
                                ? 'bg-red-500/20 text-red-400'
                                : item.status === 'live'
                                ? 'bg-red-500/20 text-red-400 animate-pulse'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}
                          >
                            {item.status === 'live' ? 'LIVE' : item.result.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEditing(item)}
                              className="p-1.5 text-gray-400 hover:text-[#ffd700] hover:bg-[#20222a] rounded transition-colors"
                              title="Edit prediction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#20222a] rounded transition-colors"
                              title="Delete prediction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chat Moderation */}
      {activeTab === 'chat' && (
        <div className="mt-6 bg-[#121316] border border-[#22252c] rounded-2xl overflow-hidden shadow-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1f2228]">
            <div>
              <h3 className="font-arena font-bold text-lg text-white">
                Live Chat Moderation (<code className="text-[#ffd700]">messages</code> table)
              </h3>
              <p className="text-xs text-gray-400">
                Instantly remove spam, abusive language, or fraudulent codes.
              </p>
            </div>
            <button
              onClick={loadModerationChat}
              className="p-2 bg-[#181920] hover:bg-[#222530] text-gray-300 rounded-lg text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingChat ? 'animate-spin' : ''}`} />
              <span>Refresh Messages</span>
            </button>
          </div>

          <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
            {moderationMessages.length === 0 ? (
              <p className="text-xs text-gray-500 py-8 text-center">
                No chat messages loaded or table is empty. Click refresh.
              </p>
            ) : (
              moderationMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 bg-[#181920] border border-[#232630] rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#ffd700] font-arena">{msg.username}</span>
                      <span className="text-[10px] text-gray-500 font-mono-numbers">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 break-words">{msg.message}</p>
                  </div>
                  <button
                    onClick={() => deleteChatMessage(msg.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                    title="Delete message from database"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Database Status */}
      {activeTab === 'database' && (
        <div className="mt-6 bg-[#121316] border border-[#22252c] rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="font-arena font-bold text-lg text-white">
              Supabase Primary Database Status
            </h3>
            <p className="text-xs text-gray-400">
              Live configuration details for this environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-[#181920] border border-[#252830] rounded-xl">
              <span className="text-xs text-gray-400 block">Supabase Connection</span>
              <span className="font-bold text-base text-[#00ff88] mt-1 block">Active & Healthy</span>
              <span className="text-[11px] text-gray-500 block mt-0.5">URL: wbwramyjxeogizylfxwu</span>
            </div>

            <div className="p-4 bg-[#181920] border border-[#252830] rounded-xl">
              <span className="text-xs text-gray-400 block">Odds Table Records</span>
              <span className="font-mono-numbers font-bold text-2xl text-white mt-1 block">
                {predictions.length}
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">Real database count</span>
            </div>

            <div className="p-4 bg-[#181920] border border-[#252830] rounded-xl">
              <span className="text-xs text-gray-400 block">Realtime Messages</span>
              <span className="font-bold text-base text-[#ffd700] mt-1 block">Listening</span>
              <span className="text-[11px] text-gray-500 block mt-0.5">Presence channel enabled</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
