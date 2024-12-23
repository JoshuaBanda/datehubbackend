export class ConfessionTracker {  // Renamed class to ConfessionTracker
    private userSentConfessions: Map<number, Set<number>>;  // Renamed to userSentConfessions
  
    constructor() {
      this.userSentConfessions = new Map();
    }
  
    getSentConfessionIds(userId: number): number[] {  // Renamed method to getSentConfessionIds
      return Array.from(this.userSentConfessions.get(userId) || []);
    }
  
    markConfessionsAsSent(userId: number, confessions: { confession_id: number }[]): void {  // Renamed method and parameter to markConfessionsAsSent
      if (!this.userSentConfessions.has(userId)) {
        this.userSentConfessions.set(userId, new Set());
      }
      const userConfessions = this.userSentConfessions.get(userId);
      confessions.forEach((confession) => userConfessions.add(confession.confession_id));  // Renamed to confession_id
      console.log(`Marking confessions as sent for user ${userId}: ${Array.from(userConfessions)}`);
    }
  
    clearSentConfessions(userId: number): void {  // Renamed to clearSentConfessions
      console.log(`Clearing sent confession IDs for user ${userId}`);
      this.userSentConfessions.delete(userId);
    }
  
    clearAllSentConfessions(): void {  // Renamed to clearAllSentConfessions
      console.log('Clearing sent confession IDs for all users');
      this.userSentConfessions.clear();
    }
  }
  