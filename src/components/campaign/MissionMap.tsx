import React, { useState } from "react";
import {
  Compass,
  Star,
  Lock,
  Play,
  Skull,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { SECTORS } from "../../config/gameConfig.ts";
import { audio } from "../../services/audioService.ts";

interface MissionMapProps {
  missions: any[];
  playerMissions: Record<number, any>;
  highestUnlocked: number;
  onLaunchMission: (missionId: number) => void;
}

export const MissionMap: React.FC<MissionMapProps> = ({
  missions,
  playerMissions,
  highestUnlocked,
  onLaunchMission,
}) => {
  const [selectedSectorId, setSelectedSectorId] = useState<string>("orion-frontier");

  const currentSector = SECTORS.find((s) => s.id === selectedSectorId) || SECTORS[0];
  const sectorMissions = missions.filter(
    (m) => m.id >= currentSector.missionsRange[0] && m.id <= currentSector.missionsRange[1]
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Campaign Sector Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            STRATEGIC STAR MAP • 50 SORTIES
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            CAMPAIGN SECTORS
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Liberate sectors from the Void Empire. Complete sorties to unlock subsequent patrol zones and sector flagship showdowns.
          </p>
        </div>

        {/* Sector Quick Tabs */}
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((s, idx) => {
            const isSelected = selectedSectorId === s.id;
            const isSectorUnlocked = highestUnlocked >= s.missionsRange[0];

            return (
              <button
                key={s.id}
                onClick={() => {
                  audio.playClick();
                  setSelectedSectorId(s.id);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : isSectorUnlocked
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-900 text-slate-500 opacity-60 border border-slate-800"
                }`}
              >
                {!isSectorUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
                <span>Sec {idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Sector Banner */}
      <div className={`p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r ${currentSector.bgGradient} relative overflow-hidden shadow-xl`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentSector.color }} />
              <h3 className="text-xl md:text-2xl font-bold font-display text-white">
                {currentSector.name}
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {currentSector.description}
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-mono">
            <Skull className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-[10px] text-slate-400">SECTOR BOSS</div>
              <div className="font-bold text-white font-display">{currentSector.bossName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Missions Grid for Selected Sector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {sectorMissions.map((m) => {
          const prog = playerMissions[m.id];
          const isUnlocked = m.id <= highestUnlocked || m.id === 1;
          const isCompleted = prog?.completed;
          const stars = prog?.stars || 0;
          const isBoss = Boolean(m.bossId);

          return (
            <div
              key={m.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                isCompleted
                  ? "bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400"
                  : isUnlocked
                  ? "bg-slate-900/70 border-sky-500/30 hover:border-sky-400 hover:scale-[1.02]"
                  : "bg-slate-950/60 border-slate-800/80 opacity-60"
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-cyan-300 border border-white/10">
                    Sortie #{m.id}
                  </span>

                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3.5 h-3.5 ${
                          starIdx <= stars
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="font-display font-bold text-sm text-white line-clamp-1 flex items-center gap-1.5">
                  {isBoss && <Skull className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                  {m.title}
                </h4>

                <div className="mt-2 space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-cyan-400" />
                    <span className="capitalize">{m.objectiveType.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{m.timeLimitSec}s limit</span>
                  </div>
                </div>
              </div>

              {/* Rewards Preview & Launch Button */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="text-cyan-300">+{m.rewardCredits} CR</span>
                  <span className="text-purple-300">+{m.rewardXP} XP</span>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => {
                      audio.playClick();
                      onLaunchMission(m.id);
                    }}
                    className={`w-full py-2 rounded-lg font-bold font-display text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isBoss
                        ? "bg-gradient-to-r from-purple-500 to-rose-500 text-white hover:brightness-110"
                        : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isCompleted ? "Replay Sortie" : "Launch Sortie"}
                  </button>
                ) : (
                  <div className="py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-600 text-[11px] font-mono text-center flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
