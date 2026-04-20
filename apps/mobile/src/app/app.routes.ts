import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
      { path: 'welcome',    loadComponent: () => import('./pages/auth/welcome/welcome.page').then(m => m.WelcomePage) },
      { path: 'register',   loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage) },
      { path: 'verify-sms', loadComponent: () => import('./pages/auth/verify-sms/verify-sms.page').then(m => m.VerifySmsPage) },
    ],
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      { path: 'home',    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
      { path: 'ots',     loadComponent: () => import('./pages/work-orders/list/wo-list.page').then(m => m.WoListPage) },
      { path: 'kb',      loadComponent: () => import('./pages/knowledge-base/search/kb-search.page').then(m => m.KbSearchPage) },
      { path: 'profile', loadComponent: () => import('./pages/profile/view/profile-view.page').then(m => m.ProfileViewPage) },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: 'ots/new',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/work-orders/new/new-wo.page').then(m => m.NewWoPage),
  },
  {
    path: 'ots/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/work-orders/detail/wo-detail.page').then(m => m.WoDetailPage),
  },
  {
    path: 'kb/:id',
    loadComponent: () => import('./pages/knowledge-base/detail/kb-detail.page').then(m => m.KbDetailPage),
  },
  {
    path: 'kb/contribute',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/knowledge-base/contribute/kb-contribute.page').then(m => m.KbContributePage),
  },
  {
    path: 'profile/referrals',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/referrals/referrals.page').then(m => m.ReferralsPage),
  },
  {
    path: 'profile/rewards',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/rewards/rewards.page').then(m => m.RewardsPage),
  },
];
