import { Component, OnInit } from '@angular/core';
import { TextInputComponent } from '../../shared/components/web-components/text-input/text-input.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [TextInputComponent, TranslateModule, NgIf, ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  greeting!: string;
  registering: boolean = false;
  isLoginFadingOut = false;
  isRegisterFadingOut = false;

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  invalidLoginEmail: boolean = false;
  invalidRegisterEmail: boolean = false;
  invalidLoginPassword: boolean = false;
  invalidRegisterPassword: boolean = false;
  invalidName: boolean = false;
  invalidPasswordConfirm: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
    });

    console.log(document.cookie);
  }

  triggerLoginFadeOut() {
    this.registering = true;
    this.isLoginFadingOut = true;
    this.isRegisterFadingOut = false;
  }

  triggerRegisterFadeOut() {
    this.registering = false;
    this.isLoginFadingOut = false;
    this.isRegisterFadingOut = true;
  }

  async submitLogin() {
    if (this.loginValidate() == true) {
      return;
    }

    if (this.loginForm.valid) {
      this.loginService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.router.navigateByUrl('/home');
        },
        error: (e) => {
          console.log(e);
        },
      });
    }
  }

  async submitRegistration() {
    if (this.registerValidate() == true) {
      return;
    }

    if (this.loginForm.valid) {
      // this.enviarForm.emit(this.CargoForm);
    }
  }

  registerValidate(): boolean {
    this.registerForm.markAllAsTouched();

    const erros = this.getFormValidationErrors(this.registerForm);

    erros.forEach((error: any) => {
      switch (error.control) {
        case 'name':
          this.invalidName = true;
          break;
        case 'email':
          this.invalidLoginEmail = true;
          break;
        case 'password':
          this.invalidLoginPassword = true;
          break;
        case 'passwordConfirm':
          this.invalidPasswordConfirm = true;
          break;
      }

      if (error.error === 'required') {
        this.snackBar.openErrorSnackbar(
          this.translate.instant('VALIDATION.REQUIRED')
        );
      }
    });

    if (
      this.registerForm.value.registerPassword !==
      this.registerForm.value.confirmPassword
    ) {
      this.snackBar.openErrorSnackbar(
        this.translate.instant('VALIDATION.PASSWORDS_DO_NOT_MATCH')
      );
      this.invalidPasswordConfirm = true;
      return true;
    }

    return erros.length > 0;
  }

  loginValidate(): boolean {
    console.log(this.loginForm);
    this.loginForm.markAllAsTouched();

    const erros = this.getFormValidationErrors(this.loginForm);

    erros.forEach((error: any) => {
      switch (error.control) {
        case 'email':
          this.invalidLoginEmail = true;
          break;
        case 'password':
          this.invalidLoginPassword = true;
          break;
      }

      if (error.error === 'required') {
        this.snackBar.openErrorSnackbar(
          this.translate.instant('VALIDATION.REQUIRED')
        );
      }
    });

    return erros.length > 0;
  }

  getFormValidationErrors(form: any): { control: string; error: string }[] {
    const errors: { control: string; error: string }[] = [];

    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);

      if (control && control.errors) {
        Object.keys(control.errors).forEach((errorKey) => {
          errors.push({
            control: key,
            error: errorKey,
          });
        });
      }
    });

    return errors;
  }

  onInputChange(inputName: string) {
    switch (inputName) {
      case 'login-email':
        this.invalidLoginEmail = false;
        break;
      case 'register-email':
        this.invalidRegisterEmail = false;
        break;
      case 'login-password':
        this.invalidLoginPassword = false;
        break;
      case 'register-password':
        this.invalidRegisterPassword = false;
        break;
      case 'name':
        this.invalidName = false;
        break;
      case 'password-confirm':
        this.invalidPasswordConfirm = false;
        break;
    }
  }
}
