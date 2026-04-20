import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonSearchbar,
  IonFab, IonFabButton, IonIcon, IonRefresher, IonRefresherContent,
  IonInfiniteScroll, IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { ApiService } from '../../../core/services/api.service';
import { TfCardComponent } from '../../../shared/components/tf-card/tf-card.component';
import { TfBadgeComponent } from '../../../shared/components/tf-badge/tf-badge.component';
import { TfSkeletonComponent } from '../../../shared/components/tf-skeleton/tf-skeleton.component';

const STATUS_LABEL: Record<string,string> = { draft:'Borrador', in_progress:'En progreso', completed:'Completada', cancelled:'Cancelada' };

@Component({
  selector: 'app-wo-list',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonSearchbar,
    IonFab, IonFabButton, IonIcon, IonRefresher, IonRefresherContent,
    IonInfiniteScroll, IonInfiniteScrollContent,
    TfCardComponent, TfBadgeComponent, TfSkeletonComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Mis OTs</ion-title></ion-toolbar>
      <ion-toolbar>
        <ion-searchbar [(ngModel)]="query" (ionInput)="search()" placeholder="Buscar cliente o vehículo..." debounce="300" />
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)"><ion-refresher-content /></ion-refresher>
      <div class="tf-page-content">
        <ng-container *ngIf="!loading(); else skList">
          <tf-card *ngFor="let ot of ots()" style="cursor:pointer" (click)="router.navigate(['/ots', ot.id])">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <tf-badge [variant]="statusVariant(ot.status)">{{ STATUS_LABEL[ot.status] }}</tf-badge>
              <span style="font-size:11px;color:var(--tf-text-muted);">{{ ot.createdAt | date:'dd/MM/yy' }}</span>
            </div>
            <p style="font-weight:600;margin:0 0 4px;">{{ ot.clientName }}</p>
            <p style="font-size:13px;color:var(--tf-text-muted);margin:0;">{{ ot.vehicleBrand }} {{ ot.vehicleModel }} {{ ot.vehicleYear }} · {{ ot.vehiclePlate }}</p>
          </tf-card>
          <p *ngIf="ots().length === 0" style="text-align:center;color:var(--tf-text-muted);padding:40px 0;">Sin OTs aún</p>
        </ng-container>
        <ng-template #skList>
          <tf-card *ngFor="let _ of [1,2,3,4]"><tf-skeleton height="80px" /></tf-card>
        </ng-template>
      </div>
      <ion-infinite-scroll (ionInfinite)="loadMore($event)">
        <ion-infinite-scroll-content />
      </ion-infinite-scroll>
    </ion-content>
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="tf-fab" (click)="router.navigate(['/ots/new'])">
        <ion-icon name="add" />
      </ion-fab-button>
    </ion-fab>
  `,
})
export class WoListPage implements OnInit {
  query = '';
  loading = signal(true);
  ots = signal<any[]>([]);
  page = 1;
  hasMore = true;

  constructor(public router: Router, private api: ApiService) { addIcons({ add }); }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.page = 1;
    this.api.get<any>('work-orders', { page: 1, limit: 20 }).subscribe(r => {
      this.ots.set(r.items);
      this.hasMore = r.page < r.pages;
      this.loading.set(false);
    });
  }

  search() { this.load(); }

  refresh(ev: any) { this.load(); ev.target.complete(); }

  loadMore(ev: any) {
    if (!this.hasMore) { ev.target.complete(); return; }
    this.page++;
    this.api.get<any>('work-orders', { page: this.page, limit: 20 }).subscribe(r => {
      this.ots.update(prev => [...prev, ...r.items]);
      this.hasMore = r.page < r.pages;
      ev.target.complete();
    });
  }

  statusVariant(s: string): any {
    if (s === 'completed') return 'green';
    if (s === 'in_progress') return 'blue';
    if (s === 'cancelled') return 'red';
    return 'muted';
  }
}
