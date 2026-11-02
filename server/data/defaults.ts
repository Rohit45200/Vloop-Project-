import {
  Achievement,
  DailyMission,
  EconomyConfig,
  MissionDefinition,
  PowerUpDefinition,
  ShipDefinition,
} from "./types.ts";

export const DEFAULT_ECONOMY_CONFIG: EconomyConfig = {
  missionCompletionCredits: 100,
  eliteEnemyCredits: 10,
  bossCompletionCredits: 250,
  threeStarBonusCredits: 50,
  rewardedAds: {
    enabled: true,
    reviveEnabled: true,
    doubleScoreEnabled: true,
    doubleCreditsEnabled: true,
    extraShieldEnabled: true,
    maxRevivesPerMission: 1,
    maxDoubleScorePerMission: 1,
    maxDoubleCreditsPerMission: 1,
    maxRewardedAdsPerDay: 10,
    maxRewardedAdsPerSession: 5,
    minSecondsBetweenRewardedAds: 30,
  },
};

export const DEFAULT_SHIPS: ShipDefinition[] = [
  {
    id: "interceptor",
    name: "Aero-X Interceptor",
    className: "Interceptor",
    description: "Standard agile fleet starfighter. Balanced firepower, high maneuverability, and reliable shields.",
    baseStats: {
      damage: 18,
      fireRate: 8, // shots/sec
      health: 100,
      speed: 340,
      shield: 50,
    },
    maxUpgradeLevel: 10,
    upgradeCostBase: 120,
    unlockCostCredits: 0,
    unlockCostCores: 0,
    unlockedByDefault: true,
    color: "#38bdf8",
    specialAbility: "Dual Overclock Cannons",
  },
  {
    id: "guardian",
    name: "Aegis Dreadnought",
    className: "Guardian",
    description: "Heavily fortified tank hull. Slower velocity but massive reinforced plating and reactive energy shields.",
    baseStats: {
      damage: 22,
      fireRate: 6,
      health: 220,
      speed: 260,
      shield: 140,
    },
    maxUpgradeLevel: 10,
    upgradeCostBase: 200,
    unlockCostCredits: 800,
    unlockCostCores: 5,
    unlockedByDefault: false,
    color: "#3b82f6",
    specialAbility: "Fortress Barrier Shield",
  },
  {
    id: "striker",
    name: "Viper Stryker",
    className: "Striker",
    description: "High-yield plasma assault vessel. Devastating burst DPS capable of melting heavy cruisers quickly.",
    baseStats: {
      damage: 32,
      fireRate: 11,
      health: 80,
      speed: 380,
      shield: 40,
    },
    maxUpgradeLevel: 10,
    upgradeCostBase: 240,
    unlockCostCredits: 1500,
    unlockCostCores: 10,
    unlockedByDefault: false,
    color: "#ef4444",
    specialAbility: "Hyper-Plasma Burst",
  },
  {
    id: "support",
    name: "Chrono Harvester",
    className: "Support Craft",
    description: "Logistics utility ship equipped with nanite repair fields and broad magnetic collection sensors.",
    baseStats: {
      damage: 16,
      fireRate: 9,
      health: 120,
      speed: 320,
      shield: 80,
    },
    maxUpgradeLevel: 10,
    upgradeCostBase: 180,
    unlockCostCredits: 1200,
    unlockCostCores: 8,
    unlockedByDefault: false,
    color: "#10b981",
    specialAbility: "Nanite Drone Field",
  },
  {
    id: "experimental",
    name: "Voidwing Phantom",
    className: "Experimental",
    description: "Tachyon-powered black-ops craft. Features quantum phase shift, dark matter pulse, and piercing tachyon lances.",
    baseStats: {
      damage: 40,
      fireRate: 12,
      health: 150,
      speed: 420,
      shield: 110,
    },
    maxUpgradeLevel: 10,
    upgradeCostBase: 400,
    unlockCostCredits: 4000,
    unlockCostCores: 25,
    unlockedByDefault: false,
    color: "#a855f7",
    specialAbility: "Quantum Singularity Warp",
  },
];

