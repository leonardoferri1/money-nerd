import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { AuthComponent } from './pages/auth/auth.component';
import { PasswordRecoveryComponent } from './pages/password-recovery/password-recovery.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => AuthComponent,
  },
  {
    path: 'home',
    loadComponent: () => HomeComponent,
  },
  {
    path: 'transactions',
    loadComponent: () => TransactionsComponent,
  },
  {
    path: 'password-recovery',
    loadComponent: () => PasswordRecoveryComponent,
  },
  {
    path: 'email-verification/:email',
    loadComponent: () => EmailVerificationComponent,
  },
];
