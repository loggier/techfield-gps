import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private app: admin.app.App | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('firebase.projectId');
    const privateKey = this.configService.get<string>('firebase.privateKey');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');

    if (!projectId || !privateKey || !clientEmail) {
      this.logger.warn('Firebase not configured — push notifications disabled');
      return;
    }

    if (admin.apps.length === 0) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
      });
    } else {
      this.app = admin.apps[0];
    }

    this.logger.log('Firebase FCM initialized');
  }

  async sendToUser(fcmToken: string, payload: PushPayload): Promise<boolean> {
    if (!this.app || !fcmToken) return false;

    try {
      await admin.messaging(this.app).send({
        token: fcmToken,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
        android: { priority: 'high', notification: { sound: 'default' } },
        apns: { payload: { aps: { sound: 'default' } } },
      });
      return true;
    } catch (err) {
      this.logger.warn(`FCM send failed for token ${fcmToken?.slice(0, 10)}…: ${err.message}`);
      return false;
    }
  }

  async sendToMany(fcmTokens: string[], payload: PushPayload): Promise<void> {
    if (!this.app || fcmTokens.length === 0) return;
    const chunks = this.chunk(fcmTokens, 500);
    for (const tokens of chunks) {
      await admin.messaging(this.app).sendEachForMulticast({
        tokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
      });
    }
  }

  // ── Pre-built notification templates ─────────────────────────────────────

  async notifyLevelUp(fcmToken: string, newLevel: string) {
    return this.sendToUser(fcmToken, {
      title: '🎉 ¡Subiste de nivel!',
      body: `Ahora eres técnico ${newLevel.toUpperCase()}. ¡Sigue así!`,
      data: { type: 'level_up', level: newLevel },
    });
  }

  async notifyBadgeEarned(fcmToken: string, badgeName: string) {
    return this.sendToUser(fcmToken, {
      title: '🏅 ¡Nuevo badge ganado!',
      body: `Obtuviste el badge "${badgeName}". ¡Revísalo en tu perfil!`,
      data: { type: 'badge_earned', badge: badgeName },
    });
  }

  async notifyPointsEarned(fcmToken: string, points: number, reason: string) {
    return this.sendToUser(fcmToken, {
      title: `+${points} puntos`,
      body: reason,
      data: { type: 'points_earned', points: String(points) },
    });
  }

  async notifyReferralActivated(fcmToken: string, referredName: string, points: number) {
    return this.sendToUser(fcmToken, {
      title: '🤝 ¡Tu referido está activo!',
      body: `${referredName} completó su primera OT. +${points} puntos para ti.`,
      data: { type: 'referral_activated', points: String(points) },
    });
  }

  async notifyScoreDecay(fcmToken: string, score: number, daysInactive: number) {
    let title: string;
    let body: string;

    if (daysInactive >= 30) {
      title = '⚠️ Tu perfil está oculto';
      body = 'Llevas 30 días sin actividad. Registra 1 OT para reaparecer en el marketplace.';
    } else if (daysInactive >= 21) {
      title = `📉 Score: ${score}`;
      body = `Estás a punto de perder tu nivel. Registra una OT para mantener tu posición.`;
    } else if (daysInactive >= 14) {
      title = `📉 Tu score bajó a ${score}`;
      body = 'Registra una OT y mantén tu posición en el marketplace.';
    } else {
      title = `Tu score bajó a ${score}`;
      body = 'Actívate esta semana para mantener tu ranking.';
    }

    return this.sendToUser(fcmToken, {
      title,
      body,
      data: { type: 'score_decay', score: String(score), daysInactive: String(daysInactive) },
    });
  }

  async notifyOtClosed(fcmToken: string, slug: string) {
    return this.sendToUser(fcmToken, {
      title: '✅ OT completada',
      body: 'Tu reporte está listo. Compártelo con tu cliente.',
      data: { type: 'ot_closed', slug },
    });
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    );
  }
}
