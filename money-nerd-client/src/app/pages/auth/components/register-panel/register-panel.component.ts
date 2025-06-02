import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SnackbarService } from '../../../../shared/components/snackbar/snackbar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { TextInputComponent } from '../../../../shared/components/web-components/text-input/text-input.component';

@Component({
  selector: 'app-register-panel',
  standalone: true,
  imports: [TextInputComponent, TranslateModule, NgIf, ReactiveFormsModule],
  templateUrl: './register-panel.component.html',
  styleUrl: './register-panel.component.scss',
})
export class RegisterPanelComponent {
  @Input() registering: boolean = false;
  @Input() isRegisterFadingOut = false;

  invalidEmail: boolean = false;
  invalidPassword: boolean = false;
  invalidName: boolean = false;
  invalidPasswordConfirm: boolean = false;

  registerForm!: FormGroup;

  @Output() formEmit = new EventEmitter<string | null>();
  @Output() registerFadeEmit = new EventEmitter<string | null>();

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackbarService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
    });
  }

  triggerRegisterFadeOut() {
    this.registering = false;
    this.isRegisterFadingOut = true;
    this.registerFadeEmit.emit();
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
          this.invalidEmail = true;
          break;
        case 'password':
          this.invalidPassword = true;
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

  async submitForm() {
    if (this.registerValidate() == true) {
      return;
    }

    this.formEmit.emit(this.registerForm.value);
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
      case 'name':
        this.invalidName = false;
        break;
      case 'password-confirm':
        this.invalidPasswordConfirm = false;
        break;
    }
  }
}
