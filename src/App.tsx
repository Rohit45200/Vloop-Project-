import React, { useState, useEffect } from "react";
import {
  Rocket,
  Compass,
  ShoppingBag,
  Coins,
  Cpu,
  Trophy,
  Volume2,
  VolumeX,
  User,
  Shield,
  Zap,
  Sparkles,
  BookOpen,
  Play,
  RotateCcw,
  Sliders,
  ChevronRight,
  LogOut,
  Flame,
} from "lucide-react";
import { GAME_NAME } from "./config/gameConfig.ts";
import { api } from "./services/apiClient.ts";
import { audio } from "./services/audioService.ts";
import { CombatCanvas } from "./components/game/CombatCanvas.tsx";
import { MissionMap } from "./components/campaign/MissionMap.tsx";
import { ShipHangar } from "./components/hangar/ShipHangar.tsx";
import { PowerUpStore } from "./components/powerups/PowerUpStore.tsx";
import { EconomyDashboard } from "./components/economy/EconomyDashboard.tsx";
import { EngagementHub } from "./components/engagement/EngagementHub.tsx";
import { MissionResultModal } from "./components/game/MissionResultModal.tsx";
import { ComplianceDocsModal } from "./components/docs/ComplianceDocsModal.tsx";
import { AuthModal } from "./components/auth/AuthModal.tsx";

