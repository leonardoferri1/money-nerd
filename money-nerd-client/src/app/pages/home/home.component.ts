import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { YearlySummaryComponent } from '../../shared/components/yearly-summary/yearly-summary.component';
import { ExpenseCategorySummary } from '../../shared/components/category-summary/category-summary.type';
import { CategorySummaryComponent } from '../../shared/components/category-summary/category-summary.component';
import { YearSelectComponent } from '../../shared/components/web-components/date-picker/year-select/year-select.component';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MonthSelectComponent } from '../../shared/components/web-components/date-picker/month-select/month-select.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    YearlySummaryComponent,
    CategorySummaryComponent,
    YearSelectComponent,
    MonthSelectComponent,
    FormsModule,
    NgIf,
  ],
})
export class HomeComponent implements OnInit {
  summaryYear: any;
  summaryAccount: string = '';
  summaryData: any[] = [];
  categorySummary: ExpenseCategorySummary[] = [];
  years: number[] = [];
  yearlySummaryYear = new Date().getFullYear();
  categorySummaryYear = new Date().getFullYear();
  categorySummaryMonth = new Date().getMonth();

  constructor(
    private homeService: HomeService,
    private router: Router,
    private snackBar: SnackbarService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.kickstart();

    const currentYear = new Date().getFullYear();
    const startYear = 2000;
    for (let y = currentYear; y >= startYear; y--) {
      this.years.push(y);
    }
  }

  async kickstart() {
    await this.getYearlySummary(new Date().getFullYear());
    await this.getLoggedInUser();
    await this.getCategoriesSummary();
    await this.getGrowthSummary(new Date().getFullYear());
  }

  async getYearlySummary(year: number) {
    let payload = {
      year: year,
    };

    this.homeService.getYearlySummary(payload).subscribe({
      next: (response) => {
        this.summaryData = response;
      },
      error: (e) => {},
    });
  }

  async getGrowthSummary(year: number) {
    let payload = {
      year: year,
    };

    this.homeService.getGrowthSummary(payload).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (e) => {},
    });
  }

  async getCategoriesSummary() {
    this.homeService
      .getExpenseSummary(
        this.categorySummaryYear,
        this.categorySummaryMonth + 1
      )
      .subscribe({
        next: (response) => {
          this.categorySummary = response;
        },
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
