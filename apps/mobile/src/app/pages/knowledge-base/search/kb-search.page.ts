import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonList, IonItem, IonLabel, IonBadge, IonChip,
  IonInfiniteScroll, IonInfiniteScrollContent, IonSkeletonText,
  IonSelect, IonSelectOption, IonButton, IonIcon,
  InfiniteScrollCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookOutline, starOutline, thumbsUpOutline } from 'ionicons/icons';
import { ApiService } from '@core/services/api.service';
import { StorageService } from '@core/services/storage.service';
import { TfSkeletonComponent } from '@shared/components/tf-skeleton/tf-skeleton.component';

interface KbEntry {
  id: string;
  title: string;
  type: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  deviceBrand?: string;
  deviceModel?: string;
  country: string;
  ratingAvg: number;
  voteCount: number;
  useCount: number;
  tags?: string[];
}

@Component({
  selector: 'app-kb-search',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
    IonList, IonItem, IonLabel, IonBadge, IonChip,
    IonInfiniteScroll, IonInfiniteScrollContent, IonSkeletonText,
    IonSelect, IonSelectOption, IonButton, IonIcon,
    TfSkeletonComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Base de Conocimiento</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          [(ngModel)]="query"
          (ionInput)="onSearch()"
          placeholder="Buscar por título, marca, modelo..."
          debounce="400"
        ></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div style="display:flex;gap:8px;padding:0 12px;overflow-x:auto;">
          <ion-chip
            *ngFor="let t of types"
            [color]="selectedType() === t.value ? 'success' : 'medium'"
            (click)="setType(t.value)"
          >{{ t.label }}</ion-chip>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="tf-page-content">
      <ng-container *ngIf="loading()">
        <tf-skeleton *ngFor="let i of [1,2,3,4,5]" height="72px" style="margin:8px 16px;"></tf-skeleton>
      </ng-container>

      <ion-list *ngIf="!loading()">
        <ion-item
          *ngFor="let entry of entries()"
          button
          detail
          (click)="open(entry.id)"
        >
          <ion-label>
            <h2>{{ entry.title }}</h2>
            <p>
              <ion-badge color="success" style="margin-right:4px;">{{ entry.type }}</ion-badge>
              <span *ngIf="entry.vehicleBrand">{{ entry.vehicleBrand }} {{ entry.vehicleModel }}</span>
              <span *ngIf="!entry.vehicleBrand && entry.deviceBrand">{{ entry.deviceBrand }} {{ entry.deviceModel }}</span>
            </p>
            <p style="color:var(--ion-color-medium);font-size:12px;">
              <ion-icon name="star-outline" style="vertical-align:middle;"></ion-icon>
              {{ entry.ratingAvg | number:'1.1-1' }} &nbsp;
              <ion-icon name="thumbs-up-outline" style="vertical-align:middle;"></ion-icon>
              {{ entry.voteCount }} votos &nbsp; Usos: {{ entry.useCount }}
            </p>
          </ion-label>
        </ion-item>
        <ion-item *ngIf="entries().length === 0 && !loading()">
          <ion-label style="text-align:center;padding:32px 0;color:var(--ion-color-medium);">
            <ion-icon name="book-outline" style="font-size:48px;display:block;margin:0 auto 12px;"></ion-icon>
            No se encontraron resultados
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-infinite-scroll (ionInfinite)="loadMore($event)" [disabled]="!hasMore()">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  `,
})
export class KbSearchPage implements OnInit {
  query = '';
  selectedType = signal('');
  entries = signal<KbEntry[]>([]);
  loading = signal(true);
  hasMore = signal(false);
  page = 1;

  types = [
    { label: 'Todos', value: '' },
    { label: 'Corte de motor', value: 'motor_cut' },
    { label: 'APN', value: 'apn' },
    { label: 'Instalación', value: 'installation' },
    { label: 'Problema conocido', value: 'known_issue' },
    { label: 'Configuración', value: 'config' },
  ];

  constructor(private api: ApiService, private storage: StorageService, private router: Router) {
    addIcons({ bookOutline, starOutline, thumbsUpOutline });
  }

  async ngOnInit() {
    await this.loadEntries(true);
  }

  onSearch() {
    this.loadEntries(true);
  }

  setType(value: string) {
    this.selectedType.set(value);
    this.loadEntries(true);
  }

  open(id: string) {
    this.router.navigate(['/kb', id]);
  }

  async loadEntries(reset = false) {
    if (reset) { this.page = 1; this.loading.set(true); }

    try {
      const params: Record<string, string | number> = { page: this.page, limit: 20 };
      if (this.query) params['q'] = this.query;
      if (this.selectedType()) params['type'] = this.selectedType();

      const res: any = await this.api.get('/kb', params).toPromise();
      const newItems: KbEntry[] = res?.items ?? [];

      this.entries.set(reset ? newItems : [...this.entries(), ...newItems]);
      this.hasMore.set(this.page < (res?.pages ?? 1));
    } catch {
      // offline: load from cache
      const cache = await this.storage.getKbCache();
      if (reset && cache.length) this.entries.set(cache as unknown as KbEntry[]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadMore(event: InfiniteScrollCustomEvent) {
    this.page++;
    await this.loadEntries(false);
    event.target.complete();
  }
}
