import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonRefresher, IonRefresherContent,
  IonList, IonItem, IonLabel, IonBadge,
  AlertController, ToastController, RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  settingsOutline, logOutOutline, shareOutline, ribbonOutline,
  starOutline, peopleOutline, trophyOutline, checkmarkCircle,
} from 'ionicons/icons';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { TfScoreGaugeComponent } from '@shared/components/tf-score-gauge/tf-score-gauge.component';
import { TfLevelBarComponent } from '@shared/components/tf-level-bar/tf-level-bar.component';
import { TfAvatarComponent } from '@shared/components/tf-avatar/tf-avatar.component';
import { TfBadgeComponent } from '@shared/components/tf-badge/tf-badge.component';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  country: string;
  level: string;
  activityScore: number;
  totalPoints: number;
  referralCode: string;
  avatarUrl?: string;
  badges: Array<{ key: string; name: string; earnedAt: string }>;
  stats: { completedOts: number; approvedKb: number; referrals: number };
}

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonRefresher, IonRefresherContent,
    IonList, IonItem, IonLabel, IonBadge,
    TfScoreGaugeComponent, TfLevelBarComponent, TfAvatarComponent, TfBadgeComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mi Perfil</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="tf-page-content">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ng-container *ngIf="profile() as p">
        <!-- Avatar + name card -->
        <div style="background:var(--tf-bg2);padding:28px 20px 20px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
          <tf-avatar [name]="p.name" [url]="p.avatarUrl" size="80px" style="margin:0 auto 12px;display:block;"></tf-avatar>
          <h2 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 4px;">{{ p.name }}</h2>
          <p style="color:var(--ion-color-medium);font-size:13px;">{{ p.phone }} · {{ p.country }}</p>
          <tf-badge [level]="p.level" style="margin:8px 0;display:inline-block;"></tf-badge>
        </div>

        <!-- Score + Level -->
        <div style="padding:20px 16px;display:flex;gap:16px;align-items:center;background:var(--tf-bg2);margin-top:1px;">
          <tf-score-gauge [score]="p.activityScore" size="90"></tf-score-gauge>
          <div style="flex:1;">
            <p style="color:var(--ion-color-medium);font-size:12px;margin-bottom:4px;">Score de actividad</p>
            <p style="font-size:28px;font-weight:800;color:#fff;margin:0;">{{ p.activityScore }}</p>
            <p style="color:var(--ion-color-medium);font-size:12px;margin:4px 0 8px;">{{ p.totalPoints | number }} puntos totales</p>
            <tf-level-bar [level]="p.level" [score]="p.activityScore"></tf-level-bar>
          </div>
        </div>

        <!-- Stats row -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,0.05);margin-top:16px;">
          <div *ngFor="let stat of [
            {label:'OTs completadas', value: p.stats.completedOts, icon:'star-outline'},
            {label:'KB aprobados', value: p.stats.approvedKb, icon:'ribbon-outline'},
            {label:'Referidos', value: p.stats.referrals, icon:'people-outline'}
          ]" style="background:var(--tf-bg2);padding:16px;text-align:center;">
            <ion-icon [name]="stat.icon" style="color:var(--tf-green);font-size:22px;"></ion-icon>
            <p style="font-size:22px;font-weight:700;color:#fff;margin:4px 0 2px;">{{ stat.value }}</p>
            <p style="font-size:11px;color:var(--ion-color-medium);">{{ stat.label }}</p>
          </div>
        </div>

        <!-- Badges -->
        <div *ngIf="p.badges?.length" style="padding:20px 16px;">
          <h3 style="font-size:14px;font-weight:600;color:var(--tf-green);margin-bottom:12px;">
            <ion-icon name="trophy-outline" style="vertical-align:middle;margin-right:6px;"></ion-icon>
            Insignias ({{ p.badges.length }})
          </h3>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <div *ngFor="let badge of p.badges"
              style="background:var(--tf-bg2);border:1px solid rgba(0,196,125,0.3);border-radius:12px;padding:10px 14px;text-align:center;min-width:90px;">
              <ion-icon name="checkmark-circle" style="color:var(--tf-green);font-size:24px;display:block;margin:0 auto 6px;"></ion-icon>
              <p style="font-size:11px;color:#ccc;margin:0;">{{ badge.name }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <ion-list style="margin:8px 0;">
          <ion-item button (click)="router.navigate(['/profile/referrals'])">
            <ion-icon name="people-outline" slot="start" color="success"></ion-icon>
            <ion-label>Mis referidos</ion-label>
            <ion-badge slot="end" color="success">{{ p.stats.referrals }}</ion-badge>
          </ion-item>
          <ion-item button (click)="router.navigate(['/profile/rewards'])">
            <ion-icon name="trophy-outline" slot="start" color="success"></ion-icon>
            <ion-label>Canjear puntos</ion-label>
            <ion-badge slot="end" color="success">{{ p.totalPoints | number }}</ion-badge>
          </ion-item>
          <ion-item button (click)="shareReferral()">
            <ion-icon name="share-outline" slot="start" color="success"></ion-icon>
            <ion-label>
              Compartir código
              <p>{{ p.referralCode }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </ng-container>
    </ion-content>
  `,
})
export class ProfileViewPage implements OnInit {
  profile = signal<UserProfile | null>(null);

  constructor(
    public router: Router,
    private api: ApiService,
    public auth: AuthService,
    private alert: AlertController,
    private toast: ToastController,
  ) {
    addIcons({ settingsOutline, logOutOutline, shareOutline, ribbonOutline, starOutline, peopleOutline, trophyOutline, checkmarkCircle });
  }

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      const [me, gamification]: [any, any] = await Promise.all([
        this.api.get('/users/me').toPromise(),
        this.api.get('/gamification/me').toPromise(),
      ]);
      this.profile.set({
        ...me,
        activityScore: gamification.activityScore,
        totalPoints: gamification.totalPoints,
        badges: gamification.badges ?? [],
        stats: gamification.stats ?? { completedOts: 0, approvedKb: 0, referrals: 0 },
      });
    } catch {}
  }

  async refresh(event: RefresherCustomEvent) {
    await this.loadProfile();
    event.target.complete();
  }

  async shareReferral() {
    const code = this.profile()?.referralCode;
    if (!code) return;
    if (navigator.share) {
      navigator.share({ title: 'Únete a TechField GPS', text: `Usa mi código ${code} al registrarte en TechField GPS y ambos ganamos puntos.` });
    } else {
      navigator.clipboard.writeText(code);
      const t = await this.toast.create({ message: `Código ${code} copiado`, duration: 2000, color: 'success' });
      t.present();
    }
  }

  async logout() {
    const a = await this.alert.create({
      header: 'Cerrar sesión',
      message: '¿Seguro que deseas salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salir', handler: () => this.auth.logout() },
      ],
    });
    a.present();
  }
}
