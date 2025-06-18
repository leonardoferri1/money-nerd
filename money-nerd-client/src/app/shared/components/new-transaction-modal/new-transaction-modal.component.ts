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
  @Input() opened = false;
  @Input() type: 'edit' | 'create' = 'create';
  @Input() showCloseButton = true;
  @Input() transactionType: 1 | 2 = 1;

  categories: Category[] = [];
  transactionForm: FormGroup;

  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  constructor(
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService
  ) {
    this.transactionForm = this.formBuilder.group({
      type: ['', Validators.required],
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

  ngOnInit() {
    this.getCategories();
  }

  close(): void {
    this.opened = false;
    this.openedChange.emit(this.opened);
    this.onClose.emit();
  }

  getCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response;
      },
      error: (error) => {},
    });
  }

  onInputChange() {}

  submit() {
    console.log(this.transactionForm.value);
    return;
    if (!this.transactionForm.value.name) {
      // this.invalidName = true;
      this.snackBar.openErrorSnackbar(
        this.translate.instant('VALIDATION.REQUIRED')
      );
      return;
    }

    this.transactionsService
      .createNewTransaction(this.transactionForm.value)
      .subscribe({
        next: (response) => {
          this.snackBar.openSuccessSnackbar(
            this.translate.instant('CATEGORY_CREATED')
          );
          this.close();
          this.transactionForm.reset();
        },
        error: (error) => {
          if (
            error.status === 409 &&
            error.error?.message === 'A category with this name already exists.'
          ) {
            this.snackBar.openErrorSnackbar(
              this.translate.instant('VALIDATION.CATEGORY_NAME_USED')
            );
          } else {
            this.snackBar.openErrorSnackbar(error.error?.message);
          }
        },
      });
  }
}
