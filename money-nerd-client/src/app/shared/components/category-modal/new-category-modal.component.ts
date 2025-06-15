import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TextInputComponent } from '../web-components/text-input/text-input.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ColorSelect } from './color-select/ColorSelect.type';
import { IconSelect } from './icon-select/IconSelect.type';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SnackbarService } from '../snackbar/snackbar.service';
import { CategoriesService } from '../../../pages/categories/categories.service';

@Component({
  selector: 'app-new-category-modal',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    TextInputComponent,
    TranslateModule,
    NgStyle,
    NgFor,
    ReactiveFormsModule,
  ],
  templateUrl: './new-category-modal.component.html',
  styleUrl: './new-category-modal.component.scss',
})
export class NewCategoryModalComponent {
  @Input() opened = false;
  @Input() colorModalOpen = false;
  @Input() iconModalOpen = false;
  @Input() type: 'edit' | 'create' = 'create';
  @Input() showCloseButton = true;
  selectedColor: string | null = '#4bb7e6';
  selectedIcon: string | null = 'bi bi-basket';
  invalidName: boolean = false;
  categoryForm: FormGroup;

  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  availableColors = ColorSelect;
  availableIcons = IconSelect;

  constructor(
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      color: [this.selectedColor || '', Validators.required],
      icon: [this.selectedIcon || '', Validators.required],
    });
  }

  close(): void {
    this.opened = false;
    this.openedChange.emit(this.opened);
    this.onClose.emit();
  }

  closeIconModal(): void {
    this.iconModalOpen = false;
  }

  closeColorModal(): void {
    this.colorModalOpen = false;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.closeColorModal();
  }

  changeColor(): void {
    this.colorModalOpen = true;
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.closeIconModal();
  }

  changeIcon(): void {
    this.iconModalOpen = true;
  }

  onInputChange() {
    this.invalidName = false;
  }

  submit() {
    if (!this.categoryForm.value.name) {
      this.invalidName = true;
      this.snackBar.openErrorSnackbar(
        this.translate.instant('VALIDATION.REQUIRED')
      );
      return;
    }

    this.categoriesService
      .createNewCategory(this.categoryForm.value)
      .subscribe({
        next: (response) => {
          this.snackBar.openSuccessSnackbar(
            this.translate.instant('CATEGORY_CREATED')
          );
          this.close();
          this.categoryForm.reset();
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