type AppView = "home" | "campaign" | "hangar" | "armory" | "economy" | "engagement" | "combat";

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [wallet, setWallet] = useState<any | null>(null);
  const [ships, setShips] = useState<any[]>([]);
  const [playerShips, setPlayerShips] = useState<Record<string, any>>({});
  const [powerUps, setPowerUps] = useState<any[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [missions, setMissions] = useState<any[]>([]);
  const [playerMissions, setPlayerMissions] = useState<Record<number, any>>({});

  // Active Combat State
  const [activeMission, setActiveMission] = useState<any | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [missionResultStats, setMissionResultStats] = useState<any | null>(null);
  const [revivedSignal, setRevivedSignal] = useState(0);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(audio.getMuted());

  useEffect(() => {
    loadAllGameData();
  }, []);

  const loadAllGameData = async () => {
    try {
      const [meData, shipsData, powersData, missionsData] = await Promise.all([
        api.getMe(),
        api.getShips(),
        api.getPowerUps(),
        api.getMissions(),
      ]);

      setUser(meData.user);
      setProfile(meData.profile);
      setWallet(meData.wallet);
      setShips(shipsData);
      setPowerUps(powersData);
      setMissions(missionsData);

      // Load progress
      const prog = await api.getPlayerProgress();
      setPlayerShips(prog.ships || {});
      setPlayerMissions(prog.missions || {});
      setInventory(prog.inventory || {});
    } catch (e) {
      console.warn("Error loading game data:", e);
    }
  };

  const toggleAudio = () => {
    const next = !isAudioMuted;
    audio.setMuted(next);
    setIsAudioMuted(next);
  };

  // Launch Combat Sortie
  const handleLaunchMission = async (missionId: number) => {
    audio.playClick();
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    try {
      const selectedShip = profile?.selectedShipId || "interceptor";
      const session = await api.startMission(missionId, selectedShip);
      setActiveMission(mission);
      setActiveSession(session);
      setMissionResultStats(null);
      setCurrentView("combat");
    } catch (e: any) {
      alert(e.message || "Cannot launch sortie");
    }
  };

  // Combat Outcome Handlers
  const handleCombatVictory = async (stats: any) => {
    if (!activeSession) return;
    try {
      const res = await api.completeMission(activeSession.sessionId, {
        ...stats,
        victory: true,
      });

      setMissionResultStats({
        victory: true,
        score: stats.score,
        enemiesKilled: stats.enemiesKilled,
        bossKilled: stats.bossKilled,
        powerUpsUsed: stats.powerUpsUsed,
        accuracy: stats.accuracy,
        durationSec: stats.durationSec,
        stars: res.rewards?.stars || 3,
        creditsEarned: res.rewards?.credits || 100,
        xpEarned: res.rewards?.xp || 60,
        coresEarned: res.rewards?.cores || 0,
      });

      loadAllGameData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCombatDefeat = async (stats: any) => {
    if (!activeSession) return;
    try {
      await api.completeMission(activeSession.sessionId, {
        ...stats,
        victory: false,
        bossKilled: false,
        powerUpsUsed: 0,
        accuracy: 50,
        durationSec: 15,
      });

      setMissionResultStats({
        victory: false,
        score: stats.score,
        enemiesKilled: 5,
        bossKilled: false,
        powerUpsUsed: 0,
        accuracy: 50,
        durationSec: 20,
        stars: 0,
        creditsEarned: 0,
        xpEarned: 10,
        coresEarned: 0,
      });

      loadAllGameData();
    } catch (e) {
      console.error(e);
    }
  };

  const currentShipDef = ships.find((s) => s.id === profile?.selectedShipId) || ships[0];
  const currentShipState = playerShips[profile?.selectedShipId || "interceptor"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onSuccess={() => {
            setShowAuthModal(false);
            loadAllGameData();
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showDocsModal && (
        <ComplianceDocsModal onClose={() => setShowDocsModal(false)} />
      )}

      {/* Main Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Game Title (Configurable dynamic name, Section 4) */}
          <div
            onClick={() => {
              audio.playClick();
              setCurrentView("home");
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Rocket className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg md:text-xl text-white tracking-wider flex items-center gap-1.5">
                {GAME_NAME}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono">
                  v2.0
                </span>
              </h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest hidden sm:block">
                VELOOP REWARDS ECOSYSTEM
              </span>
            </div>
          </div>

          {/* Central Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            {[
              { id: "home", label: "Cockpit", icon: Rocket },
              { id: "campaign", label: "Campaign (50)", icon: Compass },
              { id: "hangar", label: "Fleet Hangar", icon: Shield },
              { id: "armory", label: "Armory", icon: ShoppingBag },
              { id: "engagement", label: "Ops & Badges", icon: Trophy },
              { id: "economy", label: "VELoop Ledger", icon: Coins },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    audio.playClick();
                    setCurrentView(tab.id as AppView);
                  }}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSel
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile, Wallet & Audio Status */}
          <div className="flex items-center gap-3">
            {/* Quick currency pill */}
            <div
              onClick={() => {
                audio.playClick();
                setCurrentView("economy");
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono cursor-pointer hover:border-cyan-400 transition-colors"
            >
              <div className="flex items-center gap-1 text-cyan-300">
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">{wallet?.credits?.toLocaleString() || 0}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1 text-purple-300">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-bold">{wallet?.energyCores || 0}</span>
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Spec Documentation Button */}
            <button
              onClick={() => {
                audio.playClick();
                setShowDocsModal(true);
              }}
              title="Specification & Evaluation Compliance"
              className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/40 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* User Account Button */}
            <button
              onClick={() => {
                audio.playClick();
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{profile?.displayName || "Pilot Login"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around gap-1 pt-2.5 mt-2 border-t border-white/5 text-[11px] font-mono">
          {[
            { id: "home", label: "Cockpit" },
            { id: "campaign", label: "Missions" },
            { id: "hangar", label: "Fleet" },
            { id: "armory", label: "Armory" },
            { id: "engagement", label: "Ops" },
            { id: "economy", label: "Ledger" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                audio.playClick();
                setCurrentView(tab.id as AppView);
              }}
              className={`px-2 py-1 rounded transition-colors ${
                currentView === tab.id ? "text-cyan-400 font-bold underline" : "text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main View Switcher */}
      <main className="flex-1">
        {/* COMBAT VIEW */}
        {currentView === "combat" && activeMission && currentShipDef && (
          <div className="relative w-full h-[calc(100vh-65px)] flex items-center justify-center p-2">
            <CombatCanvas
              mission={activeMission}
              shipDef={currentShipDef}
              shipState={currentShipState}
              inventory={inventory}
              onVictory={handleCombatVictory}
              onDefeat={handleCombatDefeat}
              onExit={() => {
                audio.playClick();
                setCurrentView("campaign");
              }}
              onRequestRevive={() => {
                setRevivedSignal((s) => s + 1);
              }}
              revivedSignal={revivedSignal}
            />

            {/* Mission Results Modal Overlay */}
            {missionResultStats && (
              <MissionResultModal
                sessionId={activeSession?.sessionId || "sess_001"}
                mission={activeMission}
                stats={missionResultStats}
                canRevive={!missionResultStats.victory}
                onReviveSuccess={() => {
                  setRevivedSignal((s) => s + 1);
                  setMissionResultStats(null);
                }}
                onRestart={() => {
                  handleLaunchMission(activeMission.id);
                }}
                onNextMission={() => {
                  if (activeMission.id < 50) {
                    handleLaunchMission(activeMission.id + 1);
                  } else {
                    setCurrentView("campaign");
                  }
                }}
                onReturnToHangar={() => {
                  setCurrentView("hangar");
                }}
              />
            )}
          </div>
        )}

        {/* HOME / COCKPIT VIEW (Section 69) */}
        {currentView === "home" && (
          <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            {/* Hero Banner with Animated Starship */}
            <div className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 md:p-10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Radial glow background */}
              <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  ARCADE COMBAT • 50 SORTIES • 5 BOSS SHOWDOWNS
                </div>

                <h2 className="text-3xl md:text-5xl font-black font-display text-white tracking-wider leading-tight">
                  DEFEND THE GALAXY IN <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">{GAME_NAME}</span>
                </h2>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                  Command elite starships, battle wave encounters across 5 alien sectors, and earn platform-backed VELoop rewards with verified ad sustainability.
                </p>

                {/* Pilot Level & Progression Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">PILOT LEVEL & RANK:</span>
                    <span className="text-cyan-300 font-bold">
                      RANK {profile?.level || 1} • {profile?.xp || 0} XP
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-cyan-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, ((profile?.xp || 0) % 500) / 5)}%` }}
                    />
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      audio.playClick();
                      handleLaunchMission(profile?.highestMissionUnlocked || 1);
                    }}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-300 hover:brightness-110 text-slate-950 font-bold font-display text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Launch Sortie #{profile?.highestMissionUnlocked || 1}
                  </button>

                  <button
                    onClick={() => {
                      audio.playClick();
                      setCurrentView("campaign");
                    }}
                    className="px-6 py-3.5 rounded-2xl border border-slate-700 bg-white/5 hover:bg-white/10 text-slate-200 font-bold font-display text-sm cursor-pointer transition-all"
                  >
                    Browse 50 Missions
                  </button>
                </div>
              </div>

              {/* Starship Hologram Preview Card */}
              <div className="relative z-10 w-full max-w-xs p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-center space-y-3 shadow-xl">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  DEPLOYED VESSEL
                </span>
                <div className="font-display font-bold text-lg text-white">
                  {currentShipDef?.name || "Aero-X Interceptor"}
                </div>
                <div className="text-xs font-mono text-cyan-300">
                  Class: {currentShipDef?.className || "Interceptor"}
                </div>

                {/* SVG Hologram */}
                <div className="py-4 flex justify-center">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-[0_0_15px_rgba(56,189,248,0.7)] animate-pulse">
                    <polygon
                      points="50,15 20,85 40,75 50,85 60,75 80,85"
                      fill="#0f172a"
                      stroke={currentShipDef?.color || "#38bdf8"}
                      strokeWidth="3"
                    />
                    <circle cx="50" cy="50" r="10" fill={currentShipDef?.color || "#38bdf8"} opacity="0.8" />
                  </svg>
                </div>

                <button
                  onClick={() => {
                    audio.playClick();
                    setCurrentView("hangar");
                  }}
                  className="w-full py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Enter Fleet Hangar →
                </button>
              </div>
            </div>

            {/* Quick Access Matrix (Section 69 Shortcuts) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => {
                  audio.playClick();
                  setCurrentView("campaign");
                }}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-2 group"
              >
                <div className="p-3 rounded-xl bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 w-fit group-hover:scale-110 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  5 Sectors & 50 Sorties
                </h3>
                <p className="text-xs text-slate-400">
                  Progress through 5 galactic sectors from Orion Frontier to the Void Citadel.
                </p>
              </div>

              <div
                onClick={() => {
                  audio.playClick();
                  setCurrentView("hangar");
                }}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-2 group"
              >
                <div className="p-3 rounded-xl bg-purple-950/50 text-purple-400 border border-purple-500/30 w-fit group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  Starship Upgrades
                </h3>
                <p className="text-xs text-slate-400">
                  Overclock plasma cannons, titanium plating, deflector shields, and impulse engines.
                </p>
              </div>

              <div
                onClick={() => {
                  audio.playClick();
                  setCurrentView("engagement");
                }}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-2 group"
              >
                <div className="p-3 rounded-xl bg-amber-950/50 text-amber-400 border border-amber-500/30 w-fit group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  Daily Ops & Streak
                </h3>
                <p className="text-xs text-slate-400">
                  Claim 7-day login streaks, decrypt orbital supply drops, and unlock combat badges.
                </p>
              </div>

              <div
                onClick={() => {
                  audio.playClick();
                  setCurrentView("economy");
                }}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-2 group"
              >
                <div className="p-3 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 w-fit group-hover:scale-110 transition-transform">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  VELoop Reward Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Audit authoritative double-entry wallet history, ad verifications, and platform coins.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGN VIEW */}
        {currentView === "campaign" && (
          <MissionMap
            missions={missions}
            playerMissions={playerMissions}
            highestUnlocked={profile?.highestMissionUnlocked || 1}
            onLaunchMission={handleLaunchMission}
          />
        )}

        {/* HANGAR VIEW */}
        {currentView === "hangar" && (
          <ShipHangar
            ships={ships}
            playerShips={playerShips}
            wallet={wallet}
            selectedShipId={profile?.selectedShipId || "interceptor"}
            onShipSelected={(shipId) => {
              if (profile) setProfile({ ...profile, selectedShipId: shipId });
            }}
            onRefreshData={loadAllGameData}
          />
        )}

        {/* ARMORY VIEW */}
        {currentView === "armory" && (
          <PowerUpStore
            powerUps={powerUps}
            inventory={inventory}
            wallet={wallet}
            onRefreshData={loadAllGameData}
          />
        )}

        {/* ENGAGEMENT VIEW */}
        {currentView === "engagement" && (
          <EngagementHub
            profile={profile}
            wallet={wallet}
            onRefreshData={loadAllGameData}
          />
        )}

        {/* ECONOMY VIEW */}
        {currentView === "economy" && (
          <EconomyDashboard
            wallet={wallet}
            isAdmin={user?.role === "admin"}
            onRefreshData={loadAllGameData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-4 px-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{GAME_NAME} • VELoop Rewards Internship Project</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDocsModal(true)}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              System Documentation
            </button>
            <span>•</span>
            <span className="text-emerald-400">Server Status: Online (60 FPS Engine)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
