/**
 * Storage Service Abstraction
 * Manages local persistence for tokens, preferences, and session data
 */
class MemoryStorage {
  private memory = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.memory.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.memory.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.memory.delete(key);
  }

  async clear(): Promise<void> {
    this.memory.clear();
  }
}

// In-memory fallback; ready to be backed by @react-native-async-storage/async-storage
export const storageService = new MemoryStorage();
