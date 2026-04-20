import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonButtons, IonButton,
  IonFab, IonFabButton, IonIcon, IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, logOutOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TfCardComponent } from '../../shared/components/tf-card/tf-card.component';
import { TfBadgeComponent } from '../../shared/components/tf-badge/tf-badge.component';
import { TfScoreGaugeComponent } from '../../shared/components/tf-score-gauge/tf-score-gauge.component';
import { TfLevelBarComponent } from '../../shared/components/tf-level-bar/tf-level-bar.component';
import { TfAvatarComponent } from '../../shared/components/tf-avatar/tf-avatar.component';
import { TfSkeletonComponent } from '../../shared/components/tf-skeleton/tf-skeleton.component';

const LEVEL_ORDER = ['novato','verificado','pro','senior','elite'];
const LEVEL_LABELS: Record<string,string> = { novato:'Novato', verificado:'Verificado', pro:'Pro', senior:'Senior', elite:'Elite' };
const LEVEL_MINS:  Record<string,number>  = { novato:0, verificado:50, pro:200, senior:500, elite:1000 };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonButtons, IonButton,
    IonFab, IonFabButton, IonIcon, IonRefresher, IonRefresherContent,
    TfCardComponent, TfBadgeComponent, TfScoreGaugeComponent,
    TfLevelBarComponent, TfAvatarComponent, TfSkeletonComponent,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="header-inner">
          <div class="header-left">
            <tf-avatar [name]="user()?.name ?? ''" [src]="user()?.avatarUrl" [size]="38" />
            <div>
              <p class="greet">Hola, {{ (user()?.name ?? 'Técnico').split(' ')[0] }} 👋</p>
              <tf-badge [variant]="levelVariant()">{{ LEVEL_LABELS[user()?.level ?? 'novato'] }}</tf-badge>
            </div>
          </div>
          <ion-button fill="clear" size="small" (click)="logout()">
            <ion-icon slot="icon-only" name="log-out-outline" style="color:var(--tf-text-muted);" />
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="load($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div class="tf-page-content">

        <!-- Score gauge + level bar -->
        <tf-card *ngIf="!loading(); else skBlock">
          <tf-score-gauge [score]="stats()?.activityScore ?? 0" />
          <div style="margin-top:20px;">
            <tf-level-bar
              [levelLabel]="LEVEL_LABELS[user()?.level ?? 'novato']"
              [nextLabel]="nextLevelLabel()"
              [percent]="levelPercent()"
              [pointsToNext]="stats()?.pointsToNextLevel ?? 0"
            />
          </div>
        </tf-card>
        <ng-template #skBlock>
          <tf-card><tf-skeleton height="200px" /></tf-card>
        </ng-template>

        <!-- Stats grid -->
        <div class="stats-grid" *ngIf="!loading()">
          <tf-card class="stat-cell">
            <p class="stat-val">{{ woStats()?.thisMonth ?? 0 }}</p>
            <p class="stat-lbl">OTs este mes</p>
          </tf-card>
          <tf-card class="stat-cell">
            <p class="stat-val">{{ stats()?.totalPoints ?? 0 }}</p>
            <p class="stat-lbl">Puntos totales</p>
          </tf-card>
          <tf-card class="stat-cell">
            <p class="stat-val">{{ ratingAvg() }}</p>
            <p class="stat-lbl">Rating promedio</p>
          </tf-card>
          <tf-card class="stat-cell">
            <p class="stat-val">{{ referralCount() }}</p>
            <p class="stat-lbl">Referidos</p>
          </tf-card>
        </div>

        <!-- Hoy -->
        <div *ngIf="todayOts().length > 0">
          <p class="tf-section-title">Hoy</p>
          <div class="ot-scroll">
            <tf-card *ngFor="let ot of todayOts()" class="ot-chip" (click)="router.navigate(['/ots', ot.id])">
              <tf-badge [variant]="statusVariant(ot.status)">{{ ot.status }}</tf-badge>
              <p class="ot-chip-client">{{ ot.clientName }}</p>
              <p class="ot-chip-vehicle">{{ ot.vehicleBrand }} {{ ot.vehicleModel }}</p>
            </tf-card>
          </div>
        </div>

      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button class="tf-fab" (click)="router.navigate(['/ots/new'])">
          <ion-icon name="add" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .header-inner { display:flex; justify-content:space-between; align-items:center; padding:8px 16px; }
    .header-left  { display:flex; align-items:center; gap:12px; }
    .greet { margin:0 0 4px; font-size:15px; font-weight:600; }
    .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .stat-cell  { text-align:center; }
    .stat-val   { font-size:28px; font-weight:700; color:var(--tf-green); margin:0 0 4px; }
    .stat-lbl   { font-size:11px; color:var(--tf-text-muted); margin:0; }
    .ot-scroll  { display:flex; gap:12px; overflow-x:auto; padding-bottom:4px; }
    .ot-chip    { min-width:160px; flex-shrink:0; cursor:pointer; display:flex; flex-direction:column; gap:6px; }
    .ot-chip-client  { font-weight:600; font-size:14px; margin:0; }
    .ot-chip-vehicle { font-size:12px; color:var(--tf-text-muted); margin:0; }
  `],
})
export class HomePage implements OnInit {
  readonly LEVEL_LABELS = LEVEL_LABELS;
  user = this.auth.user;
  loading = signal(true);
  stats   = signal<any>(null);
  woStats = signal<any>(null);
  todayOts = signal<any[]>([]);

  constructor(
    public router: Router,
    private api: ApiService,
    public auth: AuthService,
  ) { addIcons({ add, logOutOutline }); }

  ngOnInit() { this.load(); }

  async load(event?: any) {
    this.loading.set(true);
    this.api.get<any>('gamification/me').subscribe(s => this.stats.set(s));
    this.api.get<any>('work-orders/stats').subscribe(s => this.woStats.set(s));
    this.api.get<any>('work-orders', { limit: 5, dateFrom: new Date().toISOString().split('T')[0] }).subscribe(r => {
      this.todayOts.set(r.items ?? []);
      this.loading.set(false);
      event?.target?.complete();
    });
    this.api.get<any>('users/me/referrals').subscribe(r => this._referralCount.set(r.stats?.active ?? 0));
  }

  private _referralCount = signal(0);
  referralCount() { return this._referralCount(); }

  ratingAvg() {
    const s = this.woStats();
    return s?.ratingAvg ? Number(s.ratingAvg).toFixed(1) : '—';
  }

  levelVariant(): any {
    const lvl = this.user()?.level;
    if (lvl === 'elite' || lvl === 'senior') return 'purple';
    if (lvl === 'pro') return 'blue';
    if (lvl === 'verificado') return 'green';
    return 'muted';
  }

  nextLevelLabel() {
    const lvl = this.user()?.level ?? 'novato';
    const idx = LEVEL_ORDER.indexOf(lvl);
    return idx < LEVEL_ORDER.length - 1 ? LEVEL_LABELS[LEVEL_ORDER[idx + 1]] : '';
  }

  levelPercent() {
    const pts = this.stats()?.totalPoints ?? 0;
    const lvl = this.user()?.level ?? 'novato';
    const idx = LEVEL_ORDER.indexOf(lvl);
    if (idx >= LEVEL_ORDER.length - 1) return 100;
    const min  = LEVEL_MINS[lvl];
    const next = LEVEL_MINS[LEVEL_ORDER[idx + 1]];
    return Math.round(((pts - min) / (next - min)) * 100);
  }

  statusVariant(s: string): any {
    if (s === 'completed') return 'green';
    if (s === 'in_progress') return 'blue';
    if (s === 'cancelled') return 'red';
    return 'muted';
  }

  logout() { this.auth.logout().subscribe(); }
}
