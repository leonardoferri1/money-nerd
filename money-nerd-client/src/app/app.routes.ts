import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { AuthComponent } from './pages/auth/auth.component';
import { PasswordRecoveryComponent } from './pages/password-recovery/password-recovery.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { CategoriesComponent } from './pages/categories/categories.component';

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
    path: 'categories',
    loadComponent: () => CategoriesComponent,
  },
  {
    path: 'accounts',
    loadComponent: () => AccountsComponent,
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
