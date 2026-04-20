import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { environment } from './environments/environment';

if (environment.sentryDsn) {
  Sentry.init({
    dsn: environment.sentryDsn,
    environment: environment.production ? 'production' : 'development',
    tracesSampleRate: environment.production ? 0.2 : 1.0,
  });
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: ErrorHandler, useValue: Sentry.createErrorHandler({ showDialog: false }) },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
});
