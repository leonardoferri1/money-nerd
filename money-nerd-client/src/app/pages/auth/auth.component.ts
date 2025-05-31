import { Component, OnInit } from '@angular/core';
import { TextInputComponent } from '../../shared/components/web-components/text-input/text-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoginPanelComponent } from './components/login-panel/login-panel.component';
import { RegisterPanelComponent } from './components/register-panel/register-panel.component';

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

  constructor(private authService: AuthService, private router: Router) {}

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
      error: (e) => {
        console.log(e);
      },
    });
  }

  // async submitRegistration(formValue: any) {
  //   this.authService.register(formValue).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //       this.router.navigateByUrl(`/email-verification/${response.email}`);
  //     },
  //     error: (e) => {
  //       console.log(e);
  //     },
  //   });
  // }

  async submitRegistration(formValue: any) {
    const email = 'leonardoferri@gmail.com';
    this.router.navigateByUrl(`/email-verification/${email}`);
  }
}
