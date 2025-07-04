import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { TransactionsService } from '../transactions/transactions.service';
import { YearlySummaryComponent } from '../../shared/components/yearly-summary/yearly-summary.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [YearlySummaryComponent],
})
export class HomeComponent implements OnInit {
  summaryYear: any;
  summaryAccount: string = '';
  summaryData = [
    { month: 0, incomes: 3000, expenses: 1200 },
    { month: 1, incomes: 2500, expenses: 1800 },
    { month: 2, incomes: 3100, expenses: 1600 },
    // ...
  ];
  constructor(
    private transactionsService: TransactionsService,
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
    // this.transactionsService.getYearlySummary().subscribe({
    //   next: (response) => {
    //     console.log(response);
    //   },
    //   error: (e) => {},
    // });
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
