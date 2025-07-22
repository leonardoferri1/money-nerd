import { DatePipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
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
  FormsModule,
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
import { MasksService } from '../../services/masks.service';
import { TransactionsListComponent } from '../web-components/transactions-list/transactions-list.component';

@Component({
  selector: 'app-many-transactions-modal',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgStyle,
    NgFor,
    TextInputComponent,
    TranslateModule,
    CurrencyInputComponent,
    ToggleSwitchComponent,
    DatePickerComponent,
    FormsModule,
    DropdownComponent,
    DropdownMenuComponent,
    TransactionsListComponent,
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
  templateUrl: './many-transactions-modal.component.html',
  styleUrl: './many-transactions-modal.component.scss',
})
export class ManyTransactionsModalComponent implements OnInit {
  private _opened = false;
  @Input() transactionId?: string;
  @Input()
  set opened(value: boolean) {
    this._opened = value;
    if (value) {
      this.getCategories();
    }
  }
  @Input() type: 'edit' | 'create' = 'create';
  @Input() showCloseButton = true;
  @Input() transactionType: 1 | 2 = 1;
  transactions: any[] = [];
  account: any;
  category: any;
  isDragging = false;
  categories: Category[] = [];
  accounts: Account[] = [];

  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  constructor(
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private categoriesService: CategoriesService,
    private accountsService: AccountsService,
    private transactionsService: TransactionsService,
    private router: Router,
    private translationService: TranslationService,
    private masksService: MasksService
  ) {}

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
    this.transactions = [];
    this.account = '';
    this.category = '';
    this.opened = false;
    this.transactionId = undefined;
    this.openedChange.emit(this.opened);
    this.onClose.emit();
  }

  formatCurrency(value: number) {
    return this.masksService.formatCurrencyPerLanguage(value);
  }

  formatDate(date: string | Date): string {
    const lang = this.translationService.currentLang;
    const locale = lang === 'pt' ? 'pt' : 'en';
    const format = lang === 'pt' ? 'dd/MM/yyyy' : 'MMM d, y';

    const pipe = new DatePipe(locale);
    return pipe.transform(date, format) ?? '';
  }

  getCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        this.category = response.find((x: any) => x.name == 'Generic');
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

  onInputChange() {}

  getIdOrValue(value: any) {
    return value && typeof value === 'object' && '_id' in value
      ? value._id
      : value;
  }

  submit() {
    this.transactionsService.createNewTransaction(this.transactions).subscribe({
      next: () => {
        this.snackBar.openSuccessSnackbar(
          this.translate.instant('TRANSACTION_CREATED')
        );
        this.close();
        const currentUrl = this.router.url;
        if (
          currentUrl.includes('/transactions') ||
          currentUrl.includes('/home')
        ) {
          window.location.reload();
        }
      },
      error: (error) => {
        this.snackBar.openErrorSnackbar(error.error?.message);
      },
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.uploadFile(input.files[0]);
      input.value = '';
    }
  }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('arquivo', file);

    this.transactionsService.importStatement(formData).subscribe({
      next: (res) => {
        const filteredTransactions = res.filter((x: any) => x.value > 1);
        this.transactions = filteredTransactions.map((x: any) => {
          return {
            value: x.value,
            description: x.description,
            date: x.date,
            account: this.account._id,
            category: this.category._id,
            type: x.type,
            wasPaid: true,
            isCreditCard: false,
            recurringTransaction: false,
          };
        });
      },
      error: (err) => {
        console.error('Erro ao enviar arquivo', err);
      },
    });
  }

  removeTransaction(index: number): void {
    this.transactions.splice(index, 1);
  }
}
