// src/services/BatchCounterService.ts
// HOEOS: Public Batch Secret Counter - Tracks all projects queried

export interface BatchCounterStats {
  totalProjects: number;
  todayProjects: number;
  thisWeekProjects: number;
  thisMonthProjects: number;
  lastProjectTimestamp: string;
  averageDaily: number;
}

export class BatchCounterService {
  private static instance: BatchCounterService;
  private totalCount: number = 0;
  private dailyCount: number = 0;
  private weeklyCount: number = 0;
  private monthlyCount: number = 0;
  private lastReset: string = new Date().toISOString();
  private lastProjectTimestamp: string = '';
  private dailyHistory: number[] = [];

  static getInstance(): BatchCounterService {
    if (!BatchCounterService.instance) {
      BatchCounterService.instance = new BatchCounterService();
    }
    return BatchCounterService.instance;
  }

  // 🔐 Increment counter (called on every project analysis)
  incrementCounter(): { total: number; today: number; week: number; month: number } {
    this.totalCount++;
    this.dailyCount++;
    this.weeklyCount++;
    this.monthlyCount++;
    this.lastProjectTimestamp = new Date().toISOString();

    // Auto-reset daily at midnight
    const now = new Date();
    const lastResetDate = new Date(this.lastReset);
    if (now.getDate() !== lastResetDate.getDate() || 
        now.getMonth() !== lastResetDate.getMonth() || 
        now.getFullYear() !== lastResetDate.getFullYear()) {
      this.dailyCount = 0;
      this.lastReset = now.toISOString();
    }

    // Weekly reset (Monday)
    if (now.getDay() === 1 && now.getHours() < 6) {
      this.weeklyCount = 0;
    }

    // Monthly reset (1st of month)
    if (now.getDate() === 1 && now.getHours() < 6) {
      this.monthlyCount = 0;
    }

    // Update daily history (keep last 30 days)
    this.dailyHistory.push(this.dailyCount);
    if (this.dailyHistory.length > 30) {
      this.dailyHistory.shift();
    }

    return {
      total: this.totalCount,
      today: this.dailyCount,
      week: this.weeklyCount,
      month: this.monthlyCount
    };
  }

  // 📊 Get current stats
  getStats(): BatchCounterStats {
    const now = new Date();
    const totalDays = Math.max(1, Math.ceil((now.getTime() - new Date(this.lastReset).getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      totalProjects: this.totalCount,
      todayProjects: this.dailyCount,
      thisWeekProjects: this.weeklyCount,
      thisMonthProjects: this.monthlyCount,
      lastProjectTimestamp: this.lastProjectTimestamp || new Date().toISOString(),
      averageDaily: Math.round(this.totalCount / totalDays)
    };
  }

  // 🔐 Get secret counter value (for admin tracking)
  getSecretCounter(): number {
    return this.totalCount;
  }

  // 📈 Get daily history for charts
  getDailyHistory(): number[] {
    return this.dailyHistory;
  }
}
