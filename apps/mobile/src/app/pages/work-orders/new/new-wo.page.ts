import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonInput, IonSelect, IonSelectOption, IonItem, IonLabel,
  IonSegment, IonSegmentButton, IonTextarea, IonProgressBar,
  LoadingController, ToastController, AlertController,
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import SignaturePad from 'signature_pad';
import { ApiService } from '../../../core/services/api.service';
import { StorageService } from '../../../core/services/storage.service';

const STEPS = ['Trabajo', 'Dispositivo', 'Evidencias', 'Firma'];

@Component({
  selector: 'app-new-wo',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonButton, IonInput, IonSelect, IonSelectOption, IonItem, IonLabel,
    IonSegment, IonSegmentButton, IonTextarea, IonProgressBar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button /></ion-buttons>
        <ion-title>Nueva OT — Paso {{ step() + 1 }}/4</ion-title>
      </ion-toolbar>
      <ion-progress-bar [value]="(step() + 1) / 4" color="primary" />
    </ion-header>

    <ion-content class="ion-padding">

      <!-- Step 1: Work data -->
      <div *ngIf="step() === 0">
        <h3 class="step-title">Datos del trabajo</h3>
        <div class="form-grid">
          <ion-item>
            <ion-label>Tipo de servicio</ion-label>
            <ion-select [(ngModel)]="form.type" interface="action-sheet">
              <ion-select-option value="installation">Instalación</ion-select-option>
              <ion-select-option value="revision">Revisión</ion-select-option>
              <ion-select-option value="support">Soporte</ion-select-option>
              <ion-select-option value="config">Configuración</ion-select-option>
              <ion-select-option value="motor_cut">Corte de motor</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-input [(ngModel)]="form.clientName" label="Nombre del cliente" labelPlacement="floating" fill="outline" />
          <ion-input [(ngModel)]="form.clientPhone" label="Teléfono cliente" labelPlacement="floating" fill="outline" type="tel" />
          <ion-input [(ngModel)]="form.vehicleBrand" label="Marca vehículo" labelPlacement="floating" fill="outline" />
          <ion-input [(ngModel)]="form.vehicleModel" label="Modelo vehículo" labelPlacement="floating" fill="outline" />
          <ion-input [(ngModel)]="form.vehicleYear" label="Año" labelPlacement="floating" fill="outline" type="number" />
          <ion-input [(ngModel)]="form.vehiclePlate" label="Placa" labelPlacement="floating" fill="outline" />
          <ion-input [(ngModel)]="form.vehicleColor" label="Color (opcional)" labelPlacement="floating" fill="outline" />
          <ion-textarea [(ngModel)]="form.notes" label="Notas técnicas (opcional)" labelPlacement="floating" fill="outline" rows="3" />
        </div>
      </div>

      <!-- Step 2: Device -->
      <div *ngIf="step() === 1">
        <h3 class="step-title">Dispositivo GPS</h3>
        <div class="form-grid">
          <ion-input [(ngModel)]="form.deviceBrand" label="Marca dispositivo" labelPlacement="floating" fill="outline" />
          <ion-input [(ngModel)]="form.deviceModel" label="Modelo dispositivo" labelPlacement="floating" fill="outline" />
          <ion-input [(ngModel)]="form.deviceImei" label="IMEI (15 dígitos)" labelPlacement="floating" fill="outline" type="number" maxlength="15" />
          <ion-input [(ngModel)]="form.deviceSim" label="Número SIM (opcional)" labelPlacement="floating" fill="outline" />
          <ion-item>
            <ion-label>Operadora</ion-label>
            <ion-select [(ngModel)]="form.deviceOperator" interface="action-sheet">
              <ion-select-option *ngFor="let op of operators" [value]="op">{{ op }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-input [(ngModel)]="form.devicePlatform" label="Plataforma GPS (opcional)" labelPlacement="floating" fill="outline" />
        </div>
      </div>

      <!-- Step 3: Evidences -->
      <div *ngIf="step() === 2">
        <h3 class="step-title">Evidencias fotográficas</h3>
        <p style="color:var(--tf-text-muted);font-size:13px;margin-bottom:16px;">Mínimo 2 fotos requeridas para cerrar la OT</p>
        <div class="evidence-slots">
          <div *ngFor="let slot of evidenceSlots" class="ev-slot" (click)="capturePhoto(slot.stage)">
            <ng-container *ngIf="getPhoto(slot.stage); else emptySlot">
              <img [src]="getPhoto(slot.stage)" class="ev-preview" />
              <p class="ev-label">{{ slot.label }} ✓</p>
            </ng-container>
            <ng-template #emptySlot>
              <div class="ev-empty">
                <span style="font-size:32px;">📷</span>
                <p class="ev-label">{{ slot.label }}</p>
                <tf-badge *ngIf="slot.required" variant="amber">Requerida</tf-badge>
              </div>
            </ng-template>
          </div>
        </div>
        <p style="margin-top:16px;font-size:13px;color:var(--tf-green);">
          {{ photoCount() }}/2 fotos requeridas {{ photoCount() >= 2 ? '✓' : '' }}
        </p>
      </div>

      <!-- Step 4: Signature -->
      <div *ngIf="step() === 3">
        <h3 class="step-title">Firma del cliente</h3>
        <p style="color:var(--tf-text-muted);font-size:13px;margin-bottom:16px;">Pide al cliente que firme en pantalla</p>
        <div class="sig-box">
          <canvas #sigCanvas class="sig-canvas"></canvas>
        </div>
        <div style="display:flex;gap:12px;margin-top:12px;">
          <ion-button fill="outline" expand="block" (click)="clearSignature()">Limpiar</ion-button>
          <ion-button expand="block" (click)="completeOt()">✓ Completar OT</ion-button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="nav-row">
        <ion-button *ngIf="step() > 0" fill="outline" (click)="prev()">← Atrás</ion-button>
        <ion-button *ngIf="step() < 3" expand="block" (click)="next()" [disabled]="step() === 2 && photoCount() < 2">
          Continuar →
        </ion-button>
      </div>

    </ion-content>
  `,
  styles: [`
    .step-title { font-size:18px;font-weight:600;margin:0 0 20px; }
    .form-grid  { display:flex;flex-direction:column;gap:12px; }
    .nav-row    { display:flex;gap:12px;margin-top:24px; }
    .evidence-slots { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
    .ev-slot  { border:1px dashed var(--tf-border);border-radius:var(--tf-radius-sm);min-height:140px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-direction:column;gap:6px;padding:12px; }
    .ev-empty { display:flex;flex-direction:column;align-items:center;gap:4px; }
    .ev-preview { width:100%;height:120px;object-fit:cover;border-radius:var(--tf-radius-sm); }
    .ev-label   { font-size:12px;color:var(--tf-text-muted);margin:0;text-align:center; }
    .sig-box { border:1px solid var(--tf-border);border-radius:var(--tf-radius-sm);background:white;overflow:hidden; }
    .sig-canvas { width:100%;height:220px;touch-action:none; }
  `],
})
export class NewWoPage {
  @ViewChild('sigCanvas') sigCanvasRef!: ElementRef<HTMLCanvasElement>;
  private sigPad: SignaturePad | null = null;
  private woId: string | null = null;

  step = signal(0);
  operators = ['Telcel', 'AT&T', 'Movistar', 'Claro', 'Tigo', 'Otro'];
  photos: Record<string, string> = {};

  evidenceSlots = [
    { stage: 'before',  label: 'Antes',      required: true },
    { stage: 'during',  label: 'Durante',     required: false },
    { stage: 'after',   label: 'Después',     required: true },
    { stage: 'device',  label: 'Dispositivo', required: false },
  ];

  form = {
    type: 'installation', clientName: '', clientPhone: '',
    vehicleBrand: '', vehicleModel: '', vehicleYear: new Date().getFullYear(),
    vehiclePlate: '', vehicleColor: '', notes: '',
    deviceBrand: '', deviceModel: '', deviceImei: '',
    deviceSim: '', deviceOperator: 'Telcel', devicePlatform: '',
  };

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private router: Router,
    private loading: LoadingController,
    private toast: ToastController,
    private alert: AlertController,
  ) {}

  async next() {
    if (this.step() === 0) {
      await this.createOrUpdateWo();
    }
    if (this.step() < 3) {
      this.step.update(s => s + 1);
      if (this.step() === 3) {
        setTimeout(() => this.initSignaturePad(), 100);
      }
    }
  }

  prev() { if (this.step() > 0) this.step.update(s => s - 1); }

  private async createOrUpdateWo() {
    if (this.woId) return;
    const loader = await this.loading.create({ message: 'Guardando...' });
    await loader.present();
    this.api.post<any>('work-orders', this.form).subscribe({
      next: async (wo) => { this.woId = wo.id; await loader.dismiss(); },
      error: async (e) => { await loader.dismiss(); },
    });
  }

  async capturePhoto(stage: string) {
    try {
      const pos = await Geolocation.getCurrentPosition().catch(() => null);
      const photo = await Camera.getPhoto({
        quality: 80, allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (!this.woId) await this.createOrUpdateWo();

      const blob = await fetch(photo.dataUrl!).then(r => r.blob());
      const fd = new FormData();
      fd.append('file', blob, `${stage}.jpg`);
      fd.append('stage', stage);
      if (pos) {
        fd.append('latitude', String(pos.coords.latitude));
        fd.append('longitude', String(pos.coords.longitude));
      }

      this.api.upload<any>(`evidences/upload?workOrderId=${this.woId}`, fd).subscribe({
        next: () => { this.photos[stage] = photo.dataUrl!; },
      });
    } catch {}
  }

  getPhoto(stage: string) { return this.photos[stage]; }
  photoCount() { return Object.keys(this.photos).filter(k => ['before','after'].includes(k) && this.photos[k]).length; }

  private initSignaturePad() {
    const canvas = this.sigCanvasRef?.nativeElement;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    this.sigPad = new SignaturePad(canvas, { penColor: '#000', backgroundColor: 'white' });
  }

  clearSignature() { this.sigPad?.clear(); }

  async completeOt() {
    if (this.sigPad?.isEmpty()) {
      const a = await this.alert.create({ header: 'Firma requerida', message: 'El cliente debe firmar antes de completar.', buttons: ['OK'] });
      await a.present(); return;
    }

    const sigDataUrl = this.sigPad!.toDataURL('image/png');
    const loader = await this.loading.create({ message: 'Generando reporte...' });
    await loader.present();

    const blob = await fetch(sigDataUrl).then(r => r.blob());
    const fd = new FormData();
    fd.append('file', blob, 'firma.png');

    this.api.upload<any>(`work-orders/${this.woId}/signature`, fd).subscribe({
      next: () => {
        this.api.post(`work-orders/${this.woId}/close`, {}).subscribe({
          next: async () => {
            await loader.dismiss();
            await this.storage.clearWoDraft();
            const t = await this.toast.create({ message: '¡OT completada! +15 puntos 🎉', duration: 3000, color: 'success' });
            await t.present();
            this.router.navigate(['/tabs/ots']);
          },
          error: async (e) => {
            await loader.dismiss();
            const t = await this.toast.create({ message: e.error?.message ?? 'Error al cerrar OT', duration: 3000, color: 'danger' });
            await t.present();
          },
        });
      },
    });
  }
}
