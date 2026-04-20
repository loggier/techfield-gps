import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonButton, IonIcon, IonSkeletonText,
  IonBadge, IonCard, IonCardContent, IonItem, IonLabel,
  ToastController, AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  thumbsUpOutline, thumbsDownOutline, checkmarkCircleOutline,
  starOutline, star, shareOutline, cloudDownloadOutline,
} from 'ionicons/icons';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';

interface KbEntry {
  id: string;
  title: string;
  type: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  deviceBrand?: string;
  deviceModel?: string;
  country: string;
  ratingAvg: number;
  voteCount: number;
  useCount: number;
  status: string;
  content: Record<string, unknown>;
  tags?: string[];
  author?: { name: string; level: string };
}

@Component({
  selector: 'app-kb-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonButton, IonIcon, IonSkeletonText,
    IonBadge, IonCard, IonCardContent, IonItem, IonLabel,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/kb"></ion-back-button></ion-buttons>
        <ion-title>Detalle KB</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="registerUse()">
            <ion-icon name="cloud-download-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="tf-page-content">
      <ng-container *ngIf="loading()">
        <ion-skeleton-text animated style="height:200px;margin:16px;border-radius:12px;"></ion-skeleton-text>
        <ion-skeleton-text animated style="height:100px;margin:16px;border-radius:12px;"></ion-skeleton-text>
      </ng-container>

      <ng-container *ngIf="!loading() && entry()">
        <!-- Header card -->
        <ion-card style="margin:16px;background:var(--tf-bg2);border-radius:16px;">
          <ion-card-content>
            <ion-badge color="success" style="margin-bottom:8px;">{{ typeLabel(entry()!.type) }}</ion-badge>
            <h1 style="font-size:18px;font-weight:700;color:#fff;margin-bottom:8px;">{{ entry()!.title }}</h1>
            <p style="color:var(--ion-color-medium);font-size:13px;">
              {{ entry()!.vehicleBrand }} {{ entry()!.vehicleModel }}
              <span *ngIf="entry()!.vehicleYear"> {{ entry()!.vehicleYear }}</span>
            </p>
            <p style="color:var(--ion-color-medium);font-size:13px;">
              Dispositivo: {{ entry()!.deviceBrand }} {{ entry()!.deviceModel }}
            </p>
            <div style="display:flex;gap:16px;margin-top:12px;font-size:13px;color:var(--tf-green);">
              <span>★ {{ entry()!.ratingAvg | number:'1.1-1' }}</span>
              <span>{{ entry()!.voteCount }} votos</span>
              <span>{{ entry()!.useCount }} usos</span>
            </div>
            <p style="font-size:12px;color:var(--ion-color-medium);margin-top:8px;">
              Por {{ entry()!.author?.name }} · {{ entry()!.author?.level }}
            </p>
          </ion-card-content>
        </ion-card>

        <!-- Content sections -->
        <ng-container *ngFor="let section of contentSections()">
          <ion-card style="margin:8px 16px;background:var(--tf-bg2);border-radius:12px;">
            <ion-card-content>
              <h3 style="font-weight:600;color:var(--tf-green);margin-bottom:8px;text-transform:capitalize;">
                {{ formatKey(section.key) }}
              </h3>
              <ng-container *ngIf="isArray(section.value)">
                <p *ngFor="let step of asArray(section.value); let i = index"
                   style="color:#ccc;margin-bottom:6px;">
                  <span style="color:var(--tf-green);font-weight:600;">{{ i+1 }}.</span> {{ step }}
                </p>
              </ng-container>
              <p *ngIf="!isArray(section.value)" style="color:#ccc;">{{ section.value }}</p>
            </ion-card-content>
          </ion-card>
        </ng-container>

        <!-- Vote section -->
        <ion-card style="margin:8px 16px 32px;background:var(--tf-bg2);border-radius:12px;">
          <ion-card-content>
            <p style="color:#ccc;margin-bottom:12px;font-size:14px;">¿Te fue útil esta entrada?</p>
            <div style="display:flex;gap:12px;align-items:center;">
              <ion-button fill="outline" color="success" (click)="vote(true, 5)">
                <ion-icon name="thumbs-up-outline" slot="start"></ion-icon> Útil
              </ion-button>
              <ion-button fill="outline" color="medium" (click)="vote(false, 2)">
                <ion-icon name="thumbs-down-outline" slot="start"></ion-icon> No útil
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </ng-container>
    </ion-content>
  `,
})
export class KbDetailPage implements OnInit {
  entry = signal<KbEntry | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private toast: ToastController,
    private alert: AlertController,
  ) {
    addIcons({ thumbsUpOutline, thumbsDownOutline, checkmarkCircleOutline, starOutline, star, shareOutline, cloudDownloadOutline });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      const data: any = await this.api.get(`/kb/${id}`).toPromise();
      this.entry.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  contentSections() {
    const content = this.entry()?.content ?? {};
    return Object.entries(content).map(([key, value]) => ({ key, value }));
  }

  isArray(value: unknown): boolean {
    return Array.isArray(value);
  }

  asArray(value: unknown): unknown[] {
    return value as unknown[];
  }

  formatKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1');
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      motor_cut: 'Corte de motor', apn: 'APN',
      installation: 'Instalación', known_issue: 'Problema', config: 'Config',
    };
    return map[type] ?? type;
  }

  async registerUse() {
    const id = this.entry()?.id;
    if (!id) return;
    this.api.post(`/kb/${id}/use`, {}).subscribe();
    const t = await this.toast.create({ message: 'Marcado como usado', duration: 1500, color: 'success' });
    t.present();
  }

  async vote(isUseful: boolean, rating: number) {
    const id = this.entry()?.id;
    if (!id) return;
    try {
      const updated: any = await this.api.post(`/kb/${id}/vote`, { isUseful, rating }).toPromise();
      this.entry.set(updated);
      const t = await this.toast.create({ message: 'Voto registrado', duration: 1500, color: 'success' });
      t.present();
    } catch {
      const t = await this.toast.create({ message: 'No se pudo registrar el voto', duration: 2000, color: 'danger' });
      t.present();
    }
  }
}