export const DEFAULT_POWERUPS: PowerUpDefinition[] = [
  {
    id: "shield-pulse",
    name: "Shield Pulse",
    description: "Creates an impenetrable protective bubble absorbing all incoming projectile damage.",
    icon: "ShieldAlert",
    effectType: "SHIELD_PULSE",
    durationMs: 8000,
    cooldownMs: 25000,
    creditCost: 150,
    maxStock: 5,
  },
  {
    id: "rapid-fire",
    name: "Rapid Fire",
    description: "Overclocks your weapon cooling matrix, tripling your rate of fire for devastating sustained combat.",
    icon: "Zap",
    effectType: "RAPID_FIRE",
    durationMs: 7000,
    cooldownMs: 20000,
    creditCost: 120,
    maxStock: 5,
  },
  {
    id: "spread-shot",
    name: "Spread Shot",
    description: "Fires a 5-way wide fan of high-velocity plasma bolts to clear out enemy swarms.",
    icon: "Flame",
    effectType: "SPREAD_SHOT",
    durationMs: 9000,
    cooldownMs: 22000,
    creditCost: 140,
    maxStock: 5,
  },
  {
    id: "homing-missiles",
    name: "Homing Missiles",
    description: "Launches radar-guided micro-missiles that seek out and annihilate the nearest hostile targets.",
    icon: "Crosshair",
    effectType: "HOMING_MISSILES",
    durationMs: 6000,
    cooldownMs: 24000,
    creditCost: 180,
    maxStock: 5,
  },
  {
    id: "emp-blast",
    name: "EMP Shockwave",
    description: "Discharges a massive electromagnetic nova that obliterates all enemy bullets and paralyzes ships.",
    icon: "Radio",
    effectType: "EMP_BLAST",
    durationMs: 1500,
    cooldownMs: 30000,
    creditCost: 200,
    maxStock: 3,
  },
  {
    id: "repair-drone",
    name: "Repair Drone",
    description: "Deploys a robotic nanite drone that repairs hull breaches, restoring 50 HP immediately.",
    icon: "Wrench",
    effectType: "REPAIR_DRONE",
    durationMs: 1000,
    cooldownMs: 28000,
    creditCost: 160,
    maxStock: 5,
  },
  {
    id: "overdrive",
    name: "Overdrive Core",
    description: "Overcharges engine and weapons simultaneously, increasing damage by 50% and speed by 35%.",
    icon: "Activity",
    effectType: "OVERDRIVE",
    durationMs: 10000,
    cooldownMs: 35000,
    creditCost: 220,
    maxStock: 3,
  },
  {
    id: "emergency-warp",
    name: "Emergency Warp",
    description: "Emergency hyperjump that flashes your vessel to a safe position with 2 seconds of phase invincibility.",
    icon: "Sparkles",
    effectType: "EMERGENCY_WARP",
    durationMs: 2000,
    cooldownMs: 40000,
    creditCost: 250,
    maxStock: 3,
  },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_contact",
    title: "First Contact",
    description: "Defeat your first hostile alien fighter.",
    icon: "Target",
    targetCount: 1,
    rewardCredits: 100,
    rewardXP: 50,
    rewardCores: 1,
  },
  {
    id: "fleet_recruit",
    title: "Fleet Recruit",
    description: "Unlock a second spaceship in the hangar.",
    icon: "Rocket",
    targetCount: 2,
    rewardCredits: 250,
    rewardXP: 100,
    rewardCores: 2,
  },
  {
    id: "elite_hunter",
    title: "Elite Hunter",
    description: "Destroy 10 elite enemy phantom craft.",
    icon: "Crosshair",
    targetCount: 10,
    rewardCredits: 400,
    rewardXP: 200,
    rewardCores: 4,
  },
  {
    id: "boss_breaker",
    title: "Boss Breaker",
    description: "Defeat The Iron Warden in Mission 10.",
    icon: "ShieldAlert",
    targetCount: 1,
    rewardCredits: 500,
    rewardXP: 300,
    rewardCores: 5,
  },
  {
    id: "sector_explorer",
    title: "Sector Explorer",
    description: "Unlock Sector 2: Crimson Nebula.",
    icon: "Compass",
    targetCount: 11,
    rewardCredits: 300,
    rewardXP: 150,
    rewardCores: 3,
  },
  {
    id: "ace_pilot",
    title: "Ace Pilot",
    description: "Complete any mission with at least 85% weapon accuracy.",
    icon: "Award",
    targetCount: 1,
    rewardCredits: 350,
    rewardXP: 200,
    rewardCores: 3,
  },
  {
    id: "shield_specialist",
    title: "Shield Specialist",
    description: "Activate Shield Pulse power-up 10 times in combat.",
    icon: "Shield",
    targetCount: 10,
    rewardCredits: 200,
    rewardXP: 120,
    rewardCores: 2,
  },
  {
    id: "power_collector",
    title: "Power Collector",
    description: "Collect 25 combat pickups during missions.",
    icon: "BatteryCharging",
    targetCount: 25,
    rewardCredits: 250,
    rewardXP: 150,
    rewardCores: 3,
  },
  {
    id: "fleet_commander",
    title: "Fleet Commander",
    description: "Unlock 4 or more starships.",
    icon: "Crown",
    targetCount: 4,
    rewardCredits: 1000,
    rewardXP: 600,
    rewardCores: 10,
  },
  {
    id: "void_conqueror",
    title: "Void Conqueror",
    description: "Defeat the Void Emperor in Mission 50 and save the galaxy.",
    icon: "Trophy",
    targetCount: 50,
    rewardCredits: 5000,
    rewardXP: 2500,
    rewardCores: 30,
  },
];

