import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonInput, LoadingController, ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-sms',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonInput],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button /></ion-buttons>
        <ion-title>Verificar número</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div style="text-align:center;padding:40px 0 24px;">
        <div style="font-size:48px;">📱</div>
        <h2 style="font-size:20px;margin:16px 0 8px;">Ingresa el código</h2>
        <p style="color:var(--tf-text-muted);font-size:14px;">Enviamos un código de 6 dígitos a <strong>{{ phone }}</strong></p>
      </div>
      <ion-input
        [(ngModel)]="code"
        placeholder="123456"
        type="number"
        maxlength="6"
        fill="outline"
        style="text-align:center;font-size:28px;letter-spacing:8px;"
      />
      <ion-button expand="block" style="margin-top:20px;" (click)="verify()">Verificar →</ion-button>
      <ion-button expand="block" fill="clear" style="margin-top:8px;" (click)="resend()">Reenviar código</ion-button>
      <p style="text-align:center;font-size:12px;color:var(--tf-text-muted);margin-top:16px;">En desarrollo: usa el código <strong>123456</strong></p>
    </ion-content>
  `,
})
export class VerifySmsPage {
  phone = '';
  code = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingController,
    private toast: ToastController,
  ) {
    this.phone = this.route.snapshot.queryParams['phone'] ?? '';
  }

  async verify() {
    const loader = await this.loading.create({ message: 'Verificando...' });
    await loader.present();
    this.auth.verifySms(this.phone, this.code).subscribe({
      next: async () => { await loader.dismiss(); this.router.navigate(['/tabs/home']); },
      error: async (e) => {
        await loader.dismiss();
        const t = await this.toast.create({ message: e.error?.message ?? 'Código inválido', duration: 3000, color: 'danger' });
        await t.present();
      },
    });
  }

  async resend() {
    this.auth.register({ phone: this.phone }).subscribe();
    const t = await this.toast.create({ message: 'Código reenviado', duration: 2000, color: 'success' });
    await t.present();
  }
}
