import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private online = true;

  constructor(
    private storage: StorageService,
    private http: HttpClient,
    private api: ApiService,
  ) {}

  async init() {
    const status = await Network.getStatus();
    this.online = status.connected;

    Network.addListener('networkStatusChange', async (s) => {
      const wasOffline = !this.online;
      this.online = s.connected;
      if (this.online && wasOffline) {
        await this.flushQueue();
      }
    });

    this.refreshKbCache();
  }

  async flushQueue() {
    const queue = await this.storage.getSyncQueue();
    for (const item of queue) {
      try {
        const base = environment.apiUrl;
        await firstValueFrom(
          this.http.request(item.action, `${base}/${item.endpoint}`, { body: item.payload }),
        );
        await this.storage.removeSyncItem(item.id);
      } catch (err: any) {
        if (err?.status >= 400 && err?.status < 500) {
          await this.storage.removeSyncItem(item.id);
        } else {
          await this.storage.incrementAttempts(item.id);
          const updated = (await this.storage.getSyncQueue()).find(i => i.id === item.id);
          if (updated && updated.attempts >= 3) {
            await this.storage.removeSyncItem(item.id);
          }
        }
      }
    }
  }

  async refreshKbCache() {
    if (!this.online) return;
    try {
      const entries = await firstValueFrom(this.api.get<any[]>('kb/offline-cache'));
      await this.storage.saveKbCache(entries);
    } catch {}
  }

  isOnline() { return this.online; }
}