export const DEFAULT_DAILY_MISSIONS: DailyMission[] = [
  {
    id: "daily_destroy_30",
    title: "Sector Clearance",
    description: "Destroy 30 enemy ships across any missions.",
    type: "kills",
    requiredCount: 30,
    rewardCredits: 200,
    rewardXP: 100,
  },
  {
    id: "daily_complete_2",
    title: "Flight Readiness",
    description: "Successfully complete 2 campaign missions.",
    type: "missions",
    requiredCount: 2,
    rewardCredits: 250,
    rewardXP: 120,
  },
  {
    id: "daily_powerup_3",
    title: "Tactical Superiority",
    description: "Activate power-ups 3 times in active combat.",
    type: "powerups",
    requiredCount: 3,
    rewardCredits: 180,
    rewardXP: 80,
  },
];

// Helper to generate 50 progressive missions
export function generate50Missions(): MissionDefinition[] {
  const missions: MissionDefinition[] = [];
  const sectors = [
    { id: "orion-frontier", name: "Orion Frontier", start: 1, end: 10, boss: "The Iron Warden" },
    { id: "crimson-nebula", name: "Crimson Nebula", start: 11, end: 20, boss: "Nebula Serpent" },
    { id: "frozen-expanse", name: "Frozen Expanse", start: 21, end: 30, boss: "Solar Devourer" },
    { id: "rift-territory", name: "Rift Territory", start: 31, end: 40, boss: "The Rift Carrier" },
    { id: "void-citadel", name: "Void Citadel", start: 41, end: 50, boss: "Void Emperor" },
  ];

  for (const s of sectors) {
    for (let id = s.start; id <= s.end; id++) {
      const isBossMission = id === s.end;
      let difficulty: "Tutorial" | "Easy" | "Medium" | "Hard" | "Expert" = "Easy";
      if (id <= 5) difficulty = "Tutorial";
      else if (id <= 15) difficulty = "Easy";
      else if (id <= 30) difficulty = "Medium";
      else if (id <= 42) difficulty = "Hard";
      else difficulty = "Expert";

      let objectiveType: MissionDefinition["objectiveType"] = "destroy_all";
      let targetCount = 10 + (id % 5) * 3 + Math.floor(id / 10) * 4;
      let timeLimitSec = 90;

      if (isBossMission) {
        objectiveType = "defeat_boss";
        targetCount = 1;
        timeLimitSec = 150;
      } else if (id % 4 === 2) {
        objectiveType = "survive_time";
        targetCount = 40 + (id % 3) * 10; // seconds
        timeLimitSec = targetCount + 10;
      } else if (id % 4 === 3) {
        objectiveType = "collect_cores";
        targetCount = 3 + Math.floor(id / 12);
        timeLimitSec = 100;
      }

      // Generate progressive waves
      const wavesCount = isBossMission ? 3 : Math.min(5, 2 + Math.floor((id - s.start) / 3));
      const waves: MissionDefinition["waves"] = [];

      for (let w = 1; w <= wavesCount; w++) {
        if (isBossMission && w === wavesCount) {
          // Boss wave
          waves.push({
            waveNumber: w,
            enemies: [
              { type: "elite", count: 2 },
              { type: "scout", count: 4 },
            ],
          });
        } else {
          const waveEnemies: MissionDefinition["waves"][0]["enemies"] = [];
          waveEnemies.push({
            type: "scout",
            count: 3 + (id % 3) + w,
          });

          if (id > 5 || w > 1) {
            waveEnemies.push({
              type: "interceptor",
              count: 2 + Math.floor(id / 8),
            });
          }
          if (id > 15 && w >= 2) {
            waveEnemies.push({
              type: "armored_cruiser",
              count: 1 + Math.floor(id / 20),
            });
          }
          if (id > 25 && w >= 2) {
            waveEnemies.push({
              type: "gunship",
              count: 1 + (w % 2),
            });
          }
          if (id > 35 && w === wavesCount) {
            waveEnemies.push({
              type: "elite",
              count: 1 + Math.floor(id / 40),
            });
          }
          waves.push({
            waveNumber: w,
            enemies: waveEnemies,
          });
        }
      }

      const rewardCredits = isBossMission
        ? 350 + id * 25
        : 100 + id * 12;
      const rewardXP = isBossMission ? 200 + id * 15 : 60 + id * 8;
      const rewardCores = isBossMission ? Math.floor(id / 10) * 2 + 2 : (id % 5 === 0 ? 1 : 0);

      missions.push({
        id,
        sectorId: s.id,
        title: isBossMission
          ? `Showdown: ${s.boss}`
          : `${s.name} - Flight Patrol ${id}`,
        briefing: isBossMission
          ? `Warning: Command has identified the sector flagship "${s.boss}". Eliminate the high-threat boss to liberate this sector!`
          : `Deploying into ${s.name} coordinates. Eliminate hostiles, secure combat intelligence, and safeguard our fleet perimeters.`,
        difficulty,
        objectiveType,
        targetCount,
        timeLimitSec,
        bossId: isBossMission ? s.boss.toLowerCase().replace(/\s+/g, "-") : null,
        waves,
        rewardCredits,
        rewardXP,
        rewardCores,
      });
    }
  }

  return missions;
}
