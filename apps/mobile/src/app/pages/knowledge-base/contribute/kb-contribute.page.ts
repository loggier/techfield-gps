import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonButton, IonItem, IonLabel, IonInput,
  IonSelect, IonSelectOption, IonTextarea, IonNote,
  ToastController, LoadingController,
} from '@ionic/angular/standalone';
import { ApiService } from '@core/services/api.service';

interface KbForm {
  title: string;
  type: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  deviceBrand: string;
  deviceModel: string;
  country: string;
  symptoms: string;
  cause: string;
  solution: string;
  tools: string;
  notes: string;
}

@Component({
  selector: 'app-kb-contribute',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonButton, IonItem, IonLabel, IonInput,
    IonSelect, IonSelectOption, IonTextarea, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/kb"></ion-back-button></ion-buttons>
        <ion-title>Contribuir a KB</ion-title>
        <ion-buttons slot="end">
          <ion-button [disabled]="submitting()" (click)="submit()">
            {{ submitting() ? 'Enviando...' : 'Enviar' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="tf-page-content">
      <div style="padding:16px;margin-bottom:8px;">
        <p style="color:var(--ion-color-medium);font-size:13px;">
          Tu aportación será revisada por un técnico Senior o Elite antes de publicarse.
          Ganarás 20 puntos al ser aprobada.
        </p>
      </div>

      <!-- Type & vehicle -->
      <ion-item>
        <ion-select [(ngModel)]="form.type" label="Tipo de entrada" label-placement="floating" interface="action-sheet">
          <ion-select-option value="motor_cut">Corte de motor</ion-select-option>
          <ion-select-option value="apn">APN / Operadora</ion-select-option>
          <ion-select-option value="installation">Guía de instalación</ion-select-option>
          <ion-select-option value="known_issue">Problema conocido</ion-select-option>
          <ion-select-option value="config">Configuración general</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-input [(ngModel)]="form.title" label="Título" label-placement="floating" placeholder="Ej. Corte de motor Hilux 2020 con GT06N"></ion-input>
      </ion-item>

      <div style="padding:12px 16px;color:var(--tf-green);font-size:13px;font-weight:600;">Vehículo</div>

      <ion-item>
        <ion-input [(ngModel)]="form.vehicleBrand" label="Marca" label-placement="floating" placeholder="Toyota, Nissan..."></ion-input>
      </ion-item>
      <ion-item>
        <ion-input [(ngModel)]="form.vehicleModel" label="Modelo" label-placement="floating" placeholder="Hilux, NP300..."></ion-input>
      </ion-item>
      <ion-item>
        <ion-input [(ngModel)]="form.vehicleYear" label="Año" label-placement="floating" type="number" placeholder="2020"></ion-input>
      </ion-item>

      <div style="padding:12px 16px;color:var(--tf-green);font-size:13px;font-weight:600;">Dispositivo GPS</div>

      <ion-item>
        <ion-input [(ngModel)]="form.deviceBrand" label="Marca GPS" label-placement="floating" placeholder="Teltonika, Coban..."></ion-input>
      </ion-item>
      <ion-item>
        <ion-input [(ngModel)]="form.deviceModel" label="Modelo GPS" label-placement="floating" placeholder="FMB920, GT06N..."></ion-input>
      </ion-item>

      <ion-item>
        <ion-select [(ngModel)]="form.country" label="País" label-placement="floating" interface="action-sheet">
          <ion-select-option value="MX">México</ion-select-option>
          <ion-select-option value="CO">Colombia</ion-select-option>
          <ion-select-option value="PE">Perú</ion-select-option>
          <ion-select-option value="CL">Chile</ion-select-option>
          <ion-select-option value="GT">Guatemala</ion-select-option>
          <ion-select-option value="EC">Ecuador</ion-select-option>
        </ion-select>
      </ion-item>

      <div style="padding:12px 16px;color:var(--tf-green);font-size:13px;font-weight:600;">Contenido técnico</div>

      <ion-item>
        <ion-textarea [(ngModel)]="form.symptoms" label="Síntomas / Descripción" label-placement="floating"
          placeholder="Describe el problema o escenario..." rows="3" auto-grow></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-textarea [(ngModel)]="form.cause" label="Causa" label-placement="floating"
          placeholder="¿Cuál es la causa raíz?" rows="3" auto-grow></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-textarea [(ngModel)]="form.solution" label="Solución / Pasos" label-placement="floating"
          placeholder="Paso 1: ...&#10;Paso 2: ..." rows="5" auto-grow></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-textarea [(ngModel)]="form.tools" label="Herramientas necesarias" label-placement="floating"
          placeholder="Multímetro, pinza amperimétrica..." rows="2" auto-grow></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-textarea [(ngModel)]="form.notes" label="Notas adicionales" label-placement="floating"
          placeholder="Precauciones, variantes, compatibilidad..." rows="3" auto-grow></ion-textarea>
      </ion-item>

      <div style="padding:24px 16px;">
        <ion-button expand="block" [disabled]="submitting()" (click)="submit()">
          {{ submitting() ? 'Enviando...' : 'Enviar para revisión' }}
        </ion-button>
      </div>
    </ion-content>
  `,
})
export class KbContributePage {
  submitting = signal(false);

  form: KbForm = {
    title: '', type: '', vehicleBrand: '', vehicleModel: '', vehicleYear: '',
    deviceBrand: '', deviceModel: '', country: 'MX',
    symptoms: '', cause: '', solution: '', tools: '', notes: '',
  };

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private loading: LoadingController,
  ) {}

  async submit() {
    if (!this.form.title || !this.form.type) {
      const t = await this.toast.create({ message: 'Título y tipo son requeridos', duration: 2000, color: 'warning' });
      return t.present();
    }

    this.submitting.set(true);
    const loader = await this.loading.create({ message: 'Enviando...' });
    loader.present();

    const content: Record<string, unknown> = {};
    if (this.form.symptoms) content['síntomas'] = this.form.symptoms;
    if (this.form.cause) content['causa'] = this.form.cause;
    if (this.form.solution) {
      content['solución'] = this.form.solution.split('\n').filter(Boolean);
    }
    if (this.form.tools) content['herramientas'] = this.form.tools.split(',').map(s => s.trim()).filter(Boolean);
    if (this.form.notes) content['notas'] = this.form.notes;

    const payload = {
      title: this.form.title,
      type: this.form.type,
      vehicleBrand: this.form.vehicleBrand || undefined,
      vehicleModel: this.form.vehicleModel || undefined,
      vehicleYear: this.form.vehicleYear ? +this.form.vehicleYear : undefined,
      deviceBrand: this.form.deviceBrand || undefined,
      deviceModel: this.form.deviceModel || undefined,
      country: this.form.country,
      content,
    };

    try {
      await this.api.post('/kb', payload).toPromise();
      const t = await this.toast.create({
        message: '¡Entrada enviada! Será revisada por un Senior o Elite.',
        duration: 3000, color: 'success',
      });
      t.present();
      this.router.navigate(['/tabs/kb']);
    } catch {
      const t = await this.toast.create({ message: 'Error al enviar. Intenta de nuevo.', duration: 2500, color: 'danger' });
      t.present();
    } finally {
      loader.dismiss();
      this.submitting.set(false);
    }
  }
}
