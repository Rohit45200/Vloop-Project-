import React, { useState } from "react";
import {
  Shield,
  Zap,
  Flame,
  Crosshair,
  Radio,
  Wrench,
  Activity,
  Sparkles,
  ShoppingBag,
  Coins,
  Check,
} from "lucide-react";
import { api } from "../../services/apiClient.ts";
import { audio } from "../../services/audioService.ts";

interface PowerUpStoreProps {
  powerUps: any[];
  inventory: Record<string, number>;
  wallet: any;
  onRefreshData: () => void;
}

const ICON_MAP: Record<string, any> = {
  ShieldAlert: Shield,
  Zap: Zap,
  Flame: Flame,
  Crosshair: Crosshair,
  Radio: Radio,
  Wrench: Wrench,
  Activity: Activity,
  Sparkles: Sparkles,
};

export const PowerUpStore: React.FC<PowerUpStoreProps> = ({
  powerUps,
  inventory,
  wallet,
  onRefreshData,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleBuy = async (pId: string) => {
    audio.playClick();
    try {
      setLoadingId(pId);
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await api.acquirePowerUp(pId, 1);
      audio.playPickup();
      setSuccessMsg(`Acquired 1x tactical module! Current stock: ${res.count}`);
      onRefreshData();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            ARMORY & COMBAT MODULES (SECTION 26-29)
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            TACTICAL POWER-UP VAULT
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Purchase and replenish deployable weapon overclocks, kinetic shielding, and emergency nanites for active combat.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-300 font-mono text-sm">
          <Coins className="w-4 h-4 text-cyan-400" />
          <span>{wallet?.credits?.toLocaleString() || 0} Credits</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Power-Ups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {powerUps.map((p) => {
          const count = inventory[p.id] || 0;
          const Icon = ICON_MAP[p.icon] || Shield;
          const canAfford = (wallet?.credits || 0) >= p.creditCost;
          const isFull = count >= p.maxStock;

          return (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                    Stock: <strong className="text-cyan-400">{count}</strong> / {p.maxStock}
                  </span>
                </div>

                <h3 className="font-display font-bold text-white text-base">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed min-h-[48px]">
                  {p.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Active Duration:</span>
                    <span className="text-white">{p.durationMs / 1000}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recharge Cooldown:</span>
                    <span className="text-white">{p.cooldownMs / 1000}s</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="font-mono font-bold text-sm text-cyan-300">
                  {p.creditCost} CR
                </span>

                <button
                  onClick={() => handleBuy(p.id)}
                  disabled={isFull || !canAfford || loadingId === p.id}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-display flex items-center gap-1.5 cursor-pointer transition-all ${
                    isFull
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : canAfford
                      ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      : "bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {isFull ? "MAX STOCK" : "ACQUIRE"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
