import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [],
})
export class HomeComponent implements OnInit {
  constructor(
    private homeService: HomeService,
    private router: Router,
    private snackBar: SnackbarService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.kickstart();
  }

  async kickstart() {
    await this.getAllTransactions();
    await this.getLoggedInUser();
  }

  async getAllTransactions() {
    this.homeService.getTransactions().subscribe({
      next: (response) => {},
      error: (e) => {},
    });
  }

  async getLoggedInUser() {
    this.homeService.getUser().subscribe({
      next: (user: any) => {
        localStorage.setItem('user', JSON.stringify(user));
      },
      error: (error) => {
        if (
          error.status === 404 &&
          error.error?.message === 'User not found.'
        ) {
          this.snackBar.openErrorSnackbar(
            this.translate.instant('VALIDATION.USER_NOT_FOUND')
          );
        }
        this.router.navigate(['/login']);
      },
    });
  }
}
