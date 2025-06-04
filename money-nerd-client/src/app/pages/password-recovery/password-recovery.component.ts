import { NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { TextInputComponent } from '../../shared/components/web-components/text-input/text-input.component';
import { PasswordRecoveryService } from './password-recovery.service';

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [TranslateModule, FormsModule, NgFor, NgIf, TextInputComponent],
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.scss',
})
export class PasswordRecoveryComponent implements AfterViewInit {
  email: string | null = '';
  password: string | null = '';
  isCodeVerification: boolean = false;
  isPasswordInput: boolean = false;
  invalidEmail: boolean = false;
  invalidPassword: boolean = false;
  codeDigits = new Array(6);
  code: string[] = new Array(6).fill('');

  codeExpireSeconds = 600;
  resendCooldownSeconds = 0;
  private intervalId: any;

  @ViewChildren('inputBox') inputs!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private passwordRecoveryService: PasswordRecoveryService
  ) {
    this.startCodeCountdown();
  }

  ngAfterViewInit() {
    this.inputs.changes.subscribe((inputs: QueryList<ElementRef>) => {
      if (inputs.length) {
        this.focusNextEmpty();
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  resendCode() {
    if (this.resendCooldownSeconds > 0) return;

    this.sendCodeEmail();

    this.codeExpireSeconds = 600;
    this.resendCooldownSeconds = 60;
  }

  submitPasswordReset() {
    if (!this.password) {
      this.invalidPassword = true;
      this.snackBar.openErrorSnackbar(
        this.translate.instant('VALIDATION.REQUIRED')
      );
      return;
    }

    this.passwordRecoveryService
      .passwordReset(this.email, this.getCode(), this.password)
      .subscribe({
        next: (response) => {
          if (response.message == 'Password updated successfully.') {
            this.snackBar.openSuccessSnackbar(
              this.translate.instant('PASSWORD_RECOVERED')
            );
          }
          this.router.navigateByUrl('/login');
        },
        error: (error) => {
          if (
            error.status === 404 &&
            error.error?.message === 'User not found.'
          ) {
            this.snackBar.openErrorSnackbar(
              this.translate.instant('VALIDATION.USER_NOT_FOUND')
            );
          } else if (
            error.status === 400 &&
            error.error?.message === 'Invalid code.'
          ) {
            this.snackBar.openErrorSnackbar(
              this.translate.instant('VALIDATION.BAD_CODE')
            );
          } else if (
            error.status === 400 &&
            error.error?.message === 'Expired code.'
          ) {
            this.snackBar.openErrorSnackbar(
              this.translate.instant('VALIDATION.EXPIRED_CODE')
            );
          } else if (
            error.status === 400 &&
            error.error?.message ===
              'Your new password is the same as the previous one.'
          ) {
            this.snackBar.openErrorSnackbar(
              this.translate.instant('VALIDATION.SAME_PASSWORD')
            );
          } else {
            this.snackBar.openErrorSnackbar(error.error?.message);
          }
        },
      });
  }

  onInput(event: any, index: number) {
    const value = event.target.value;

    if (!/^\d$/.test(value)) {
      this.code[index] = '';
      event.target.value = '';
      return;
    }

    this.code[index] = value;

    const next = this.inputs.toArray()[index + 1];
    if (next) {
      next.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      event.preventDefault();

      if (this.code[index]) {
        this.code[index] = '';
      } else if (index > 0) {
        const previous = this.inputs.toArray()[index - 1];
        this.code[index - 1] = '';
        previous.nativeElement.focus();
      }
    } else if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onBoxClick() {
    this.focusNextEmpty();
  }

  private focusNextEmpty() {
    const nextIndex = this.code.findIndex((c) => c === '');
    const targetIndex = nextIndex === -1 ? 5 : nextIndex;
    this.inputs.toArray()[targetIndex].nativeElement.focus();
  }

  getCode(): string {
    return this.code.join('');
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
  }

  private startCodeCountdown() {
    this.intervalId = setInterval(() => {
      if (this.codeExpireSeconds > 0) this.codeExpireSeconds--;
      if (this.resendCooldownSeconds > 0) this.resendCooldownSeconds--;
    }, 1000);
  }

  get codeExpireTime(): string {
    const min = Math.floor(this.codeExpireSeconds / 60)
      .toString()
      .padStart(2, '0');
    const sec = (this.codeExpireSeconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  onInputChange(inputName: string) {
    switch (inputName) {
      case 'email':
        this.invalidEmail = false;
        break;
      case 'password':
        this.invalidPassword = false;
        break;
    }
  }

  async setEmail() {
    if (!this.email) {
      this.invalidEmail = true;
      this.snackBar.openErrorSnackbar(
        this.translate.instant('VALIDATION.REQUIRED')
      );
      return;
    }

    await this.sendCodeEmail();
  }

  backToLogin() {
    this.email = '';
    this.router.navigateByUrl('/login');
  }

  sendCodeEmail() {
    this.passwordRecoveryService.sendPasswordResetEmail(this.email).subscribe({
      next: (response) => {
        if (response.email == 'Password reset code has been sent.') {
          this.snackBar.openSuccessSnackbar(
            this.translate.instant('PASSWORD_CODE_RESENT')
          );
        }
        this.isCodeVerification = true;
      },
      error: (error) => {
        if (
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

    this.codeExpireSeconds = 600;
    this.resendCooldownSeconds = 60;
  }
}
