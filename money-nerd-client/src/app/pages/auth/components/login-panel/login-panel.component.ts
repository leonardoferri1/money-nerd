import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TextInputComponent } from '../../../../shared/components/web-components/text-input/text-input.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { SnackbarService } from '../../../../shared/components/snackbar/snackbar.service';

@Component({
  selector: 'app-login-panel',
  standalone: true,
  imports: [TextInputComponent, TranslateModule, NgIf, ReactiveFormsModule],
  templateUrl: './login-panel.component.html',
  styleUrl: './login-panel.component.scss',
})
export class LoginPanelComponent {
  @Input() registering: boolean = false;
  @Input() isLoginFadingOut = false;

  loginForm!: FormGroup;

  invalidEmail: boolean = false;
  invalidPassword: boolean = false;

  @Output() formEmit = new EventEmitter<string | null>();
  @Output() loginFadeEmit = new EventEmitter<string | null>();

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackbarService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  googleLogin() {
    window.location.href = 'http://localhost:3000/auth/google';
  }

  githubLogin() {
    window.location.href = 'http://localhost:3000/auth/github';
  }

  triggerLoginFadeOut() {
    this.registering = true;
    this.isLoginFadingOut = true;
    this.loginFadeEmit.emit();
  }

  loginValidate(): boolean {
    console.log(this.loginForm);
    this.loginForm.markAllAsTouched();

    const erros = this.getFormValidationErrors(this.loginForm);

    erros.forEach((error: any) => {
      switch (error.control) {
        case 'email':
          this.invalidEmail = true;
          break;
        case 'password':
          this.invalidPassword = true;
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

  async submitForm() {
    if (this.loginValidate() == true) {
      return;
    }

    this.formEmit.emit(this.loginForm.value);
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
      case 'email':
        this.invalidEmail = false;
        break;
      case 'password':
        this.invalidPassword = false;
        break;
    }
  }
}
