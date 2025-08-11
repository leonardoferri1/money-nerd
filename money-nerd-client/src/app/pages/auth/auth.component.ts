import { Component, OnInit } from '@angular/core';
import { TextInputComponent } from '../../shared/components/web-components/text-input/text-input.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoginPanelComponent } from './components/login-panel/login-panel.component';
import { RegisterPanelComponent } from './components/register-panel/register-panel.component';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [
    TextInputComponent,
    TranslateModule,
    ReactiveFormsModule,
    LoginPanelComponent,
    RegisterPanelComponent,
  ],
})
export class AuthComponent implements OnInit {
  registering: boolean = false;
  isLoginFadingOut = false;
  isRegisterFadingOut = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private emailVerificationService: EmailVerificationService
  ) {}

  ngOnInit() {}

  panelChange(panel: string) {
    if (panel == 'login') {
      this.registering = true;
      this.isLoginFadingOut = true;
      this.isRegisterFadingOut = false;
    } else if (panel == 'register') {
      this.registering = false;
      this.isLoginFadingOut = false;
      this.isRegisterFadingOut = true;
    }
  }

  async submitLogin(formValue: any) {
    this.authService.login(formValue).subscribe({
      next: (response) => {
        this.router.navigateByUrl('/home');
      },
      error: (error) => {
        if (
          error.status === 401 &&
          error.error?.message === 'Please verify your email first.'
        ) {
          this.snackBar.openErrorSnackbar(
            this.translate.instant('VALIDATION.VERIFY_FIRST')
          );
          this.resendCode(formValue.email);
          this.router.navigateByUrl(`/email-verification/${formValue.email}`);
        } else if (
          error.status === 401 &&
          error.error?.message === 'Incorrect password.'
        ) {
          this.snackBar.openErrorSnackbar(
            this.translate.instant('VALIDATION.INCORRECT_PASSWORD')
          );
        } else if (
          error.status === 404 &&
          error.error?.message === 'User not found.'
        ) {
          this.snackBar.openErrorSnackbar(
            this.translate.instant('VALIDATION.USER_NOT_FOUND')
          );
        } else {
          this.snackBar.openErrorSnackbar(error.error?.message);
        }
      },
    });
  }

  async resendCode(email: string) {
    await this.emailVerificationService.resendEmail(email).subscribe({
      next: (response) => {},
      error: (error) => {
        this.snackBar.openErrorSnackbar(error.error?.message);
      },
    });
  }

  async submitRegistration(formValue: any) {
    this.authService.register(formValue).subscribe({
      next: (response) => {
        this.router.navigateByUrl(`/email-verification/${response.email}`);
      },
      error: (error) => {
        if (
          error.status === 409 &&
          error.error?.message === 'Email is already in use.'
        ) {
          this.snackBar.openErrorSnackbar(
            this.translate.instant('VALIDATION.EMAIL_USED')
          );
        } else {
          this.snackBar.openErrorSnackbar(error.error?.message);
        }
      },
    });
  }
}
