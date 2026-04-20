import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, from } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { environment } from '@env/environment';

export interface AuthTokens { accessToken: string; refreshToken: string; }
export interface UserProfile {
  id: string; name: string; phone: string; level: string;
  totalPoints: number; activityScore: number; avatarUrl?: string;
  referralCode: string; role: string;
}

const ACCESS_KEY  = 'tf_access';
const REFRESH_KEY = 'tf_refresh';
const USER_KEY    = 'tf_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;
  readonly user = signal<UserProfile | null>(null);
  readonly isLoggedIn = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private async loadFromStorage() {
    const { value: token } = await Preferences.get({ key: ACCESS_KEY });
    const { value: raw }   = await Preferences.get({ key: USER_KEY });
    if (token && raw) {
      this.user.set(JSON.parse(raw));
      this.isLoggedIn.set(true);
    }
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.base}/auth/register`, data);
  }

  verifySms(phone: string, code: string): Observable<AuthTokens & { user: UserProfile }> {
    return this.http.post<any>(`${this.base}/auth/verify-sms`, { phone, code }).pipe(
      tap(res => this.storeSession(res)),
    );
  }

  login(phone: string, pin?: string): Observable<any> {
    return this.http.post<any>(`${this.base}/auth/login`, { phone, pin }).pipe(
      tap(res => { if (res.accessToken) this.storeSession(res); }),
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.base}/auth/logout`, {}).pipe(
      tap(() => this.clearSession()),
    );
  }

  refreshToken(): Observable<AuthTokens> {
    return from(Preferences.get({ key: REFRESH_KEY })).pipe() as any;
  }

  updateFcmToken(token: string): Observable<any> {
    return this.http.put(`${this.base}/auth/fcm-token`, { token });
  }

  async getAccessToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: ACCESS_KEY });
    return value;
  }

  async getRefreshToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: REFRESH_KEY });
    return value;
  }

  private async storeSession(res: any) {
    await Preferences.set({ key: ACCESS_KEY,  value: res.accessToken });
    await Preferences.set({ key: REFRESH_KEY, value: res.refreshToken });
    if (res.user) {
      await Preferences.set({ key: USER_KEY, value: JSON.stringify(res.user) });
      this.user.set(res.user);
    }
    this.isLoggedIn.set(true);
  }

  async clearSession() {
    await Preferences.remove({ key: ACCESS_KEY });
    await Preferences.remove({ key: REFRESH_KEY });
    await Preferences.remove({ key: USER_KEY });
    this.user.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/auth/welcome']);
  }
}
