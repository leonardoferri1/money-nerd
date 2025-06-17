import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TextInputComponent } from '../web-components/text-input/text-input.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrencyInputComponent } from '../web-components/currency-input/currency-input.component';
import { ToggleSwitchComponent } from '../web-components/toggle-switch/toggle-switch.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { DropdownComponent } from '../web-components/dropdown-menu/dropdown/dropdown.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { SnackbarService } from '../snackbar/snackbar.service';
import { FormBuilder } from '@angular/forms';
import { CategoriesService } from '../../../pages/categories/categories.service';
import { Category } from '../../interfaces/ICategory.type';
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
  selectedDate: Date | null = null;
  isPaid: boolean = true;
  isCreditCard: boolean = false;
  isRecurring: boolean = false;

  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  constructor(
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService
  ) {
    // this.categoryForm = this.formBuilder.group({
    //   name: ['', Validators.required],
    //   color: [this.selectedColor || '', Validators.required],
    //   icon: [this.selectedIcon || '', Validators.required],
    // });
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
        console.log(this.categories);
      },
      error: (error) => {},
    });
  }
}
