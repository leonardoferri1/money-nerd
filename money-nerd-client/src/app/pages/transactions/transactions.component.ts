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
import { CurrencyInputComponent } from '../../shared/components/web-components/currency-input/currency-input.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from '../../shared/components/web-components/text-input/text-input.component';
import { DropdownComponent } from '../../shared/components/web-components/dropdown-menu/dropdown/dropdown.component';
import { Category } from '../../shared/interfaces/ICategory.type';
import { Account } from '../../shared/interfaces/IAccount.type';
import { CategoriesService } from '../categories/categories.service';
import { AccountsService } from '../../shared/services/accounts.service';
import { TransactionsGridComponent } from './transactions-grid/transactions-grid.component';
import { MasksService } from '../../shared/services/masks.service';
import { TransactionsListComponent } from '../../shared/components/web-components/transactions-list/transactions-list.component';
import { ScreenService } from '../../shared/services/screen-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    TransactionsTableComponent,
    SidemenuComponent,
    NgFor,
    NgIf,
    TranslateModule,
    CurrencyInputComponent,
    ReactiveFormsModule,
    TextInputComponent,
    DropdownComponent,
    TransactionsGridComponent,
    TransactionsListComponent,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  transactionListType: 'table' | 'grid' = 'table';
  transactions: any[] = [];
  summary: any;
  editTransactionModal: boolean = false;
  transactionEditId!: string;
  transactionEditType!: 1 | 2;
  showFilterMenu: boolean = false;
  categories: Category[] = [];
  accounts: Account[] = [];

  currentYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth();
  months = Months;

  transactionFilterForm: FormGroup;

  screenWidth: number = 0;
  private subscription = new Subscription();
  tableTransactionMedia = 800;

  constructor(
    private transactionsService: TransactionsService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private accountsService: AccountsService,
    private modalOverlayService: ModalOverlayService,
    private masksService: MasksService,
    private screenService: ScreenService
  ) {
    this.transactionFilterForm = this.formBuilder.group({
      type: [''],
      description: [''],
      maxValue: [''],
      minValue: [''],
      isCreditCard: [''],
      account: [''],
      category: [''],
    });
  }

  ngOnInit() {
    this.kickstart();

    this.screenWidth = this.screenService.currentWidth;
    this.subscription.add(
      this.screenService.screenWidth$.subscribe((width) => {
        this.screenWidth = width;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async kickstart() {
    await this.getTransactions();
  }

  getCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response;
        this.getAccounts();
      },
      error: (error) => {},
    });
  }

  getAccounts() {
    this.accountsService.getAllAccounts().subscribe({
      next: (response) => {
        this.accounts = response;
      },
      error: (error) => {},
    });
  }

  selectYear(year: number) {
    this.currentYear = year;
    if (this.selectedMonth !== null) {
      this.getTransactions();
    }
  }

  formatCurrency(value: number) {
    return this.masksService.formatCurrencyPerLanguage(value);
  }

  selectMonth(index: number) {
    this.selectedMonth = index;
    this.getTransactions();
  }

  cleanFilters() {
    this.transactionFilterForm.reset();
  }

  async getTransactions() {
    const startDate = new Date(this.currentYear, this.selectedMonth, 1);
    const endDate = new Date(
      this.currentYear,
      this.selectedMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    const filters: TransactionFilters = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      description: this.transactionFilterForm.value.description,
      category: this.transactionFilterForm.value.category
        ? this.transactionFilterForm.value.category._id
        : '',
      account: this.transactionFilterForm.value.account
        ? this.transactionFilterForm.value.account._id
        : '',
      minValue: this.transactionFilterForm.value.minValue,
      maxValue: this.transactionFilterForm.value.maxValue,
    };

    this.transactionsService.getTransactions(filters).subscribe({
      next: (response) => {
        this.summary = response.summary;
        this.transactions = response.transactions.sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        this.getCategories();
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

  switchTransactionsViewMode(view: 'table' | 'grid') {
    this.transactionListType = view;
  }
}
