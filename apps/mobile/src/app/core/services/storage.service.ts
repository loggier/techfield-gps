import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface SyncQueueItem {
  id: string;
  action: 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  payload?: any;
  createdAt: string;
  attempts: number;
}

const SYNC_KEY   = 'tf_sync_queue';
const KB_CACHE   = 'tf_kb_cache';
const WO_DRAFT   = 'tf_wo_draft';

@Injectable({ providedIn: 'root' })
export class StorageService {

  // ── Sync queue ─────────────────────────────────────────────────────────────

  async enqueueSyncItem(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts'>) {
    const queue = await this.getSyncQueue();
    queue.push({
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      attempts: 0,
    });
    await Preferences.set({ key: SYNC_KEY, value: JSON.stringify(queue) });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const { value } = await Preferences.get({ key: SYNC_KEY });
    return value ? JSON.parse(value) : [];
  }

  async removeSyncItem(id: string) {
    const queue = (await this.getSyncQueue()).filter(i => i.id !== id);
    await Preferences.set({ key: SYNC_KEY, value: JSON.stringify(queue) });
  }

  async incrementAttempts(id: string) {
    const queue = await this.getSyncQueue();
    const item = queue.find(i => i.id === id);
    if (item) {
      item.attempts++;
      await Preferences.set({ key: SYNC_KEY, value: JSON.stringify(queue) });
    }
  }

  // ── KB offline cache ───────────────────────────────────────────────────────

  async saveKbCache(entries: any[]) {
    await Preferences.set({ key: KB_CACHE, value: JSON.stringify(entries) });
  }

  async getKbCache(): Promise<any[]> {
    const { value } = await Preferences.get({ key: KB_CACHE });
    return value ? JSON.parse(value) : [];
  }

  // ── WO draft ───────────────────────────────────────────────────────────────

  async saveWoDraft(draft: any) {
    await Preferences.set({ key: WO_DRAFT, value: JSON.stringify(draft) });
  }

  async getWoDraft(): Promise<any | null> {
    const { value } = await Preferences.get({ key: WO_DRAFT });
    return value ? JSON.parse(value) : null;
  }

  async clearWoDraft() {
    await Preferences.remove({ key: WO_DRAFT });
  }
}
