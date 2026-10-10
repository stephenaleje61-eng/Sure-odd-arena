import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { RawOdd, ParsedPrediction, BetslipItem } from './types';
import { parsePrediction } from './lib/oddsParser';

import { Header, NavTab } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { PredictionList } from './components/PredictionList';
import { FreeTwoOdds } from './components/FreeTwoOdds';
import { VipSection } from './components/VipSection';
import { LiveMatches } from './components/LiveMatches';
import { LeagueTables } from './components/LeagueTables';
import { RealtimeChat } from './components/RealtimeChat';
import { AdminDashboard } from './components/AdminDashboard';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { BookmakersModal } from './components/BookmakersModal';
import { BetslipDrawer } from './components/BetslipDrawer';
import { DeployGuideModal } from './components/DeployGuideModal';
import { FootballApiModal } from './components/FootballApiModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Supabase Predictions State
  const [predictions, setPredictions] = useState<ParsedPrediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState<boolean>(true);

  // User Authentication State (Sign up with Email and Password)
  const [currentUser, setCurrentUser] = useState<{ email: string; name?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('sure_odd_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('sure_odd_admin_session') === 'true';
  });

  const handleAdminLoginStateChange = (state: boolean) => {
    setIsAdminLoggedIn(state);
    if (state) {
      localStorage.setItem('sure_odd_admin_session', 'true');
    } else {
      localStorage.removeItem('sure_odd_admin_session');
    }
  };

  const handleAuthSuccess = (user: { email: string; name?: string }) => {
    setCurrentUser(user);
    localStorage.setItem('sure_odd_current_user', JSON.stringify(user));
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }
    setCurrentUser(null);
    localStorage.removeItem('sure_odd_current_user');
  };

  // Check Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        const user = {
          email: session.user.email,
          name: session.user.user_metadata?.display_name || session.user.email.split('@')[0],
        };
        setCurrentUser(user);
        localStorage.setItem('sure_odd_current_user', JSON.stringify(user));
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        const user = {
          email: session.user.email,
          name: session.user.user_metadata?.display_name || session.user.email.split('@')[0],
        };
        setCurrentUser(user);
        localStorage.setItem('sure_odd_current_user', JSON.stringify(user));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Betslip State
  const [betslipItems, setBetslipItems] = useState<BetslipItem[]>(() => {
    try {
      const saved = localStorage.getItem('sure_odd_betslip');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBetslipOpen, setIsBetslipOpen] = useState(false);

  // Active Modals
  const [aiFixture, setAiFixture] = useState<ParsedPrediction | null>(null);
  const [bookmakerFixture, setBookmakerFixture] = useState<ParsedPrediction | null>(null);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  // Save betslip to local storage
  useEffect(() => {
    localStorage.setItem('sure_odd_betslip', JSON.stringify(betslipItems));
  }, [betslipItems]);

  // Fetch predictions from Supabase odds table
  const fetchPredictions = useCallback(async () => {
    setLoadingPredictions(true);
    try {
      const { data, error } = await supabase
        .from('odds')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching odds:', error);
      } else if (data) {
        const parsed = (data as RawOdd[]).map(parsePrediction);
        setPredictions(parsed);
      }
    } catch (err) {
      console.error('Network error fetching predictions:', err);
    } finally {
      setLoadingPredictions(false);
    }
  }, []);

  // Initial load + Realtime subscription to `odds` table
  useEffect(() => {
    fetchPredictions();

    // Listen to real-time changes on odds table
    const oddsChannel = supabase
      .channel('odds-realtime-listener')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'odds' },
        () => {
          // Re-fetch to keep state synchronized
          fetchPredictions();
        }
      )
      .subscribe();

    return () => {
      oddsChannel.unsubscribe();
    };
  }, [fetchPredictions]);

  // Handle URL hash or direct /admin routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'admin') setActiveTab('admin');
      else if (hash === 'chat') setActiveTab('chat');
      else if (hash === 'vip') setActiveTab('vip');
      else if (hash === 'free2odds') setActiveTab('free2odds');
      else if (hash === 'live') setActiveTab('live');
      else if (hash === 'tables') setActiveTab('tables');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Add item to Betslip
  const handleAddToBetslip = (fixture: ParsedPrediction, overrideOdds?: number) => {
    setBetslipItems((prev) => {
      // Don't duplicate exact same match
      if (prev.some((item) => String(item.id) === String(fixture.id))) {
        return prev;
      }
      const newItem: BetslipItem = {
        id: fixture.id,
        home: fixture.home,
        away: fixture.away,
        league: fixture.league,
        selection: fixture.cleanTip,
        odds: overrideOdds || fixture.odds,
      };
      return [...prev, newItem];
    });
    setIsBetslipOpen(true);
  };

  // Add multiple items to Betslip
  const handleAddMultipleToSlip = (items: ParsedPrediction[]) => {
    setBetslipItems((prev) => {
      const existingIds = new Set(prev.map((i) => String(i.id)));
      const additions: BetslipItem[] = items
        .filter((i) => !existingIds.has(String(i.id)))
        .map((i) => ({
          id: i.id,
          home: i.home,
          away: i.away,
          league: i.league,
          selection: i.cleanTip,
          odds: i.odds,
        }));
      return [...prev, ...additions];
    });
    setIsBetslipOpen(true);
  };

  const handleRemoveFromBetslip = (id: number | string) => {
    setBetslipItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const handleClearBetslip = () => {
    setBetslipItems([]);
  };

  // Quick seed 8 matches into Supabase odds table
  const handleSeedMatches = async () => {
    const realSampleTips = [
      { league: 'Premier League', home: 'Arsenal', away: 'Chelsea', tip: 'Arsenal Win (1X2) [18:30 | Today]', odds: 1.82 },
      { league: 'Premier League', home: 'Liverpool', away: 'Manchester City', tip: 'Over 2.5 Goals [20:00 | Today]', odds: 1.70 },
      { league: 'La Liga', home: 'Real Madrid', away: 'Barcelona', tip: 'Both Teams To Score (BTTS) [21:00 | Today]', odds: 1.55 },
      { league: 'Serie A', home: 'Inter Milan', away: 'Juventus', tip: 'Under 2.5 Goals [19:45 | Today]', odds: 1.68 },
      { league: 'Bundesliga', home: 'Bayern Munich', away: 'Borussia Dortmund', tip: 'Home Win & Over 2.5 [17:30 | Today]', odds: 1.95 },
      { league: 'NPFL Nigeria', home: 'Enyimba FC', away: 'Remo Stars', tip: 'Home Win (1X2) [16:00 | Today]', odds: 1.60 },
      { league: 'Champions League', home: 'Paris Saint-Germain', away: 'Atletico Madrid', tip: 'Double Chance 1X [20:00 | Upcoming]', odds: 1.40 },
      { league: 'Premier League', home: 'Aston Villa', away: 'Tottenham', tip: 'Over 2.5 Goals [15:00 | Completed | Won]', odds: 1.65 },
    ];

    try {
      const { error } = await supabase.from('odds').insert(realSampleTips);
      if (!error) {
        fetchPredictions();
      }
    } catch (err) {
      console.error('Error seeding matches:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#ffd700] selection:text-black">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.location.hash = tab === 'home' ? '' : tab;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        betslipCount={betslipItems.length}
        onOpenBetslip={() => setIsBetslipOpen(true)}
        onOpenDeployModal={() => setDeployModalOpen(true)}
        onOpenApiModal={() => setApiModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* HOMEPAGE */}
        {activeTab === 'home' && (
          <>
            <HeroBanner
              predictions={predictions}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.location.hash = tab;
              }}
              loading={loadingPredictions}
              currentUser={currentUser}
              onOpenAuthModal={() => setAuthModalOpen(true)}
            />
            <PredictionList
              predictions={predictions}
              loading={loadingPredictions}
              onRefresh={fetchPredictions}
              onAddToBetslip={handleAddToBetslip}
              onOpenAiAnalysis={(fixture) => setAiFixture(fixture)}
              onOpenBookmakers={(fixture) => setBookmakerFixture(fixture)}
              onNavigateToAdmin={() => setActiveTab('admin')}
              onQuickSeed={handleSeedMatches}
              onNavigateToChat={() => setActiveTab('chat')}
              betslipItems={betslipItems}
            />
          </>
        )}

        {/* FREE 2 ODDS */}
        {activeTab === 'free2odds' && (
          <FreeTwoOdds
            predictions={predictions}
            onAddAllToSlip={handleAddMultipleToSlip}
            onOpenAiAnalysis={(fixture) => setAiFixture(fixture)}
          />
        )}

        {/* VIP SECTION */}
        {activeTab === 'vip' && (
          <VipSection
            predictions={predictions}
            onAddToBetslip={handleAddToBetslip}
            onOpenAiAnalysis={(fixture) => setAiFixture(fixture)}
          />
        )}

        {/* LIVE MATCHES */}
        {activeTab === 'live' && (
          <LiveMatches
            onAddToBetslip={handleAddToBetslip}
            onOpenAiAnalysis={(fixture) => setAiFixture(fixture)}
            betslipItems={betslipItems}
            isAdminLoggedIn={isAdminLoggedIn}
          />
        )}

        {/* UPCOMING */}
        {activeTab === 'upcoming' && (
          <LiveMatches
            initialFilter="upcoming"
            onAddToBetslip={handleAddToBetslip}
            onOpenAiAnalysis={(fixture) => setAiFixture(fixture)}
            betslipItems={betslipItems}
            isAdminLoggedIn={isAdminLoggedIn}
          />
        )}

        {/* LEAGUE TABLES */}
        {activeTab === 'tables' && <LeagueTables />}

        {/* AI ANALYSIS HUB */}
        {activeTab === 'aianalysis' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="text-center mb-8">
              <span className="text-xs uppercase font-bold text-[#ffd700] tracking-wider block">
                MATHEMATICAL PREDICTIVE MODEL
              </span>
              <h2 className="text-3xl font-black font-arena tracking-tight text-white mt-1">
                AI Match Probabilities & Algorithmic Analysis
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto mt-1">
                Select any fixture from our live Supabase database to view margin-adjusted probabilities, expected goals (xG), and key tactical risk indicators.
              </p>
            </div>

            <PredictionList
              predictions={predictions}
              loading={loadingPredictions}
              onRefresh={fetchPredictions}
              onAddToBetslip={handleAddToBetslip}
              onOpenAiAnalysis={(fixture) => setAiFixture(fixture)}
              onOpenBookmakers={(fixture) => setBookmakerFixture(fixture)}
              onNavigateToAdmin={() => setActiveTab('admin')}
              onQuickSeed={handleSeedMatches}
              onNavigateToChat={() => setActiveTab('chat')}
              betslipItems={betslipItems}
            />
          </div>
        )}

        {/* REAL-TIME CHAT */}
        {activeTab === 'chat' && <RealtimeChat isAdmin={isAdminLoggedIn} />}

        {/* ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminDashboard
            isAdminLoggedIn={isAdminLoggedIn}
            onLoginStateChange={handleAdminLoginStateChange}
            predictions={predictions}
            onRefreshData={fetchPredictions}
            onSeedMatches={handleSeedMatches}
          />
        )}
      </main>

      {/* Betslip Slide-Over Drawer */}
      <BetslipDrawer
        items={betslipItems}
        isOpen={isBetslipOpen}
        onToggle={() => setIsBetslipOpen(!isBetslipOpen)}
        onRemoveItem={handleRemoveFromBetslip}
        onClearAll={handleClearBetslip}
      />

      {/* Modals */}
      <AiAnalysisModal
        fixture={aiFixture}
        onClose={() => setAiFixture(null)}
        onAddToBetslip={handleAddToBetslip}
      />

      <BookmakersModal
        fixture={bookmakerFixture}
        onClose={() => setBookmakerFixture(null)}
        onAddToBetslip={handleAddToBetslip}
      />

      <DeployGuideModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
      />

      <FootballApiModal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
        onSignOut={handleSignOut}
      />

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.location.hash = tab === 'home' ? '' : tab;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenDeployModal={() => setDeployModalOpen(true)}
        onOpenApiModal={() => setApiModalOpen(true)}
      />
    </div>
  );
}
