import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  Achievement,
  AdOpportunity,
  AnalyticsEvent,
  DailyMission,
  EconomyConfig,
  GameSession,
  LeaderboardEntry,
  MissionDefinition,
  PlayerAchievement,
  PlayerDailyProgress,
  PlayerMissionProgress,
  PlayerProfile,
  PlayerShipState,
  PlayerWallet,
  PowerUpDefinition,
  RewardTransaction,
  ShipDefinition,
  ShipUpgradeStats,
  User,
  WalletTransaction,
} from "./types.ts";
import {
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_DAILY_MISSIONS,
  DEFAULT_ECONOMY_CONFIG,
  DEFAULT_POWERUPS,
  DEFAULT_SHIPS,
  generate50Missions,
} from "./defaults.ts";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

interface DatabaseSchema {
  users: Record<string, User>;
  profiles: Record<string, PlayerProfile>;
  wallets: Record<string, PlayerWallet>;
  ships: ShipDefinition[];
  playerShips: Record<string, Record<string, PlayerShipState>>; // userId -> shipId -> state
  powerUps: PowerUpDefinition[];
  playerInventories: Record<string, Record<string, number>>; // userId -> powerUpId -> count
  missions: MissionDefinition[];
  playerMissions: Record<string, Record<number, PlayerMissionProgress>>; // userId -> missionId -> progress
  gameSessions: Record<string, GameSession>;
  walletTransactions: WalletTransaction[];
  rewardTransactions: RewardTransaction[];
  adOpportunities: Record<string, AdOpportunity>;
  dailyMissions: DailyMission[];
  playerDailyMissions: Record<string, Record<string, PlayerDailyProgress>>;
  achievements: Achievement[];
  playerAchievements: Record<string, Record<string, { unlocked: boolean; unlockedAt: number }>>;
  economyConfig: EconomyConfig;
  analyticsEvents: AnalyticsEvent[];
}

