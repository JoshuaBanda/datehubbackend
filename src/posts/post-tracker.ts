export class PostTracker {
  private userSentPosts: Map<number, Set<number>>;

  constructor() {
    this.userSentPosts = new Map();
  }

  getSentPostIds(userId: number): number[] {
    return Array.from(this.userSentPosts.get(userId) || []);
  }

  markPostsAsSent(userId: number, posts: { post_id: number }[]): void {
    if (!this.userSentPosts.has(userId)) {
      this.userSentPosts.set(userId, new Set());
    }
    const userPosts = this.userSentPosts.get(userId);
    posts.forEach((post) => userPosts.add(post.post_id));
    //console.log(`Marking posts as sent for user ${userId}: ${Array.from(userPosts)}`);
  }

  clearSentPosts(userId: number): void {
    //console.log(`Clearing sent post IDs for user ${userId}`);
    this.userSentPosts.delete(userId);
  }

  clearAllSentPosts(): void {
    //console.log('Clearing sent post IDs for all users');
    this.userSentPosts.clear();
  }
}
