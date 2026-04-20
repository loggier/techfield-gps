import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonList, IonItem, IonLabel, IonBadge,
  IonCard, IonCardContent, IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, timeOutline, peopleOutline } from 'ionicons/icons';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';

interface Referral {
  id: string;
  referee: { name: string; level: string };
  status: string;
  milestone: number;
  bonusAwarded: boolean;
  createdAt: string;
}

const MILESTONES = [
  { ots: 1, label: 'Primera OT completada', points: 50 },
  { ots: 5, label: '5 OTs completadas', points: 100 },
  { ots: 10, label: '10 OTs completadas', points: 200 },
  { ots: 20, label: 'Nivel Verificado alcanzado', points: 300 },
];

@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonList, IonItem, IonLabel, IonBadge,
    IonCard, IonCardContent, IonSkeletonText,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/profile"></ion-back-button></ion-buttons>
        <ion-title>Mis Referidos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="tf-page-content">
      <!-- Referral code card -->
      <ion-card style="margin:16px;background:linear-gradient(135deg,#00C47D22,#0D1320);border:1px solid var(--tf-green);border-radius:16px;">
        <ion-card-content style="text-align:center;padding:24px;">
          <ion-icon name="people-outline" style="font-size:36px;color:var(--tf-green);display:block;margin:0 auto 12px;"></ion-icon>
          <p style="color:var(--ion-color-medium);font-size:13px;">Tu código de referido</p>
          <h2 style="font-size:28px;font-weight:800;color:#fff;letter-spacing:4px;margin:8px 0;">
            {{ referralCode() }}
          </h2>
          <p style="color:var(--ion-color-medium);font-size:12px;">
            Gana puntos cuando tus referidos completan OTs
          </p>
        </ion-card-content>
      </ion-card>

      <!-- Milestone guide -->
      <div style="padding:0 16px 16px;">
        <h3 style="font-size:13px;font-weight:600;color:var(--tf-green);margin-bottom:12px;">Bonos por hito</h3>
        <div *ngFor="let m of milestones" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="color:#ccc;font-size:13px;">{{ m.label }}</p>
          <ion-badge color="success">+{{ m.points }} pts</ion-badge>
        </div>
      </div>

      <!-- Referral list -->
      <div style="padding:0 16px;">
        <h3 style="font-size:13px;font-weight:600;color:var(--tf-green);margin-bottom:8px;">
          Referidos ({{ referrals().length }})
        </h3>
      </div>

      <ng-container *ngIf="loading()">
        <ion-skeleton-text *ngFor="let i of [1,2,3]" animated style="height:60px;margin:4px 16px;border-radius:8px;"></ion-skeleton-text>
      </ng-container>

      <ion-list *ngIf="!loading()">
        <ion-item *ngFor="let r of referrals()">
          <ion-icon
            [name]="r.status === 'active' ? 'checkmark-circle' : 'time-outline'"
            [color]="r.status === 'active' ? 'success' : 'medium'"
            slot="start"
          ></ion-icon>
          <ion-label>
            <h3>{{ r.referee.name }}</h3>
            <p style="font-size:12px;color:var(--ion-color-medium);">
              Hito {{ r.milestone }} · {{ r.status === 'active' ? 'Activo' : 'Pendiente' }}
            </p>
          </ion-label>
          <ion-badge slot="end" [color]="r.bonusAwarded ? 'success' : 'medium'">
            {{ r.bonusAwarded ? 'Cobrado' : 'Pendiente' }}
          </ion-badge>
        </ion-item>
        <ion-item *ngIf="referrals().length === 0">
          <ion-label style="text-align:center;padding:24px 0;color:var(--ion-color-medium);">
            Aún no tienes referidos. ¡Comparte tu código!
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class ReferralsPage implements OnInit {
  referrals = signal<Referral[]>([]);
  referralCode = signal('');
  loading = signal(true);
  milestones = MILESTONES;

  constructor(private api: ApiService, private auth: AuthService) {
    addIcons({ checkmarkCircle, timeOutline, peopleOutline });
  }

  async ngOnInit() {
    try {
      const [me, refs]: [any, any] = await Promise.all([
        this.api.get('/users/me').toPromise(),
        this.api.get('/referrals/my').toPromise(),
      ]);
      this.referralCode.set(me?.referralCode ?? '');
      this.referrals.set(Array.isArray(refs) ? refs : refs?.items ?? []);
    } finally {
      this.loading.set(false);
    }
  }
}
