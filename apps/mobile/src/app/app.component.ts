import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { PushNotifications } from '@capacitor/push-notifications';
import { AuthService } from './core/services/auth.service';
import { SyncService } from './core/services/sync.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
})
export class AppComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private sync: SyncService,
  ) {}

  async ngOnInit() {
    await this.initApp();
  }

  private async initApp() {
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#080C12' });
    } catch {}

    await SplashScreen.hide();
    this.sync.init();
    this.initPushNotifications();
  }

  private async initPushNotifications() {
    try {
      await PushNotifications.requestPermissions();
      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        this.auth.updateFcmToken(token.value).subscribe();
      });
    } catch {}
  }
}
