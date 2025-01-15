export class BusinessTracker {
    private userSentBusinesses: Map<number, Set<number>>;
  
    constructor() {
      this.userSentBusinesses = new Map();
    }
  
    getSentBusinessIds(userId: number): number[] {
      return Array.from(this.userSentBusinesses.get(userId) || []);
    }
  
    markBusinessesAsSent(userId: number, businesses: { business_id: number }[]): void {
      if (!this.userSentBusinesses.has(userId)) {
        this.userSentBusinesses.set(userId, new Set());
      }
      const userBusinesses = this.userSentBusinesses.get(userId);
      businesses.forEach((business) => userBusinesses.add(business.business_id));
      //console.log(`Marking businesses as sent for user ${userId}: ${Array.from(userBusinesses)}`);
    }
  
    clearSentBusinesses(userId: number): void {
      //console.log(`Clearing sent business IDs for user ${userId}`);
      this.userSentBusinesses.delete(userId);
    }
  
    clearAllSentBusinesses(): void {
      //console.log('Clearing sent business IDs for all users');
      this.userSentBusinesses.clear();
    }
  }
  