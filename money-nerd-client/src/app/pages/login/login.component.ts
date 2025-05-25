import { Component, OnInit } from '@angular/core';
import { TextInputComponent } from '../../shared/components/web-components/text-input/text-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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

  constructor(private formBuilder: FormBuilder) {}

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
}
