import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TextInputComponent } from '../web-components/text-input/text-input.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrencyInputComponent } from '../web-components/currency-input/currency-input.component';
import { ToggleSwitchComponent } from '../web-components/toggle-switch/toggle-switch.component';
import { DatePickerComponent } from '../web-components/date-picker/date-picker.component';
import { DropdownComponent } from '../web-components/dropdown-menu/dropdown/dropdown.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { SnackbarService } from '../snackbar/snackbar.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoriesService } from '../../../pages/categories/categories.service';
import { Category } from '../../interfaces/ICategory.type';
import { TransactionsService } from '../../../pages/transactions/transactions.service';
import { Account } from '../../interfaces/IAccount.type';
import { AccountsService } from '../../services/accounts.service';
import { Router } from '@angular/router';
import { DropdownMenuComponent } from '../web-components/dropdown-menu/dropdown-menu/dropdown-menu.component';
import { TranslationService } from '../../services/translation.service';
@Component({
  selector: 'app-new-transaction-modal',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgStyle,
    TextInputComponent,
    TranslateModule,
    CurrencyInputComponent,
    ToggleSwitchComponent,
    DatePickerComponent,
    DropdownComponent,
    ReactiveFormsModule,
    DropdownMenuComponent,
  ],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)' }),
        animate(
          '150ms ease',
          style({ opacity: 1, transform: 'translate(-50%, -50%) scale(1)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms ease',
          style({ opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)' })
        ),
      ]),
    ]),
  ],
  templateUrl: './new-transaction-modal.component.html',
  styleUrl: './new-transaction-modal.component.scss',
})
export class NewTransactionModalComponent implements OnInit {
  private _opened = false;
  @Input() transactionId?: string;
  @Input()
  set opened(value: boolean) {
    this._opened = value;
    if (value) {
      this.getCategories();
      setTimeout(() => {
        if (this.type === 'edit' && this.transactionId) {
          this.loadTransactionById(this.transactionId);
        }
      }, 0);
    }
  }
  @Input() type: 'edit' | 'create' = 'create';
  @Input() showCloseButton = true;
  @Input() transactionType: 1 | 2 = 1;
  showRecurringMenu: boolean = false;

  categories: Category[] = [];
  accounts: Account[] = [];
  recurringTransactions: any[] = [];

  transactionForm: FormGroup;

  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  constructor(
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private accountsService: AccountsService,
    private transactionsService: TransactionsService,
    private router: Router,
    private translationService: TranslationService
  ) {
    this.transactionForm = this.formBuilder.group({
      type: [''],
      description: [''],
      value: ['', Validators.required],
      wasPaid: [true],
      isCreditCard: [false],
      recurringTransaction: [false],
      date: ['', Validators.required],
      account: ['', Validators.required],
      category: ['', Validators.required],
    });
  }

  get transactionThemeColor(): string {
    return this.transactionType === 1 ? '#9fcf61' : '#d43e2a';
  }

  get transactionThemeClass(): string {
    return this.transactionType === 1 ? 'green-theme' : 'red-theme';
  }

  get opened(): boolean {
    return this._opened;
  }

  ngOnInit() {}

  close(): void {
    this.opened = false;
    this.transactionForm.reset();
    this.transactionId = undefined;
    this.openedChange.emit(this.opened);
    this.onClose.emit();
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

  getCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response;
        this.getRecurringTransactions();
      },
      error: (error) => {},
    });
  }

  getRecurringTransactions() {
    this.transactionsService.getRecurringTransactions().subscribe({
      next: (response: any[]) => {
        this.recurringTransactions = response.map((transaction) => ({
          ...transaction,
          label: this.formatCurrency(transaction.value),
          icon: transaction.category?.icon,
          color:
            transaction.type === 'Income'
              ? 'text-success'
              : transaction.type === 'Outcome'
              ? 'text-danger'
              : '',
        }));

        this.getAccounts();
      },
      error: (error: any) => {},
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

  onInputChange() {}

  getIdOrValue(value: any) {
    return value && typeof value === 'object' && '_id' in value
      ? value._id
      : value;
  }

  submit() {
    const submitTransaction = {
      ...this.transactionForm.value,
      account: this.getIdOrValue(this.transactionForm.value['account']),
      category: this.getIdOrValue(this.transactionForm.value['category']),
      type: this.transactionType,
    };

    if (this.type === 'edit' && this.transactionId) {
      this.transactionsService
        .updateTransaction(this.transactionId, submitTransaction)
        .subscribe({
          next: () => {
            this.snackBar.openSuccessSnackbar(
              this.translate.instant('TRANSACTION_UPDATED')
            );
            this.close();
            this.transactionForm.reset();
            window.location.reload();
          },
          error: (error) => {
            this.snackBar.openErrorSnackbar(error.error?.message);
          },
        });
    } else {
      this.transactionsService
        .createNewTransaction([submitTransaction])
        .subscribe({
          next: () => {
            this.snackBar.openSuccessSnackbar(
              this.translate.instant('TRANSACTION_CREATED')
            );
            this.close();
            this.transactionForm.reset();

            const currentUrl = this.router.url;
            if (currentUrl.includes('/transactions')) {
              window.location.reload();
            }
          },
          error: (error) => {
            this.snackBar.openErrorSnackbar(error.error?.message);
          },
        });
    }
  }

  loadTransactionById(id: string): void {
    this.transactionsService.getTransactionById(id).subscribe({
      next: (transaction) => {
        this.transactionForm.patchValue({
          type: transaction.type === 'Income' ? 1 : 2,
          description: transaction.description,
          value: transaction.value,
          wasPaid: transaction.wasPaid,
          isCreditCard: transaction.isCreditCard,
          recurringTransaction: transaction.recurringTransaction,
          date: new Date(transaction.date),
          account: transaction.account._id,
          category: transaction.category._id,
        });

        console.log(this.transactionForm);
      },
      error: (error) => {
        this.snackBar.openErrorSnackbar(
          this.translate.instant('VALIDATION.TRANSACTION_NOT_FOUND')
        );
        this.close();
      },
    });
  }

  isRecurringButtonClick(item: any) {
    (this.transactionType = item.type === 'Income' ? 1 : 2),
      this.transactionForm.patchValue({
        type: item.type === 'Income' ? 1 : 2,
        description: item.description,
        value: item.value,
        date: new Date(item.date),
        account: item.account._id,
        category: item.category._id,
      });
    this.toggleRecurringMenu();
  }

  onToggleRecurringMenu(event: MouseEvent) {
    event.stopPropagation();
    this.toggleRecurringMenu();
  }

  toggleRecurringMenu() {
    this.showRecurringMenu = !this.showRecurringMenu;
  }
}
