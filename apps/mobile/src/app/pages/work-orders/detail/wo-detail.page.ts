import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonIcon, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shareSocialOutline, downloadOutline } from 'ionicons/icons';
import { ApiService } from '../../../core/services/api.service';
import { TfCardComponent } from '../../../shared/components/tf-card/tf-card.component';
import { TfBadgeComponent } from '../../../shared/components/tf-badge/tf-badge.component';
import { TfSkeletonComponent } from '../../../shared/components/tf-skeleton/tf-skeleton.component';
import { environment } from '@env/environment';

@Component({
  selector: 'app-wo-detail',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonButton, IonIcon, TfCardComponent, TfBadgeComponent, TfSkeletonComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button /></ion-buttons>
        <ion-title>Detalle OT</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" *ngIf="wo()?.status === 'completed'" (click)="share()">
            <ion-icon slot="icon-only" name="share-social-outline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="tf-page-content" *ngIf="wo(); else loading">
        <tf-card>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
            <tf-badge [variant]="wo()?.status === 'completed' ? 'green' : 'blue'">{{ wo()?.status }}</tf-badge>
            <span style="font-size:12px;color:var(--tf-text-muted);">{{ wo()?.createdAt | date:'dd/MM/yyyy' }}</span>
          </div>
          <p class="section-lbl">Cliente</p>
          <p class="field-val">{{ wo()?.clientName }}</p>
          <p class="section-lbl" style="margin-top:12px;">Vehículo</p>
          <p class="field-val">{{ wo()?.vehicleBrand }} {{ wo()?.vehicleModel }} {{ wo()?.vehicleYear }} · {{ wo()?.vehiclePlate }}</p>
          <p class="section-lbl" style="margin-top:12px;">Dispositivo GPS</p>
          <p class="field-val">{{ wo()?.deviceBrand }} {{ wo()?.deviceModel }}</p>
          <p style="font-size:12px;color:var(--tf-text-muted);">IMEI: {{ wo()?.deviceImei }}</p>
        </tf-card>

        <div *ngIf="wo()?.evidences?.length">
          <p class="tf-section-title">Evidencias ({{ wo()?.evidences?.length }})</p>
          <div class="evidence-grid">
            <img *ngFor="let ev of wo()?.evidences" [src]="ev.url" class="ev-img" />
          </div>
        </div>

        <ng-container *ngIf="wo()?.status === 'completed'">
          <ion-button expand="block" (click)="downloadPdf()">
            <ion-icon slot="start" name="download-outline" /> Descargar PDF
          </ion-button>
          <ion-button expand="block" fill="outline" (click)="share()">
            <ion-icon slot="start" name="share-social-outline" /> Compartir por WhatsApp
          </ion-button>
        </ng-container>
      </div>
      <ng-template #loading>
        <div class="tf-page-content"><tf-skeleton height="200px" /></div>
      </ng-template>
    </ion-content>
  `,
  styles: [`
    .section-lbl { font-size:11px;color:var(--tf-text-muted);margin:0 0 2px;text-transform:uppercase;letter-spacing:.05em; }
    .field-val   { font-size:15px;font-weight:500;margin:0; }
    .evidence-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
    .ev-img { width:100%;height:150px;object-fit:cover;border-radius:var(--tf-radius-sm); }
  `],
})
export class WoDetailPage implements OnInit {
  wo = signal<any>(null);

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private toast: ToastController,
  ) { addIcons({ shareSocialOutline, downloadOutline }); }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.api.get<any>(`work-orders/${id}`).subscribe(w => this.wo.set(w));
  }

  async share() {
    const slug = this.wo()?.slug;
    const url  = `${environment.apiUrl.replace('/api','')}ot/${slug}`;
    if (navigator.share) {
      await navigator.share({ title: 'Reporte de instalación GPS', url });
    } else {
      await navigator.clipboard.writeText(url);
      const t = await this.toast.create({ message: 'Link copiado', duration: 2000, color: 'success' });
      await t.present();
    }
  }

  downloadPdf() {
    const id = this.wo()?.id;
    window.open(`${environment.apiUrl}/work-orders/${id}/pdf`, '_blank');
  }
}