export class GameStore {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.loadOrInit();
  }

  private loadOrInit(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        // Ensure all arrays/records are loaded
        return {
          ...parsed,
          ships: DEFAULT_SHIPS,
          powerUps: DEFAULT_POWERUPS,
          missions: generate50Missions(),
          dailyMissions: DEFAULT_DAILY_MISSIONS,
          achievements: DEFAULT_ACHIEVEMENTS,
          economyConfig: parsed.economyConfig || DEFAULT_ECONOMY_CONFIG,
        };
      }
    } catch (e) {
      console.warn("Failed to read database.json, initializing fresh store:", e);
    }

    return this.createInitialDatabase();
  }

  private createInitialDatabase(): DatabaseSchema {
    const defaultMissions = generate50Missions();
    const demoUserId = "pilot_demo_001";
    const demoPasswordHash = crypto.createHash("sha256").update("pilot123").digest("hex");

    const initialDb: DatabaseSchema = {
      users: {
        [demoUserId]: {
          id: demoUserId,
          username: "CommanderNova",
          email: "pilot@veloop.io",
          passwordHash: demoPasswordHash,
          role: "admin",
          createdAt: Date.now(),
        },
      },
      profiles: {
        [demoUserId]: {
          userId: demoUserId,
          displayName: "Commander Nova",
          level: 4,
          xp: 850,
          selectedShipId: "interceptor",
          highestSectorUnlocked: 2,
          highestMissionUnlocked: 12,
          totalScore: 48500,
          bestScore: 14200,
          missionsCompletedCount: 11,
          dailyStreak: 3,
          lastDailyClaimDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          lastAdWatchTime: 0,
          dailyAdsWatchedCount: 1,
          dailyAdsResetDate: new Date().toISOString().split("T")[0],
        },
      },
      wallets: {
        [demoUserId]: {
          userId: demoUserId,
          credits: 1250,
          energyCores: 8,
          veloopCoins: 45,
        },
      },
      ships: DEFAULT_SHIPS,
      playerShips: {
        [demoUserId]: {
          interceptor: {
            shipId: "interceptor",
            unlocked: true,
            upgrades: { damage: 2, fireRate: 2, health: 1, speed: 2, shield: 1 },
          },
          guardian: {
            shipId: "guardian",
            unlocked: true,
            upgrades: { damage: 1, fireRate: 1, health: 3, speed: 0, shield: 2 },
          },
          striker: {
            shipId: "striker",
            unlocked: false,
            upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 },
          },
          support: {
            shipId: "support",
            unlocked: false,
            upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 },
          },
          experimental: {
            shipId: "experimental",
            unlocked: false,
            upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 },
          },
        },
      },
      powerUps: DEFAULT_POWERUPS,
      playerInventories: {
        [demoUserId]: {
          "shield-pulse": 3,
          "rapid-fire": 4,
          "spread-shot": 2,
          "homing-missiles": 2,
          "emp-blast": 1,
          "repair-drone": 2,
          overdrive: 1,
          "emergency-warp": 1,
        },
      },
      missions: defaultMissions,
      playerMissions: {
        [demoUserId]: {
          1: { missionId: 1, completed: true, stars: 3, bestScore: 3200, bestTimeSec: 28, timesCompleted: 2 },
          2: { missionId: 2, completed: true, stars: 3, bestScore: 3800, bestTimeSec: 32, timesCompleted: 1 },
          3: { missionId: 3, completed: true, stars: 2, bestScore: 4100, bestTimeSec: 45, timesCompleted: 1 },
          4: { missionId: 4, completed: true, stars: 3, bestScore: 4500, bestTimeSec: 36, timesCompleted: 1 },
          5: { missionId: 5, completed: true, stars: 2, bestScore: 4200, bestTimeSec: 50, timesCompleted: 1 },
          6: { missionId: 6, completed: true, stars: 3, bestScore: 5100, bestTimeSec: 42, timesCompleted: 1 },
          7: { missionId: 7, completed: true, stars: 2, bestScore: 4900, bestTimeSec: 48, timesCompleted: 1 },
          8: { missionId: 8, completed: true, stars: 3, bestScore: 5600, bestTimeSec: 39, timesCompleted: 1 },
          9: { missionId: 9, completed: true, stars: 2, bestScore: 5400, bestTimeSec: 52, timesCompleted: 1 },
          10: { missionId: 10, completed: true, stars: 3, bestScore: 14200, bestTimeSec: 78, timesCompleted: 1 },
          11: { missionId: 11, completed: true, stars: 2, bestScore: 5900, bestTimeSec: 44, timesCompleted: 1 },
          12: { missionId: 12, completed: false, stars: 0, bestScore: 0, bestTimeSec: 0, timesCompleted: 0 },
        },
      },
      gameSessions: {},
      walletTransactions: [
        {
          id: "tx_init_001",
          userId: demoUserId,
          type: "DAILY_BONUS",
          currency: "CREDITS",
          amount: 500,
          balanceBefore: 0,
          balanceAfter: 500,
          source: "Cadet Enlistment Bonus",
          referenceId: "enlistment",
          status: "SUCCESS",
          timestamp: Date.now() - 172800000,
        },
        {
          id: "tx_init_002",
          userId: demoUserId,
          type: "BOSS_REWARD",
          currency: "CREDITS",
          amount: 600,
          balanceBefore: 500,
          balanceAfter: 1100,
          source: "The Iron Warden Flagship Defeat",
          referenceId: "mission-10",
          status: "SUCCESS",
          timestamp: Date.now() - 86400000,
        },
        {
          id: "tx_init_003",
          userId: demoUserId,
          type: "AD_REWARD",
          currency: "CREDITS",
          amount: 200,
          balanceBefore: 1100,
          balanceAfter: 1300,
          source: "VELoop Double Credits Reward",
          referenceId: "ad_init_01",
          status: "SUCCESS",
          timestamp: Date.now() - 43200000,
        },
      ],
      rewardTransactions: [],
      adOpportunities: {},
      dailyMissions: DEFAULT_DAILY_MISSIONS,
      playerDailyMissions: {
        [demoUserId]: {
          daily_destroy_30: { progress: 18, completed: false, claimed: false },
          daily_complete_2: { progress: 1, completed: false, claimed: false },
          daily_powerup_3: { progress: 3, completed: true, claimed: false },
        },
      },
      achievements: DEFAULT_ACHIEVEMENTS,
      playerAchievements: {
        [demoUserId]: {
          first_contact: { unlocked: true, unlockedAt: Date.now() - 172800000 },
          fleet_recruit: { unlocked: true, unlockedAt: Date.now() - 86400000 },
          boss_breaker: { unlocked: true, unlockedAt: Date.now() - 86400000 },
          sector_explorer: { unlocked: true, unlockedAt: Date.now() - 86400000 },
        },
      },
      economyConfig: DEFAULT_ECONOMY_CONFIG,
      analyticsEvents: [],
    };

    this.save(initialDb);
    return initialDb;
  }

  private save(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving database.json:", e);
    }
  }

  // --- Users & Profiles ---
  public getUserById(id: string): User | undefined {
    return this.db.users[id];
  }

  public getUserByEmail(email: string): User | undefined {
    return Object.values(this.db.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByUsername(username: string): User | undefined {
    return Object.values(this.db.users).find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  public createUser(username: string, email: string, passwordHash: string): User {
    const id = "usr_" + crypto.randomUUID().slice(0, 10);
    const user: User = {
      id,
      username,
      email,
      passwordHash,
      role: "player",
      createdAt: Date.now(),
    };
    this.db.users[id] = user;

    // Create profile
    this.db.profiles[id] = {
      userId: id,
      displayName: username,
      level: 1,
      xp: 0,
      selectedShipId: "interceptor",
      highestSectorUnlocked: 1,
      highestMissionUnlocked: 1,
      totalScore: 0,
      bestScore: 0,
      missionsCompletedCount: 0,
      dailyStreak: 1,
      lastDailyClaimDate: null,
      lastAdWatchTime: 0,
      dailyAdsWatchedCount: 0,
      dailyAdsResetDate: new Date().toISOString().split("T")[0],
    };

    // Create wallet with starting enlistment funds
    this.db.wallets[id] = {
      userId: id,
      credits: 250,
      energyCores: 2,
      veloopCoins: 5,
    };

    // Default ship state
    this.db.playerShips[id] = {
      interceptor: {
        shipId: "interceptor",
        unlocked: true,
        upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 },
      },
      guardian: {
        shipId: "guardian",
        unlocked: false,
        upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 },
      },
      striker: {
        shipId: "striker",
        unlocked: false,
        upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 },
      },
      support: {
        shipId: "support",
        unlocked: false,
        upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 },
      },
      experimental: {
        shipId: "experimental",
        unlocked: false,
        upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 },
      },
    };

    // Inventory starter pack
    this.db.playerInventories[id] = {
      "shield-pulse": 1,
      "rapid-fire": 1,
      "spread-shot": 1,
      "homing-missiles": 0,
      "emp-blast": 0,
      "repair-drone": 1,
      overdrive: 0,
      "emergency-warp": 0,
    };

    // Initial mission 1 unlocked
    this.db.playerMissions[id] = {
      1: { missionId: 1, completed: false, stars: 0, bestScore: 0, bestTimeSec: 0, timesCompleted: 0 },
    };

    // Daily missions setup
    this.db.playerDailyMissions[id] = {
      daily_destroy_30: { progress: 0, completed: false, claimed: false },
      daily_complete_2: { progress: 0, completed: false, claimed: false },
      daily_powerup_3: { progress: 0, completed: false, claimed: false },
    };

    this.db.playerAchievements[id] = {};

    this.recordWalletTx(
      id,
      "CREDIT",
      "CREDITS",
      250,
      0,
      250,
      "Cadet Enlistment Starter Pack",
      "enlistment"
    );

    this.save(this.db);
    return user;
  }

  public getProfile(userId: string): PlayerProfile {
    if (!this.db.profiles[userId]) {
      this.db.profiles[userId] = {
        userId,
        displayName: this.db.users[userId]?.username || "Pilot",
        level: 1,
        xp: 0,
        selectedShipId: "interceptor",
        highestSectorUnlocked: 1,
        highestMissionUnlocked: 1,
        totalScore: 0,
        bestScore: 0,
        missionsCompletedCount: 0,
        dailyStreak: 1,
        lastDailyClaimDate: null,
        lastAdWatchTime: 0,
        dailyAdsWatchedCount: 0,
        dailyAdsResetDate: new Date().toISOString().split("T")[0],
      };
      this.save(this.db);
    }
    return this.db.profiles[userId];
  }

  public getWallet(userId: string): PlayerWallet {
    if (!this.db.wallets[userId]) {
      this.db.wallets[userId] = { userId, credits: 0, energyCores: 0, veloopCoins: 0 };
      this.save(this.db);
    }
    return this.db.wallets[userId];
  }

  // --- Transactions & Atomic Currency ---
  public recordWalletTx(
    userId: string,
    type: WalletTransaction["type"],
    currency: WalletTransaction["currency"],
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    source: string,
    referenceId: string
  ): WalletTransaction {
    const tx: WalletTransaction = {
      id: "tx_" + crypto.randomUUID().slice(0, 10),
      userId,
      type,
      currency,
      amount,
      balanceBefore,
      balanceAfter,
      source,
      referenceId,
      status: "SUCCESS",
      timestamp: Date.now(),
    };
    this.db.walletTransactions.unshift(tx);
    // keep recent 500 tx
    if (this.db.walletTransactions.length > 500) {
      this.db.walletTransactions = this.db.walletTransactions.slice(0, 500);
    }
    return tx;
  }

  public modifyWallet(
    userId: string,
    changes: { credits?: number; energyCores?: number; veloopCoins?: number },
    type: WalletTransaction["type"],
    source: string,
    referenceId: string
  ): { success: boolean; wallet: PlayerWallet; error?: string } {
    const wallet = this.getWallet(userId);

    const creditsDiff = changes.credits || 0;
    const coresDiff = changes.energyCores || 0;
    const veloopDiff = changes.veloopCoins || 0;

    // Check sufficiency
    if (creditsDiff < 0 && wallet.credits + creditsDiff < 0) {
      return { success: false, wallet, error: "Insufficient Credits" };
    }
    if (coresDiff < 0 && wallet.energyCores + coresDiff < 0) {
      return { success: false, wallet, error: "Insufficient Energy Cores" };
    }
    if (veloopDiff < 0 && wallet.veloopCoins + veloopDiff < 0) {
      return { success: false, wallet, error: "Insufficient VELoop Coins" };
    }

    if (creditsDiff !== 0) {
      const before = wallet.credits;
      wallet.credits += creditsDiff;
      this.recordWalletTx(userId, type, "CREDITS", Math.abs(creditsDiff), before, wallet.credits, source, referenceId);
    }

    if (coresDiff !== 0) {
      const before = wallet.energyCores;
      wallet.energyCores += coresDiff;
      this.recordWalletTx(userId, type, "ENERGY_CORES", Math.abs(coresDiff), before, wallet.energyCores, source, referenceId);
    }

    if (veloopDiff !== 0) {
      const before = wallet.veloopCoins;
      wallet.veloopCoins += veloopDiff;
      this.recordWalletTx(userId, type, "VELOOP_COINS", Math.abs(veloopDiff), before, wallet.veloopCoins, source, referenceId);
    }

    this.save(this.db);
    return { success: true, wallet };
  }

  public addXP(userId: string, amount: number): { level: number; xp: number; leveledUp: boolean } {
    const profile = this.getProfile(userId);
    profile.xp += amount;
    // Level formula: level = floor(sqrt(xp / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(profile.xp / 100)) + 1;
    const leveledUp = newLevel > profile.level;
    if (leveledUp) {
      profile.level = newLevel;
      // Bonus on level up!
      this.modifyWallet(userId, { credits: newLevel * 50, veloopCoins: 2 }, "CREDIT", `Level Up Rank ${newLevel} Bonus`, `level_${newLevel}`);
    }
    this.save(this.db);
    return { level: profile.level, xp: profile.xp, leveledUp };
  }

  // --- Ships & Hangar ---
  public getShips(): ShipDefinition[] {
    return this.db.ships;
  }

  public getPlayerShips(userId: string): Record<string, PlayerShipState> {
    if (!this.db.playerShips[userId]) {
      this.db.playerShips[userId] = {
        interceptor: { shipId: "interceptor", unlocked: true, upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 } },
        guardian: { shipId: "guardian", unlocked: false, upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 } },
        striker: { shipId: "striker", unlocked: false, upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 } },
        support: { shipId: "support", unlocked: false, upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 } },
        experimental: { shipId: "experimental", unlocked: false, upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 } },
      };
      this.save(this.db);
    }
    return this.db.playerShips[userId];
  }

  public selectShip(userId: string, shipId: string): boolean {
    const playerShips = this.getPlayerShips(userId);
    if (!playerShips[shipId] || !playerShips[shipId].unlocked) {
      return false;
    }
    const profile = this.getProfile(userId);
    profile.selectedShipId = shipId;
    this.save(this.db);
    return true;
  }

  public unlockShip(userId: string, shipId: string): { success: boolean; error?: string } {
    const shipDef = this.db.ships.find((s) => s.id === shipId);
    if (!shipDef) return { success: false, error: "Ship not found" };

    const playerShips = this.getPlayerShips(userId);
    if (playerShips[shipId]?.unlocked) {
      return { success: false, error: "Ship already unlocked" };
    }

    const wallet = this.getWallet(userId);
    if (wallet.credits < shipDef.unlockCostCredits || wallet.energyCores < shipDef.unlockCostCores) {
      return { success: false, error: "Insufficient currency to commission this vessel" };
    }

    // Atomic deduction
    const res = this.modifyWallet(
      userId,
      { credits: -shipDef.unlockCostCredits, energyCores: -shipDef.unlockCostCores },
      "SHIP_UNLOCK",
      `Commissioned Starship ${shipDef.name}`,
      `unlock_${shipId}`
    );
    if (!res.success) return { success: false, error: res.error };

    if (!playerShips[shipId]) {
      playerShips[shipId] = {
        shipId,
        unlocked: true,
        upgrades: { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 },
      };
    } else {
      playerShips[shipId].unlocked = true;
    }

    // Check achievement: Fleet Recruit or Fleet Commander
    this.checkShipAchievements(userId);

    this.save(this.db);
    return { success: true };
  }

  public upgradeShip(
    userId: string,
    shipId: string,
    attribute: "damage" | "fireRate" | "health" | "speed" | "shield"
  ): { success: boolean; newLevel?: number; error?: string } {
    const shipDef = this.db.ships.find((s) => s.id === shipId);
    if (!shipDef) return { success: false, error: "Ship not found" };

    const playerShips = this.getPlayerShips(userId);
    const shipState = playerShips[shipId];
    if (!shipState || !shipState.unlocked) {
      return { success: false, error: "Ship is locked" };
    }

    const currentLevel = shipState.upgrades[attribute] || 0;
    if (currentLevel >= shipDef.maxUpgradeLevel) {
      return { success: false, error: "Max upgrade level reached" };
    }

    // Server-controlled price calculation: baseCost * (1 + currentLevel * 0.75)
    const cost = Math.round(shipDef.upgradeCostBase * (1 + currentLevel * 0.75));
    const wallet = this.getWallet(userId);

    if (wallet.credits < cost) {
      return { success: false, error: `Insufficient Credits. Needed: ${cost}` };
    }

    // Atomic transaction
    const res = this.modifyWallet(
      userId,
      { credits: -cost },
      "UPGRADE_PURCHASE",
      `Ship Upgrade: ${shipDef.name} ${attribute} Lvl ${currentLevel + 1}`,
      `upgrade_${shipId}_${attribute}_${currentLevel + 1}`
    );
    if (!res.success) return { success: false, error: res.error };

    shipState.upgrades[attribute] = currentLevel + 1;
    this.save(this.db);
    return { success: true, newLevel: shipState.upgrades[attribute] };
  }

  // --- Power-Ups ---
  public getPowerUps(): PowerUpDefinition[] {
    return this.db.powerUps;
  }

  public getPlayerInventory(userId: string): Record<string, number> {
    if (!this.db.playerInventories[userId]) {
      this.db.playerInventories[userId] = {
        "shield-pulse": 1,
        "rapid-fire": 1,
        "spread-shot": 1,
        "homing-missiles": 0,
        "emp-blast": 0,
        "repair-drone": 1,
        overdrive: 0,
        "emergency-warp": 0,
      };
      this.save(this.db);
    }
    return this.db.playerInventories[userId];
  }

  public acquirePowerUp(userId: string, powerUpId: string, quantity: number = 1): { success: boolean; count?: number; error?: string } {
    const powerDef = this.db.powerUps.find((p) => p.id === powerUpId);
    if (!powerDef) return { success: false, error: "Power-up not found" };

    const inv = this.getPlayerInventory(userId);
    const current = inv[powerUpId] || 0;
    if (current + quantity > powerDef.maxStock) {
      return { success: false, error: `Maximum inventory capacity reached (${powerDef.maxStock})` };
    }

    const totalCost = powerDef.creditCost * quantity;
    const wallet = this.getWallet(userId);
    if (wallet.credits < totalCost) {
      return { success: false, error: `Insufficient Credits. Needed: ${totalCost}` };
    }

    const res = this.modifyWallet(
      userId,
      { credits: -totalCost },
      "POWERUP_PURCHASE",
      `Purchased ${quantity}x ${powerDef.name}`,
      `pwr_${powerUpId}_${Date.now()}`
    );
    if (!res.success) return { success: false, error: res.error };

    inv[powerUpId] = current + quantity;
    this.save(this.db);
    return { success: true, count: inv[powerUpId] };
  }

  // --- Missions & Game Sessions ---
  public getMissions(): MissionDefinition[] {
    return this.db.missions;
  }

  public getPlayerMissions(userId: string): Record<number, PlayerMissionProgress> {
    if (!this.db.playerMissions[userId]) {
      this.db.playerMissions[userId] = {
        1: { missionId: 1, completed: false, stars: 0, bestScore: 0, bestTimeSec: 0, timesCompleted: 0 },
      };
      this.save(this.db);
    }
    return this.db.playerMissions[userId];
  }

  public startGameSession(userId: string, missionId: number, shipId: string): { success: boolean; session?: GameSession; error?: string } {
    const missions = this.getPlayerMissions(userId);
    const missionDef = this.db.missions.find((m) => m.id === missionId);
    if (!missionDef) return { success: false, error: "Invalid mission" };

    // Check if unlocked (Mission 1 is always unlocked, or missionId <= profile.highestMissionUnlocked)
    const profile = this.getProfile(userId);
    if (missionId > 1 && missionId > profile.highestMissionUnlocked) {
      return { success: false, error: "Mission is currently locked. Complete prior missions first." };
    }

    const playerShips = this.getPlayerShips(userId);
    if (!playerShips[shipId]?.unlocked) {
      return { success: false, error: "Selected ship is not commissioned" };
    }

    const sessionId = "sess_" + crypto.randomUUID().slice(0, 12);
    const serverValidationToken = crypto.randomBytes(16).toString("hex");

    const session: GameSession = {
      sessionId,
      userId,
      missionId,
      shipId,
      status: "active",
      startTime: Date.now(),
      revivesUsed: 0,
      doubleScoreClaimed: false,
      doubleCreditsClaimed: false,
      score: 0,
      enemiesKilled: 0,
      bossKilled: false,
      powerUpsUsed: 0,
      accuracy: 0,
      starsAwarded: 0,
      rewardsClaimed: false,
      serverValidationToken,
    };

    this.db.gameSessions[sessionId] = session;
    this.recordAnalytics(userId, "mission_started", { sessionId, missionId, shipId });
    this.save(this.db);

    return { success: true, session };
  }

  public completeGameSession(
    userId: string,
    sessionId: string,
    payload: {
      victory: boolean;
      score: number;
      enemiesKilled: number;
      bossKilled: boolean;
      powerUpsUsed: number;
      accuracy: number;
      durationSec: number;
    }
  ): { success: boolean; session?: GameSession; rewards?: { credits: number; xp: number; cores: number; stars: number }; error?: string } {
    const session = this.db.gameSessions[sessionId];
    if (!session) return { success: false, error: "Session not found" };
    if (session.userId !== userId) return { success: false, error: "Unauthorized session ownership" };
    if (session.status !== "active") return { success: false, error: "Session is not active" };

    const missionDef = this.db.missions.find((m) => m.id === session.missionId);
    if (!missionDef) return { success: false, error: "Mission definition not found" };

    // Anti-Cheat Checks (Section 65 & 66)
    // 1. Min Duration check
    const elapsedSec = (Date.now() - session.startTime) / 1000;
    if (elapsedSec < 3) {
      session.status = "failed";
      this.recordAnalytics(userId, "cheat_detected", { sessionId, reason: "Impossible completion time", elapsedSec });
      this.save(this.db);
      return { success: false, error: "Anti-cheat: Run finished impossibly fast" };
    }

    // 2. Score bounds check (reasonable max score calculation)
    const maxReasonableScore = 50000 + missionDef.id * 5000 + payload.enemiesKilled * 500;
    if (payload.score > maxReasonableScore) {
      session.status = "failed";
      this.recordAnalytics(userId, "cheat_detected", { sessionId, reason: "Impossible score", score: payload.score });
      this.save(this.db);
      return { success: false, error: "Anti-cheat: Score exceeded maximum theoretical bound" };
    }

    session.endTime = Date.now();
    session.score = Math.floor(payload.score);
    session.enemiesKilled = payload.enemiesKilled;
    session.bossKilled = payload.bossKilled;
    session.powerUpsUsed = payload.powerUpsUsed;
    session.accuracy = Math.min(100, Math.max(0, payload.accuracy));

    if (!payload.victory) {
      session.status = "failed";
      this.recordAnalytics(userId, "mission_failed", { sessionId, missionId: session.missionId, score: session.score });
      this.save(this.db);
      return { success: true, session };
    }

    // Victory achieved!
    session.status = "completed";

    // 3-Star Rating System (Section 19)
    let stars = 1;
    if (payload.accuracy >= 65 || payload.durationSec <= missionDef.timeLimitSec * 0.75) {
      stars = 2;
    }
    if (payload.accuracy >= 80 && payload.durationSec <= missionDef.timeLimitSec * 0.6) {
      stars = 3;
    }
    session.starsAwarded = stars;

    // Calculate Authoritative Rewards
    const economy = this.db.economyConfig;
    let credits = missionDef.rewardCredits;
    let xp = missionDef.rewardXP;
    let cores = missionDef.rewardCores;

    if (stars === 3) {
      credits += economy.threeStarBonusCredits;
    }

    // Update Player Mission Record
    const playerMissions = this.getPlayerMissions(userId);
    const existing = playerMissions[session.missionId] || {
      missionId: session.missionId,
      completed: false,
      stars: 0,
      bestScore: 0,
      bestTimeSec: 9999,
      timesCompleted: 0,
    };

    existing.completed = true;
    existing.stars = Math.max(existing.stars, stars);
    existing.bestScore = Math.max(existing.bestScore, session.score);
    existing.bestTimeSec = Math.min(existing.bestTimeSec, payload.durationSec);
    existing.timesCompleted += 1;
    playerMissions[session.missionId] = existing;

    // Unlock next mission if eligible
    const profile = this.getProfile(userId);
    if (session.missionId >= profile.highestMissionUnlocked && session.missionId < 50) {
      profile.highestMissionUnlocked = session.missionId + 1;
      profile.highestSectorUnlocked = Math.min(5, Math.floor((session.missionId) / 10) + 1);
      playerMissions[session.missionId + 1] = {
        missionId: session.missionId + 1,
        completed: false,
        stars: 0,
        bestScore: 0,
        bestTimeSec: 0,
        timesCompleted: 0,
      };
    }

    profile.missionsCompletedCount += 1;
    profile.totalScore += session.score;
    profile.bestScore = Math.max(profile.bestScore, session.score);

    // Apply baseline rewards
    session.rewardsClaimed = true;
    this.modifyWallet(
      userId,
      { credits, energyCores: cores },
      "MISSION_REWARD",
      `Mission ${session.missionId} Victory: ${missionDef.title}`,
      `sess_${session.sessionId}`
    );
    this.addXP(userId, xp);

    // Update daily mission progress
    this.updateDailyProgress(userId, "missions", 1);
    this.updateDailyProgress(userId, "kills", payload.enemiesKilled);
    if (payload.powerUpsUsed > 0) {
      this.updateDailyProgress(userId, "powerups", payload.powerUpsUsed);
    }

    // Check achievements
    this.checkMissionAchievements(userId, session, stars);

    this.recordAnalytics(userId, "mission_completed", {
      sessionId,
      missionId: session.missionId,
      score: session.score,
      stars,
      credits,
    });

    this.save(this.db);

    return {
      success: true,
      session,
      rewards: { credits, xp, cores, stars },
    };
  }

  // --- Rewarded Ads & Economy ---
  public createAdOpportunity(
    userId: string,
    sessionId: string,
    placementType: AdOpportunity["placementType"],
    missionId?: number
  ): { success: boolean; opportunity?: AdOpportunity; error?: string } {
    const economy = this.db.economyConfig;
    if (!economy.rewardedAds.enabled) {
      return { success: false, error: "Rewarded advertising is currently disabled by system administration" };
    }

    const profile = this.getProfile(userId);
    const today = new Date().toISOString().split("T")[0];
    if (profile.dailyAdsResetDate !== today) {
      profile.dailyAdsResetDate = today;
      profile.dailyAdsWatchedCount = 0;
    }

    if (profile.dailyAdsWatchedCount >= economy.rewardedAds.maxRewardedAdsPerDay) {
      return { success: false, error: `Daily ad cap reached (${economy.rewardedAds.maxRewardedAdsPerDay}/day)` };
    }

    // Cooldown check (30s)
    const timeSinceLast = (Date.now() - profile.lastAdWatchTime) / 1000;
    if (profile.lastAdWatchTime > 0 && timeSinceLast < economy.rewardedAds.minSecondsBetweenRewardedAds) {
      const wait = Math.ceil(economy.rewardedAds.minSecondsBetweenRewardedAds - timeSinceLast);
      return { success: false, error: `Ad frequency limit. Please wait ${wait} seconds before watching another ad.` };
    }

    // Session-level limits
    const session = this.db.gameSessions[sessionId];
    if (placementType === "REVIVE") {
      if (!session) return { success: false, error: "Active game session required for revive" };
      if (session.revivesUsed >= economy.rewardedAds.maxRevivesPerMission) {
        return { success: false, error: "Revive limit reached for this sortie (max 1 revive)" };
      }
    } else if (placementType === "DOUBLE_SCORE") {
      if (!session) return { success: false, error: "Mission session required" };
      if (session.doubleScoreClaimed) {
        return { success: false, error: "Double score already applied to this session" };
      }
    } else if (placementType === "DOUBLE_CREDITS") {
      if (!session) return { success: false, error: "Mission session required" };
      if (session.doubleCreditsClaimed) {
        return { success: false, error: "Double credits already granted for this session" };
      }
    }

    const id = "ad_opp_" + crypto.randomUUID().slice(0, 10);
    const token = crypto.randomBytes(24).toString("hex");

    const opportunity: AdOpportunity = {
      id,
      userId,
      sessionId,
      missionId,
      placementType,
      provider: "VELoop Simulated Ad Adapter",
      status: "OFFERED",
      token,
      expiresAt: Date.now() + 180000, // 3 minutes validity
      createdAt: Date.now(),
    };

    this.db.adOpportunities[id] = opportunity;
    this.recordAnalytics(userId, "ad_opportunity_created", { id, placementType, sessionId });
    this.save(this.db);

    return { success: true, opportunity };
  }

  public verifyAndClaimAd(
    userId: string,
    opportunityId: string,
    adEventId: string
  ): {
    success: boolean;
    rewardType?: string;
    amountGranted?: number;
    updatedBalance?: number;
    error?: string;
  } {
    const opp = this.db.adOpportunities[opportunityId];
    if (!opp) return { success: false, error: "Ad opportunity not found" };
    if (opp.userId !== userId) return { success: false, error: "Unauthorized ad claimant" };
    if (opp.status === "GRANTED") return { success: false, error: "Ad reward already claimed (Idempotency enforced)" };
    if (opp.expiresAt < Date.now()) {
      opp.status = "EXPIRED";
      this.save(this.db);
      return { success: false, error: "Ad opportunity expired" };
    }

    const session = this.db.gameSessions[opp.sessionId];
    const profile = this.getProfile(userId);
    let amountGranted = 0;
    let rewardType: RewardTransaction["rewardType"] = "DOUBLE_CREDITS";

    if (opp.placementType === "REVIVE") {
      if (!session) return { success: false, error: "Session missing for revive" };
      if (session.revivesUsed >= this.db.economyConfig.rewardedAds.maxRevivesPerMission) {
        return { success: false, error: "Revive limit exceeded" };
      }
      session.revivesUsed += 1;
      session.status = "active";
      rewardType = "REVIVE";
      amountGranted = 1;
    } else if (opp.placementType === "DOUBLE_SCORE") {
      if (!session) return { success: false, error: "Session missing for double score" };
      if (session.doubleScoreClaimed) {
        return { success: false, error: "Double score already claimed" };
      }
      session.doubleScoreClaimed = true;
      const originalScore = session.score;
      session.score = session.score * 2;
      amountGranted = originalScore;
      rewardType = "DOUBLE_SCORE";
      profile.totalScore += originalScore;
      profile.bestScore = Math.max(profile.bestScore, session.score);
    } else if (opp.placementType === "DOUBLE_CREDITS") {
      if (!session) return { success: false, error: "Session missing for double credits" };
      if (session.doubleCreditsClaimed) {
        return { success: false, error: "Double credits already claimed" };
      }
      session.doubleCreditsClaimed = true;
      const missionDef = this.db.missions.find((m) => m.id === session.missionId);
      const baseCredits = missionDef ? missionDef.rewardCredits : 100;
      amountGranted = baseCredits;
      rewardType = "DOUBLE_CREDITS";
      this.modifyWallet(userId, { credits: baseCredits, veloopCoins: 2 }, "AD_REWARD", "VELoop Rewarded Ad: Double Credits Boost", opp.id);
    } else if (opp.placementType === "POWER_UP") {
      rewardType = "EXTRA_SHIELD";
      const inv = this.getPlayerInventory(userId);
      inv["shield-pulse"] = (inv["shield-pulse"] || 0) + 1;
      amountGranted = 1;
    } else if (opp.placementType === "DAILY_BONUS") {
      rewardType = "DAILY_BONUS";
      amountGranted = 200;
      this.modifyWallet(userId, { credits: 200, veloopCoins: 5 }, "AD_REWARD", "VELoop Daily Ad Bonus", opp.id);
    }

    opp.status = "GRANTED";
    profile.lastAdWatchTime = Date.now();
    profile.dailyAdsWatchedCount += 1;

    // Log in RewardTransaction ledger
    const rewardTx: RewardTransaction = {
      id: "rtx_" + crypto.randomUUID().slice(0, 10),
      userId,
      sessionId: opp.sessionId,
      missionId: opp.missionId,
      rewardType,
      amount: amountGranted,
      multiplier: 2,
      source: "VELoop Sponsored Ad Unit",
      adProvider: opp.provider,
      adEventId,
      verificationStatus: "VERIFIED",
      timestamp: Date.now(),
    };
    this.db.rewardTransactions.unshift(rewardTx);

    this.recordAnalytics(userId, "ad_completed", { opportunityId, placementType: opp.placementType, rewardType, amountGranted });
    this.save(this.db);

    const updatedWallet = this.getWallet(userId);
    return {
      success: true,
      rewardType,
      amountGranted,
      updatedBalance: updatedWallet.credits,
    };
  }

  // --- Daily Login Streak ---
  public claimDailyLogin(userId: string): { success: boolean; streak?: number; rewards?: { credits: number; cores: number; coins: number }; error?: string } {
    const profile = this.getProfile(userId);
    const today = new Date().toISOString().split("T")[0];

    if (profile.lastDailyClaimDate === today) {
      return { success: false, error: "Daily reward already claimed today. Return tomorrow!" };
    }

    // Check if streak is continued (within 48 hours) or reset
    let nextStreak = profile.dailyStreak + 1;
    if (profile.lastDailyClaimDate) {
      const lastDate = new Date(profile.lastDailyClaimDate).getTime();
      const diffDays = Math.floor((new Date(today).getTime() - lastDate) / (1000 * 3600 * 24));
      if (diffDays > 1) {
        nextStreak = 1; // streak broke
      }
    }
    if (nextStreak > 7) nextStreak = 1; // cycle 7 days

    // Day 1 to 7 structured rewards
    const rewardTable = [
      { credits: 100, cores: 0, coins: 2 },
      { credits: 150, cores: 1, coins: 3 },
      { credits: 200, cores: 1, coins: 5 },
      { credits: 250, cores: 2, coins: 6 },
      { credits: 350, cores: 2, coins: 8 },
      { credits: 500, cores: 3, coins: 10 },
      { credits: 1000, cores: 5, coins: 25 },
    ];

    const r = rewardTable[nextStreak - 1];
    profile.dailyStreak = nextStreak;
    profile.lastDailyClaimDate = today;

    this.modifyWallet(
      userId,
      { credits: r.credits, energyCores: r.cores, veloopCoins: r.coins },
      "DAILY_BONUS",
      `Day ${nextStreak} Login Streak Reward`,
      `streak_day_${nextStreak}_${today}`
    );

    this.save(this.db);
    return { success: true, streak: nextStreak, rewards: r };
  }

  // --- Supply Drop (Gacha with defined probabilities) ---
  public claimSupplyDrop(userId: string): { success: boolean; reward?: { type: string; label: string; amount: number }; error?: string } {
    const wallet = this.getWallet(userId);
    const cost = 150; // credits or free cooldown
    if (wallet.credits < cost) {
      return { success: false, error: `Insufficient Credits to open Supply Drop (Needs ${cost})` };
    }

    // Deduct cost
    this.modifyWallet(userId, { credits: -cost }, "BOOSTER_PURCHASE", "Orbital Supply Drop Decryption", `crate_${Date.now()}`);

    // Drop table with transparent probabilities
    const roll = Math.random();
    let result: { type: string; label: string; amount: number };

    if (roll < 0.45) {
      // 45% chance: High credit cache (200 - 450)
      const amt = Math.floor(Math.random() * 250) + 200;
      this.modifyWallet(userId, { credits: amt }, "SUPPLY_DROP", "Supply Drop: Bulk Credits Cache", `crate_p_${Date.now()}`);
      result = { type: "CREDITS", label: `${amt} Galactic Credits`, amount: amt };
    } else if (roll < 0.75) {
      // 30% chance: Tactical Power-ups pack (2 random power-ups)
      const inv = this.getPlayerInventory(userId);
      const keys = Object.keys(inv);
      const p1 = keys[Math.floor(Math.random() * keys.length)];
      inv[p1] = (inv[p1] || 0) + 2;
      result = { type: "POWERUP", label: `2x Combat Modules (${p1})`, amount: 2 };
    } else if (roll < 0.92) {
      // 17% chance: Energy Cores (2 - 4 cores)
      const cores = Math.floor(Math.random() * 3) + 2;
      this.modifyWallet(userId, { energyCores: cores }, "SUPPLY_DROP", "Supply Drop: Rare Energy Cores", `crate_c_${Date.now()}`);
      result = { type: "ENERGY_CORES", label: `${cores} Rare Energy Cores`, amount: cores };
    } else {
      // 8% chance: VELoop Jackpot (15 - 25 coins)
      const coins = Math.floor(Math.random() * 11) + 15;
      this.modifyWallet(userId, { veloopCoins: coins }, "SUPPLY_DROP", "Supply Drop: VELoop Reward Jackpot!", `crate_j_${Date.now()}`);
      result = { type: "VELOOP_COINS", label: `${coins} VELoop Reward Coins`, amount: coins };
    }

    this.save(this.db);
    return { success: true, reward: result };
  }

  // --- Daily Missions Progress ---
  private updateDailyProgress(userId: string, type: DailyMission["type"], amount: number) {
    if (!this.db.playerDailyMissions[userId]) {
      this.db.playerDailyMissions[userId] = {};
    }
    const missions = this.db.dailyMissions.filter((m) => m.type === type);
    for (const m of missions) {
      const current = this.db.playerDailyMissions[userId][m.id] || { progress: 0, completed: false, claimed: false };
      current.progress += amount;
      if (current.progress >= m.requiredCount) {
        current.completed = true;
      }
      this.db.playerDailyMissions[userId][m.id] = current;
    }
  }

  public claimDailyMission(userId: string, missionId: string): { success: boolean; error?: string } {
    const userDaily = this.db.playerDailyMissions[userId]?.[missionId];
    if (!userDaily || !userDaily.completed) {
      return { success: false, error: "Mission objectives not yet satisfied" };
    }
    if (userDaily.claimed) {
      return { success: false, error: "Daily mission reward already claimed" };
    }

    const missionDef = this.db.dailyMissions.find((m) => m.id === missionId);
    if (!missionDef) return { success: false, error: "Daily mission definition not found" };

    userDaily.claimed = true;
    this.modifyWallet(userId, { credits: missionDef.rewardCredits }, "DAILY_BONUS", `Daily Mission: ${missionDef.title}`, missionId);
    this.addXP(userId, missionDef.rewardXP);

    this.save(this.db);
    return { success: true };
  }

  public getDailyMissions(userId: string) {
    const userProgress = this.db.playerDailyMissions[userId] || {};
    return this.db.dailyMissions.map((m) => ({
      ...m,
      progress: userProgress[m.id]?.progress || 0,
      completed: userProgress[m.id]?.completed || false,
      claimed: userProgress[m.id]?.claimed || false,
    }));
  }

  // --- Achievements ---
  public getAchievements(userId: string) {
    const userAch = this.db.playerAchievements[userId] || {};
    return this.db.achievements.map((a) => ({
      ...a,
      unlocked: !!userAch[a.id]?.unlocked,
      unlockedAt: userAch[a.id]?.unlockedAt || null,
    }));
  }

  private checkShipAchievements(userId: string) {
    const ships = this.getPlayerShips(userId);
    const count = Object.values(ships).filter((s) => s.unlocked).length;
    if (count >= 2) this.unlockAchievement(userId, "fleet_recruit");
    if (count >= 4) this.unlockAchievement(userId, "fleet_commander");
  }

  private checkMissionAchievements(userId: string, session: GameSession, stars: number) {
    this.unlockAchievement(userId, "first_contact");
    if (session.missionId === 10 && session.bossKilled) {
      this.unlockAchievement(userId, "boss_breaker");
    }
    if (session.missionId >= 11) {
      this.unlockAchievement(userId, "sector_explorer");
    }
    if (session.accuracy >= 85) {
      this.unlockAchievement(userId, "ace_pilot");
    }
    if (session.missionId === 50 && session.bossKilled) {
      this.unlockAchievement(userId, "void_conqueror");
    }
  }

  public unlockAchievement(userId: string, achId: string) {
    if (!this.db.playerAchievements[userId]) {
      this.db.playerAchievements[userId] = {};
    }
    if (this.db.playerAchievements[userId][achId]?.unlocked) return;

    const achDef = this.db.achievements.find((a) => a.id === achId);
    if (!achDef) return;

    this.db.playerAchievements[userId][achId] = {
      unlocked: true,
      unlockedAt: Date.now(),
    };

    this.modifyWallet(
      userId,
      { credits: achDef.rewardCredits, energyCores: achDef.rewardCores },
      "CREDIT",
      `Achievement Unlocked: ${achDef.title}`,
      `ach_${achId}`
    );
    this.addXP(userId, achDef.rewardXP);
    this.recordAnalytics(userId, "achievement_unlocked", { achId, title: achDef.title });
    this.save(this.db);
  }

  // --- Leaderboard ---
  public getLeaderboard(currentUserId?: string): { leaderboard: LeaderboardEntry[]; myRank?: LeaderboardEntry } {
    const list: LeaderboardEntry[] = Object.values(this.db.profiles).map((p) => {
      const ship = this.db.ships.find((s) => s.id === p.selectedShipId);
      return {
        rank: 0,
        userId: p.userId,
        displayName: p.displayName,
        score: p.totalScore,
        missionsCompleted: p.missionsCompletedCount,
        shipName: ship?.name || "Aero-X Interceptor",
        level: p.level,
      };
    });

    list.sort((a, b) => b.score - a.score || b.missionsCompleted - a.missionsCompleted);
    list.forEach((item, index) => {
      item.rank = index + 1;
    });

    let myRank: LeaderboardEntry | undefined;
    if (currentUserId) {
      myRank = list.find((item) => item.userId === currentUserId);
    }

    return { leaderboard: list.slice(0, 50), myRank };
  }

  // --- Economy Config & Admin Dashboard ---
  public getEconomyConfig(): EconomyConfig {
    return this.db.economyConfig;
  }

  public updateEconomyConfig(newConfig: Partial<EconomyConfig>): EconomyConfig {
    this.db.economyConfig = {
      ...this.db.economyConfig,
      ...newConfig,
      rewardedAds: {
        ...this.db.economyConfig.rewardedAds,
        ...(newConfig.rewardedAds || {}),
      },
    };
    this.save(this.db);
    return this.db.economyConfig;
  }

  public getAdminMetrics() {
    const totalAdOpps = Object.keys(this.db.adOpportunities).length;
    const completedAds = Object.values(this.db.adOpportunities).filter((o) => o.status === "GRANTED").length;
    const completionRate = totalAdOpps > 0 ? Math.round((completedAds / totalAdOpps) * 100) : 0;

    let creditsGranted = 0;
    let creditsSpent = 0;
    for (const tx of this.db.walletTransactions) {
      if (tx.currency === "CREDITS") {
        if (["MISSION_REWARD", "BOSS_REWARD", "AD_REWARD", "DAILY_BONUS", "CREDIT", "SUPPLY_DROP"].includes(tx.type)) {
          creditsGranted += tx.amount;
        } else if (["UPGRADE_PURCHASE", "POWERUP_PURCHASE", "SHIP_UNLOCK", "BOOSTER_PURCHASE"].includes(tx.type)) {
          creditsSpent += tx.amount;
        }
      }
    }

    const totalUsers = Object.keys(this.db.users).length;
    const avgRewardPerUser = totalUsers > 0 ? Math.round(creditsGranted / totalUsers) : 0;

    const revivesRequested = Object.values(this.db.adOpportunities).filter((o) => o.placementType === "REVIVE").length;
    const revivesCompleted = Object.values(this.db.adOpportunities).filter((o) => o.placementType === "REVIVE" && o.status === "GRANTED").length;

    const doubleScoreOpps = Object.values(this.db.adOpportunities).filter((o) => o.placementType === "DOUBLE_SCORE").length;
    const doubleScoreCompleted = Object.values(this.db.adOpportunities).filter((o) => o.placementType === "DOUBLE_SCORE" && o.status === "GRANTED").length;

    const doubleCreditsOpps = Object.values(this.db.adOpportunities).filter((o) => o.placementType === "DOUBLE_CREDITS").length;
    const doubleCreditsCompleted = Object.values(this.db.adOpportunities).filter((o) => o.placementType === "DOUBLE_CREDITS" && o.status === "GRANTED").length;

    return {
      totalAdOpportunities: totalAdOpps,
      completedRewardedAds: completedAds,
      rewardedAdCompletionRate: completionRate,
      creditsGranted,
      creditsSpent,
      averageRewardPerUser: avgRewardPerUser,
      reviveConversion: revivesRequested > 0 ? Math.round((revivesCompleted / revivesRequested) * 100) : 0,
      doubleScoreConversion: doubleScoreOpps > 0 ? Math.round((doubleScoreCompleted / doubleScoreOpps) * 100) : 0,
      doubleCreditsConversion: doubleCreditsOpps > 0 ? Math.round((doubleCreditsCompleted / doubleCreditsOpps) * 100) : 0,
      rewardRejectionCount: Object.values(this.db.adOpportunities).filter((o) => o.status === "REJECTED").length,
      activeUsersCount: totalUsers,
    };
  }

  public getWalletHistory(userId: string) {
    return this.db.walletTransactions.filter((tx) => tx.userId === userId).slice(0, 50);
  }

  public getRewardHistory(userId: string) {
    return this.db.rewardTransactions.filter((rtx) => rtx.userId === userId).slice(0, 50);
  }

  public recordAnalytics(userId: string, eventType: string, metadata: Record<string, any>) {
    this.db.analyticsEvents.push({
      id: "ev_" + crypto.randomUUID().slice(0, 8),
      userId,
      eventType,
      metadata,
      timestamp: Date.now(),
    });
    if (this.db.analyticsEvents.length > 1000) {
      this.db.analyticsEvents = this.db.analyticsEvents.slice(-1000);
    }
  }
}

export const store = new GameStore();
