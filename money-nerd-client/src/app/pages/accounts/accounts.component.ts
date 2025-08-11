import { Component, OnInit } from '@angular/core';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AccountsService } from '../../shared/services/accounts.service';
import { NgFor, NgIf } from '@angular/common';
import { MasksService } from '../../shared/services/masks.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent implements OnInit {
  accounts: any[] = [];
  openedIndex: number | null = null;

  constructor(
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private accountsService: AccountsService,
    private masksService: MasksService
  ) {}

  ngOnInit() {
    this.kickstart();
  }

  async kickstart() {
    await this.getAccountsDetails();
  }

  async getAccountsDetails() {
    this.accountsService.getAccountsDetails().subscribe({
      next: (response) => {
        this.accounts = response;
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  toggleYear(index: number) {
    this.openedIndex = this.openedIndex === index ? null : index;
  }

  getMonthName(monthNumber: number): string {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString(this.translate.currentLang, { month: 'long' });
  }

  formatCurrency(value: number) {
    return this.masksService.formatCurrencyPerLanguage(value);
  }
}
