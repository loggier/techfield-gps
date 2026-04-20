import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonButton, IonInput, IonItem, IonLabel, IonText,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonInput, IonItem, IonLabel, IonText],
  template: `
    <ion-content class="ion-padding">
      <div class="welcome-wrap">
        <div class="logo-area">
          <div class="logo-icon">📡</div>
          <h1 class="brand">TechField GPS</h1>
          <p class="tagline">La plataforma de los técnicos instaladores en LATAM</p>
        </div>

        <div class="referral-box">
          <p style="color:var(--tf-text-muted);font-size:14px;margin-bottom:12px;">
            ¿Tienes un código de referido?
          </p>
          <ion-input
            [(ngModel)]="referralCode"
            placeholder="Ej: TECH01"
            style="text-transform:uppercase"
            fill="outline"
          />
          <ion-button expand="block" (click)="goRegister()" style="margin-top:12px;">
            Crear mi cuenta →
          </ion-button>
        </div>

        <ion-button expand="block" fill="outline" (click)="goLogin()">
          Ya tengo cuenta — Ingresar
        </ion-button>

        <p class="terms">Al registrarte aceptas los Términos de servicio y la Política de privacidad.</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .welcome-wrap { display:flex; flex-direction:column; gap:24px; padding-top:60px; }
    .logo-area { text-align:center; }
    .logo-icon { font-size:64px; margin-bottom:16px; }
    .brand { font-size:28px; font-weight:700; color:var(--tf-green); margin:0 0 8px; }
    .tagline { color:var(--tf-text-muted); font-size:14px; margin:0; }
    .referral-box { background:var(--tf-bg2); border:1px solid var(--tf-border); border-radius:var(--tf-radius); padding:20px; }
    .terms { font-size:11px; color:var(--tf-text-muted); text-align:center; margin:0; }
  `],
})
export class WelcomePage {
  referralCode = '';
  constructor(private router: Router) {}
  goRegister() { this.router.navigate(['/auth/register'], { queryParams: { code: this.referralCode } }); }
  goLogin()    { this.router.navigate(['/auth/verify-sms']); }
}
