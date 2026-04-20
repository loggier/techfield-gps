import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonText, LoadingController, ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonButton, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonText,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button /></ion-buttons>
        <ion-title>Crear cuenta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div style="display:flex;flex-direction:column;gap:12px;">
        <ion-input [(ngModel)]="form.name" placeholder="Nombre completo" fill="outline" label="Nombre" labelPlacement="floating" />
        <ion-input [(ngModel)]="form.phone" placeholder="+52 55 1234 5678" fill="outline" label="Teléfono" labelPlacement="floating" type="tel" />
        <ion-input [(ngModel)]="form.zoneCity" placeholder="Ciudad" fill="outline" label="Ciudad" labelPlacement="floating" />
        <ion-input [(ngModel)]="form.zoneState" placeholder="Estado" fill="outline" label="Estado" labelPlacement="floating" />
        <ion-item>
          <ion-label>País</ion-label>
          <ion-select [(ngModel)]="form.zoneCountry">
            <ion-select-option value="MX">México</ion-select-option>
            <ion-select-option value="CO">Colombia</ion-select-option>
            <ion-select-option value="GT">Guatemala</ion-select-option>
            <ion-select-option value="PE">Perú</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-input [value]="referralCode" readonly fill="outline" label="Código de referido" labelPlacement="floating" />
        <ion-button expand="block" (click)="submit()">Enviar código SMS →</ion-button>
      </div>
    </ion-content>
  `,
})
export class RegisterPage {
  referralCode = '';
  form = { name: '', phone: '', zoneCity: '', zoneState: '', zoneCountry: 'MX' };

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingController,
    private toast: ToastController,
  ) {
    this.referralCode = this.route.snapshot.queryParams['code'] ?? '';
  }

  async submit() {
    const loader = await this.loading.create({ message: 'Enviando código...' });
    await loader.present();
    this.auth.register({ ...this.form, referralCode: this.referralCode }).subscribe({
      next: async () => {
        await loader.dismiss();
        this.router.navigate(['/auth/verify-sms'], { queryParams: { phone: this.form.phone } });
      },
      error: async (e) => {
        await loader.dismiss();
        const t = await this.toast.create({ message: e.error?.message ?? 'Error al registrar', duration: 3000, color: 'danger' });
        await t.present();
      },
    });
  }
}
