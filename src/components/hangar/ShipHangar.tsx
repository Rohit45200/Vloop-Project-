import React, { useState } from "react";
import {
  Shield,
  Zap,
  Activity,
  Flame,
  Rocket,
  Check,
  Lock,
  ArrowUpCircle,
  Coins,
  Cpu,
  Sparkles,
} from "lucide-react";
import { api } from "../../services/apiClient.ts";
import { audio } from "../../services/audioService.ts";

interface ShipHangarProps {
  ships: any[];
  playerShips: Record<string, any>;
  wallet: any;
  selectedShipId: string;
  onShipSelected: (shipId: string) => void;
  onRefreshData: () => void;
}

export const ShipHangar: React.FC<ShipHangarProps> = ({
  ships,
  playerShips,
  wallet,
  selectedShipId,
  onShipSelected,
  onRefreshData,
}) => {
  const [currentShipId, setCurrentShipId] = useState<string>(selectedShipId || "interceptor");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeShip = ships.find((s) => s.id === currentShipId) || ships[0];
  const activeShipState = playerShips[currentShipId] || {
    unlocked: false,
    upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 },
  };

  const handleSelect = async () => {
    audio.playClick();
    try {
      setLoadingAction("select");
      await api.selectShip(activeShip.id);
      onShipSelected(activeShip.id);
      onRefreshData();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUnlock = async () => {
    audio.playPickup();
    try {
      setLoadingAction("unlock");
      await api.unlockShip(activeShip.id);
      onRefreshData();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpgrade = async (attribute: string) => {
    audio.playClick();
    try {
      setLoadingAction(`upgrade_${attribute}`);
      await api.upgradeShip(activeShip.id, attribute);
      onRefreshData();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  // Stat upgrade costs calculation
  const getUpgradeCost = (currentLvl: number) => {
    return Math.round(activeShip.upgradeCostBase * (1 + currentLvl * 0.75));
  };

  const statsList = [
    { key: "damage", label: "Plasma Cannon Output", icon: Flame, base: activeShip.baseStats.damage, unit: "DPS" },
    { key: "fireRate", label: "Cycle Rate of Fire", icon: Zap, base: activeShip.baseStats.fireRate, unit: "shots/s" },
    { key: "health", label: "Titanium Hull Integrity", icon: Activity, base: activeShip.baseStats.health, unit: "HP" },
    { key: "shield", label: "Deflector Shield Array", icon: Shield, base: activeShip.baseStats.shield, unit: "MW" },
    { key: "speed", label: "Ion Thruster Velocity", icon: Rocket, base: activeShip.baseStats.speed, unit: "mps" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Hangar Header & Wallet Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Rocket className="w-6 h-6 text-cyan-400" />
            FLEET DOCK & ENGINEERING
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative fleet commissioning and hardware overclocking module.
          </p>
        </div>

        {/* Currency balances */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-300 font-mono text-sm">
            <Coins className="w-4 h-4 text-cyan-400" />
            <span>{wallet?.credits?.toLocaleString() || 0} Credits</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-purple-500/30 text-purple-300 font-mono text-sm">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>{wallet?.energyCores || 0} Energy Cores</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Ship Selection Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {ships.map((s) => {
          const isOwned = playerShips[s.id]?.unlocked;
          const isSelected = selectedShipId === s.id;
          const isViewing = currentShipId === s.id;

          return (
            <button
              key={s.id}
              onClick={() => {
                audio.playClick();
                setCurrentShipId(s.id);
              }}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                isViewing
                  ? "border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {isSelected ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <Check className="w-3 h-3" /> ACTIVE
                  </span>
                ) : !isOwned ? (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                ) : null}
              </div>

              <div className="font-display text-sm font-bold text-white truncate">
                {s.name}
              </div>
              <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                {s.className}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Ship Showcase & Upgrades Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ship Hologram & Description */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
                CLASS: {activeShip.className}
              </span>
              {selectedShipId === activeShip.id && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  Primary Sortie Vessel
                </span>
              )}
            </div>

            <h3 className="text-2xl font-bold font-display text-white">
              {activeShip.name}
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {activeShip.description}
            </p>

            {/* Special Ability Card */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                Flagship Signature Ability
              </span>
              <span className="text-sm font-bold text-white font-display flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                {activeShip.specialAbility}
              </span>
            </div>

            {/* Visual Ship Schematic Vector Mock */}
            <div className="relative my-6 h-48 rounded-xl bg-slate-950/90 border border-cyan-500/20 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_70%)]" />

              <svg width="140" height="140" viewBox="0 0 100 100" className="drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]">
                <polygon
                  points="50,15 20,85 40,75 50,85 60,75 80,85"
                  fill="#0f172a"
                  stroke={activeShip.color}
                  strokeWidth="3"
                />
                <circle cx="50" cy="50" r="10" fill={activeShip.color} opacity="0.8" />
                <line x1="20" y1="85" x2="35" y2="60" stroke="#38bdf8" strokeWidth="2" />
                <line x1="80" y1="85" x2="65" y2="60" stroke="#38bdf8" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Action Button: Unlock or Select */}
          <div>
            {!activeShipState.unlocked ? (
              <button
                onClick={handleUnlock}
                disabled={loadingAction === "unlock"}
                className="w-full py-3 rounded-xl font-bold font-display text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4" />
                Commission Vessel ({activeShip.unlockCostCredits} Credits + {activeShip.unlockCostCores} Cores)
              </button>
            ) : selectedShipId !== activeShip.id ? (
              <button
                onClick={handleSelect}
                disabled={loadingAction === "select"}
                className="w-full py-3 rounded-xl font-bold font-display text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:brightness-110 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                Select as Combat Flagship
              </button>
            ) : (
              <div className="py-2.5 rounded-xl text-center text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                Active Vessel Equipped For Deployment
              </div>
            )}
          </div>
        </div>

        {/* Right: Upgrade Attributes Matrix */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-cyan-500/20 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-cyan-400" />
              SYSTEM OVERCLOCKS & UPGRADES
            </h4>
            <span className="text-xs font-mono text-slate-400">
              Max Tier 10
            </span>
          </div>

          {!activeShipState.unlocked ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Lock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-display text-white font-semibold">Vessel Locked</p>
              <p className="text-xs max-w-sm mx-auto">
                Commission this starship using required Credits and Energy Cores to unlock modular hardware upgrades.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {statsList.map((stat) => {
                const currentLvl = activeShipState.upgrades[stat.key] || 0;
                const cost = getUpgradeCost(currentLvl);
                const canAfford = (wallet?.credits || 0) >= cost;
                const isMax = currentLvl >= activeShip.maxUpgradeLevel;
                const Icon = stat.icon;

                // Calculated stat boost
                const boostedVal = Math.round(stat.base * (1 + currentLvl * 0.15));

                return (
                  <div
                    key={stat.key}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span>{stat.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span>Current: <strong className="text-cyan-300">{boostedVal} {stat.unit}</strong></span>
                        <span>•</span>
                        <span>Tier: <strong className="text-white">{currentLvl} / {activeShip.maxUpgradeLevel}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Tier progress dots */}
                      <div className="flex gap-1">
                        {Array.from({ length: 10 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-4 rounded-full ${
                              idx < currentLvl ? "bg-cyan-400" : "bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpgrade(stat.key)}
                        disabled={isMax || !canAfford || loadingAction === `upgrade_${stat.key}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          isMax
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                            : canAfford
                            ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                            : "bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        {isMax ? (
                          "MAX"
                        ) : (
                          <>
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            {cost} CR
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
