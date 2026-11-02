/**
 * Client-Side API Service
 * Interacts with server REST endpoints
 */
import { API_BASE_URL } from "../config/gameConfig.ts";

class ApiClient {
  private token: string | null = null;

  constructor() {
    try {
      this.token = localStorage.getItem("odyssey_token");
    } catch (e) {}
  }

  public setToken(token: string | null) {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem("odyssey_token", token);
      } else {
        localStorage.removeItem("odyssey_token");
      }
    } catch (e) {}
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data as T;
  }

  // --- Auth ---
  public login(identifier: string, password: string) {
    return this.request<{ message: string; user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
  }

  public register(username: string, email: string, password: string) {
    return this.request<{ message: string; user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  }

  public logout() {
    return this.request<{ message: string }>("/auth/logout", { method: "POST" });
  }

  public getMe() {
    return this.request<{
      gameName: string;
      user: any;
      profile: any;
      wallet: any;
    }>("/auth/me");
  }

  // --- Player Progress & Inventory ---
  public getPlayerProgress() {
    return this.request<{
      profile: any;
      wallet: any;
      missions: Record<number, any>;
      ships: Record<string, any>;
      inventory: Record<string, number>;
    }>("/player/progress");
  }

  public getPlayerHistory() {
    return this.request<{
      walletHistory: any[];
      rewardHistory: any[];
    }>("/player/history");
  }

  // --- Ships ---
  public getShips() {
    return this.request<any[]>("/ships");
  }

  public selectShip(shipId: string) {
    return this.request<{ success: boolean; selectedShipId: string }>(`/ships/${shipId}/select`, {
      method: "POST",
    });
  }

  public unlockShip(shipId: string) {
    return this.request<{ success: boolean; message: string }>(`/ships/${shipId}/unlock`, {
      method: "POST",
    });
  }

  public upgradeShip(shipId: string, attribute: string) {
    return this.request<{ success: boolean; attribute: string; newLevel: number }>(`/ships/${shipId}/upgrade`, {
      method: "POST",
      body: JSON.stringify({ attribute }),
    });
  }

  // --- Power-Ups ---
  public getPowerUps() {
    return this.request<any[]>("/powerups");
  }

  public acquirePowerUp(powerUpId: string, quantity: number = 1) {
    return this.request<{ success: boolean; powerUpId: string; count: number }>(`/powerups/${powerUpId}/acquire`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    });
  }

  public usePowerUpInGame(sessionId: string, powerUpId: string) {
    return this.request<{ success: boolean; remaining: number }>(`/games/${sessionId}/powerups/use`, {
      method: "POST",
      body: JSON.stringify({ powerUpId }),
    });
  }

  // --- Missions & Combat Sessions ---
  public getMissions() {
    return this.request<any[]>("/missions");
  }

  public startMission(missionId: number, shipId: string) {
    return this.request<any>("/games/start", {
      method: "POST",
      body: JSON.stringify({ missionId, shipId }),
    });
  }

  public completeMission(sessionId: string, payload: {
    victory: boolean;
    score: number;
    enemiesKilled: number;
    bossKilled: boolean;
    powerUpsUsed: number;
    accuracy: number;
    durationSec: number;
  }) {
    return this.request<{
      success: boolean;
      session: any;
      rewards?: { credits: number; xp: number; cores: number; stars: number };
    }>(`/games/${sessionId}/complete`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // --- Rewarded Ads & Economy ---
  public getEconomyConfig() {
    return this.request<any>("/economy/config");
  }

  public requestAdOpportunity(sessionId: string, placementType: string, missionId?: number) {
    return this.request<any>("/rewards/ad/opportunity", {
      method: "POST",
      body: JSON.stringify({ sessionId, placementType, missionId }),
    });
  }

  public claimAdReward(opportunityId: string, adEventId: string) {
    return this.request<{
      success: boolean;
      rewardType: string;
      amountGranted: number;
      updatedBalance: number;
    }>("/rewards/ad/claim", {
      method: "POST",
      body: JSON.stringify({ opportunityId, adEventId }),
    });
  }

  public requestRevive(sessionId: string) {
    return this.request<any>(`/games/${sessionId}/revive/request`, { method: "POST" });
  }

  public verifyRevive(sessionId: string, opportunityId: string) {
    return this.request<{ success: boolean; revived: boolean }>(`/games/${sessionId}/revive/verify`, {
      method: "POST",
      body: JSON.stringify({ opportunityId }),
    });
  }

  // --- Daily Login, Supply Drop & Engagement ---
  public claimDailyLogin() {
    return this.request<{
      success: boolean;
      streak: number;
      rewards: { credits: number; cores: number; coins: number };
    }>("/player/daily-login/claim", { method: "POST" });
  }

  public claimSupplyDrop() {
    return this.request<{
      success: boolean;
      reward: { type: string; label: string; amount: number };
    }>("/player/supply-drop/claim", { method: "POST" });
  }

  public getDailyMissions() {
    return this.request<any[]>("/daily-missions");
  }

  public claimDailyMission(missionId: string) {
    return this.request<{ success: boolean; message: string }>(`/daily-missions/${missionId}/claim`, {
      method: "POST",
    });
  }

  public getAchievements() {
    return this.request<any[]>("/achievements");
  }

  public getLeaderboard() {
    return this.request<{ leaderboard: any[]; myRank?: any }>("/leaderboard");
  }

  public getEvents() {
    return this.request<any[]>("/events");
  }

  // --- Admin ---
  public getAdminMetrics() {
    return this.request<any>("/admin/metrics");
  }

  public updateEconomyConfig(newConfig: any) {
    return this.request<{ success: boolean; config: any }>("/admin/economy", {
      method: "PUT",
      body: JSON.stringify(newConfig),
    });
  }
}

export const api = new ApiClient();
