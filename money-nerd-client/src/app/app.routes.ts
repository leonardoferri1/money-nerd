import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
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
    path: 'email-verification/:email',
    loadComponent: () => EmailVerificationComponent,
  },
];
