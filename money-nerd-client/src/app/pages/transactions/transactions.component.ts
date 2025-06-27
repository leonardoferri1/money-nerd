import { Component, OnInit } from '@angular/core';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TransactionsService } from './transactions.service';
import { TransactionsTableComponent } from './transactions-table/transactions-table.component';
import { Column } from '../../shared/interfaces/ITabela';
import { NewTransactionModalComponent } from '../../shared/components/new-transaction-modal/new-transaction-modal.component';
import { ModalOverlayService } from '../../shared/services/modalOverlay.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { SidemenuComponent } from '../../shared/components/web-components/side-menu/side-menu.component';
import { TransactionFilters } from './transaction-filters.model';
import { NgFor, NgIf } from '@angular/common';
import { Months } from '../../shared/interfaces/Months.type';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    TransactionsTableComponent,
    SidemenuComponent,
    NgFor,
    NgIf,
    TranslateModule,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  summary: any;
  editTransactionModal: boolean = false;
  transactionEditId!: string;
  transactionEditType!: 1 | 2;
  showFilterMenu: boolean = false;

  currentYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth();
  months = Months;

  constructor(
    private transactionsService: TransactionsService,
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private modalOverlayService: ModalOverlayService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.kickstart();
  }

  async kickstart() {
    await this.getTransactions(this.selectedMonth);
  }

  selectYear(year: number) {
    this.currentYear = year;
    if (this.selectedMonth !== null) {
      this.getTransactions(this.selectedMonth);
    }
  }

  formatCurrency(value: number): string {
    const locale = this.translationService.currentLang === 'pt' ? 'pt' : 'en';
    const currencyCode = locale === 'pt' ? 'BRL' : 'USD';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  }

  selectMonth(index: number) {
    this.selectedMonth = index;
    this.getTransactions(index);
  }

  async getTransactions(monthIndex: number) {
    const startDate = new Date(this.currentYear, monthIndex, 1);
    const endDate = new Date(
      this.currentYear,
      monthIndex + 1,
      0,
      23,
      59,
      59,
      999
    );

    const filters: TransactionFilters = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    this.transactionsService.getTransactions(filters).subscribe({
      next: (response) => {
        console.log(response);
        this.summary = response.summary;
        this.transactions = response.transactions.sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  editTransaction(transaction: any) {
    const type = transaction.type === 'Income' ? 1 : 2;
    const id = transaction._id;

    this.modalOverlayService.openModal(NewTransactionModalComponent, {
      transactionType: type,
      transactionId: id,
      type: 'edit',
      opened: true,
    });
  }

  deleteTransaction(transaction: any) {
    const { overlayRef, instance } = this.modalOverlayService.openModal(
      ConfirmationModalComponent,
      {
        title: 'CONFIRM_TRANSACTION_DELETE',
        showCloseButton: true,
        opened: true,
      }
    );

    instance.confirmed?.subscribe?.(() => {
      overlayRef.dispose();
      this.transactionsService
        .deleteTransaction(transaction._id)
        .subscribe(() => {
          window.location.reload();
        });
    });

    instance.cancelled?.subscribe?.(() => {
      overlayRef.dispose();
    });
  }

  openFilterMenu() {
    this.showFilterMenu = true;
  }
}
