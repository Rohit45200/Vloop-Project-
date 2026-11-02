/**
 * Backend Data Models and Interfaces
 * Fulfills Section 67 & Section 36-39
 */

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "player" | "admin";
  createdAt: number;
}

export interface PlayerProfile {
  userId: string;
  displayName: string;
  level: number;
  xp: number;
  selectedShipId: string;
  highestSectorUnlocked: number;
  highestMissionUnlocked: number;
  totalScore: number;
  bestScore: number;
  missionsCompletedCount: number;
  dailyStreak: number;
  lastDailyClaimDate: string | null;
  lastAdWatchTime: number;
  dailyAdsWatchedCount: number;
  dailyAdsResetDate: string;
}

export interface PlayerWallet {
  userId: string;
  credits: number;
  energyCores: number;
  veloopCoins: number;
}

export interface ShipUpgradeStats {
  damage: number;
  fireRate: number;
  health: number;
  speed: number;
  shield: number;
}

export interface ShipDefinition {
  id: string;
  name: string;
  className: "Interceptor" | "Guardian" | "Striker" | "Support Craft" | "Experimental";
  description: string;
  baseStats: ShipUpgradeStats;
  maxUpgradeLevel: number;
  upgradeCostBase: number;
  unlockCostCredits: number;
  unlockCostCores: number;
  unlockedByDefault: boolean;
  color: string;
  specialAbility: string;
}

export interface PlayerShipState {
  shipId: string;
  unlocked: boolean;
  upgrades: {
    damage: number;
    fireRate: number;
    health: number;
    speed: number;
    shield: number;
  };
}

export interface PowerUpDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  effectType:
    | "SHIELD_PULSE"
    | "RAPID_FIRE"
    | "SPREAD_SHOT"
    | "HOMING_MISSILES"
    | "EMP_BLAST"
    | "REPAIR_DRONE"
    | "OVERDRIVE"
    | "EMERGENCY_WARP";
  durationMs: number;
  cooldownMs: number;
  creditCost: number;
  maxStock: number;
}

export interface MissionWave {
  waveNumber: number;
  enemies: {
    type: "scout" | "interceptor" | "armored_cruiser" | "gunship" | "elite";
    count: number;
    healthMultiplier?: number;
  }[];
}

export interface MissionDefinition {
  id: number; // 1 to 50
  sectorId: string;
  title: string;
  briefing: string;
  difficulty: "Tutorial" | "Easy" | "Medium" | "Hard" | "Expert";
  objectiveType: "destroy_all" | "survive_time" | "defeat_boss" | "protect_target" | "collect_cores";
  targetCount: number; // e.g. 15 enemies, 45 seconds survival, or 5 cores
  timeLimitSec: number;
  bossId: string | null;
  waves: MissionWave[];
  rewardCredits: number;
  rewardXP: number;
  rewardCores: number;
}

export interface PlayerMissionProgress {
  missionId: number;
  completed: boolean;
  stars: number; // 0 to 3
  bestScore: number;
  bestTimeSec: number;
  timesCompleted: number;
}

export interface GameSession {
  sessionId: string;
  userId: string;
  missionId: number;
  shipId: string;
  status: "active" | "completed" | "failed";
  startTime: number;
  endTime?: number;
  revivesUsed: number;
  doubleScoreClaimed: boolean;
  doubleCreditsClaimed: boolean;
  score: number;
  enemiesKilled: number;
  bossKilled: boolean;
  powerUpsUsed: number;
  accuracy: number;
  starsAwarded: number;
  rewardsClaimed: boolean;
  serverValidationToken: string;
}

export interface PlayerAchievement {
  unlocked: boolean;
  unlockedAt: number;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type:
    | "CREDIT"
    | "DEBIT"
    | "MISSION_REWARD"
    | "BOSS_REWARD"
    | "AD_REWARD"
    | "UPGRADE_PURCHASE"
    | "POWERUP_PURCHASE"
    | "BOOSTER_PURCHASE"
    | "SHIP_UNLOCK"
    | "DAILY_BONUS"
    | "SUPPLY_DROP"
    | "REVERSAL";
  currency: "CREDITS" | "ENERGY_CORES" | "VELOOP_COINS";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  source: string;
  referenceId: string;
  status: "SUCCESS" | "FAILED";
  timestamp: number;
}

export interface RewardTransaction {
  id: string;
  userId: string;
  sessionId: string;
  missionId?: number;
  rewardType: "REVIVE" | "DOUBLE_SCORE" | "DOUBLE_CREDITS" | "EXTRA_SHIELD" | "DAILY_BONUS" | "SUPPLY_DROP";
  amount: number;
  multiplier: number;
  source: string;
  adProvider: string;
  adEventId: string;
  verificationStatus: "VERIFIED" | "REJECTED";
  timestamp: number;
}

export type AdStatus =
  | "OFFERED"
  | "REQUESTED"
  | "AD_STARTED"
  | "AD_COMPLETED"
  | "VERIFYING"
  | "VERIFIED"
  | "GRANTED"
  | "REJECTED"
  | "EXPIRED";

export interface AdOpportunity {
  id: string;
  userId: string;
  sessionId: string;
  missionId?: number;
  placementType: "REVIVE" | "DOUBLE_SCORE" | "DOUBLE_CREDITS" | "POWER_UP" | "DAILY_BONUS";
  provider: "VELoop Simulated Ad Adapter" | "Google AdMob Mock" | "Unity Ads Mock";
  status: AdStatus;
  token: string;
  expiresAt: number;
  createdAt: number;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: "kills" | "missions" | "powerups" | "elite_kills" | "perfect_mission";
  requiredCount: number;
  rewardCredits: number;
  rewardXP: number;
}

export interface PlayerDailyProgress {
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetCount: number;
  rewardCredits: number;
  rewardXP: number;
  rewardCores: number;
}

export interface EconomyConfig {
  missionCompletionCredits: number;
  eliteEnemyCredits: number;
  bossCompletionCredits: number;
  threeStarBonusCredits: number;
  rewardedAds: {
    enabled: boolean;
    reviveEnabled: boolean;
    doubleScoreEnabled: boolean;
    doubleCreditsEnabled: boolean;
    extraShieldEnabled: boolean;
    maxRevivesPerMission: number;
    maxDoubleScorePerMission: number;
    maxDoubleCreditsPerMission: number;
    maxRewardedAdsPerDay: number;
    maxRewardedAdsPerSession: number;
    minSecondsBetweenRewardedAds: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  missionsCompleted: number;
  shipName: string;
  level: number;
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  metadata: Record<string, any>;
  timestamp: number;
}
