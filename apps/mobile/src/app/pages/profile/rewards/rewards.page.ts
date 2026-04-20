import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonCard, IonCardContent, IonButton, IonBadge,
  IonSkeletonText, AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { giftOutline, trophyOutline, lockClosedOutline } from 'ionicons/icons';
import { ApiService } from '@core/services/api.service';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'digital' | 'physical' | 'discount';
  available: boolean;
}

const CATALOG: Reward[] = [
  { id: 'amazon50', name: 'Vale Amazon $50 MXN', description: 'Código digital para Amazon.com.mx', pointsCost: 500, type: 'digital', available: true },
  { id: 'amazon100', name: 'Vale Amazon $100 MXN', description: 'Código digital para Amazon.com.mx', pointsCost: 900, type: 'digital', available: true },
  { id: 'cap_tf', name: 'Gorra TechField', description: 'Gorra bordada edición limitada', pointsCost: 1200, type: 'physical', available: true },
  { id: 'shirt_tf', name: 'Playera TechField', description: 'Playera técnica premium con logo', pointsCost: 2000, type: 'physical', available: true },
  { id: 'discount20', name: '20% descuento suscripción', description: 'Un mes de suscripción con 20% off', pointsCost: 800, type: 'discount', available: true },
  { id: 'toolkit', name: 'Kit de herramientas GPS', description: 'Pelacables, multímetro, crimpadora', pointsCost: 3500, type: 'physical', available: false },
];

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonCard, IonCardContent, IonButton, IonBadge,
    IonSkeletonText,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/profile"></ion-back-button></ion-buttons>
        <ion-title>Canjear Puntos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="tf-page-content">
      <!-- Balance card -->
      <div style="background:linear-gradient(135deg,#00C47D,#00a066);padding:24px 20px;text-align:center;margin-bottom:16px;">
        <p style="color:rgba(255,255,255,0.8);font-size:13px;margin-bottom:4px;">Puntos disponibles</p>
        <h1 style="font-size:42px;font-weight:800;color:#fff;margin:0;">{{ points() | number }}</h1>
        <p style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:6px;">pts</p>
      </div>

      <!-- Catalog -->
      <div style="padding:0 16px;">
        <h3 style="font-size:13px;font-weight:600;color:var(--tf-green);margin-bottom:12px;">Catálogo de recompensas</h3>
      </div>

      <div style="padding:0 12px 32px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <ion-card
          *ngFor="let r of catalog"
          [style.opacity]="r.available ? '1' : '0.5'"
          style="margin:0;background:var(--tf-bg2);border-radius:14px;cursor:pointer;"
        >
          <ion-card-content style="padding:14px;">
            <ion-badge [color]="typeColor(r.type)" style="margin-bottom:8px;">{{ typeLabel(r.type) }}</ion-badge>
            <h3 style="font-size:13px;font-weight:700;color:#fff;margin:4px 0;">{{ r.name }}</h3>
            <p style="font-size:11px;color:var(--ion-color-medium);margin-bottom:10px;">{{ r.description }}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="color:var(--tf-green);font-weight:700;font-size:14px;">{{ r.pointsCost | number }} pts</span>
              <ion-button
                size="small"
                [disabled]="!r.available || points() < r.pointsCost || redeeming()"
                (click)="redeem(r)"
              >
                {{ r.available ? 'Canjear' : 'Agotado' }}
              </ion-button>
            </div>
            <p *ngIf="points() < r.pointsCost && r.available"
               style="font-size:10px;color:var(--ion-color-warning);margin-top:6px;">
              Te faltan {{ (r.pointsCost - points()) | number }} pts
            </p>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
})
export class RewardsPage implements OnInit {
  points = signal(0);
  redeeming = signal(false);
  catalog = CATALOG;

  constructor(
    private api: ApiService,
    private alert: AlertController,
    private toast: ToastController,
  ) {
    addIcons({ giftOutline, trophyOutline, lockClosedOutline });
  }

  async ngOnInit() {
    try {
      const data: any = await this.api.get('/gamification/me').toPromise();
      this.points.set(data?.totalPoints ?? 0);
    } catch {}
  }

  typeColor(type: string): string {
    return { digital: 'success', physical: 'primary', discount: 'warning' }[type] ?? 'medium';
  }

  typeLabel(type: string): string {
    return { digital: 'Digital', physical: 'Físico', discount: 'Descuento' }[type] ?? type;
  }

  async redeem(reward: Reward) {
    const a = await this.alert.create({
      header: 'Confirmar canje',
      message: `¿Canjear "${reward.name}" por ${reward.pointsCost.toLocaleString()} puntos?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', handler: () => this.doRedeem(reward) },
      ],
    });
    a.present();
  }

  private async doRedeem(reward: Reward) {
    this.redeeming.set(true);
    try {
      await this.api.post('/gamification/redeem', { rewardId: reward.id }).toPromise();
      this.points.update(p => p - reward.pointsCost);
      const t = await this.toast.create({
        message: '¡Canje exitoso! Recibirás instrucciones por WhatsApp.',
        duration: 3500, color: 'success',
      });
      t.present();
    } catch {
      const t = await this.toast.create({ message: 'Error al canjear. Intenta de nuevo.', duration: 2500, color: 'danger' });
      t.present();
    } finally {
      this.redeeming.set(false);
    }
  }
}
