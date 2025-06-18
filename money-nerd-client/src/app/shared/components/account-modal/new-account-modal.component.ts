import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TextInputComponent } from '../web-components/text-input/text-input.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SnackbarService } from '../snackbar/snackbar.service';
import { CategoriesService } from '../../../pages/categories/categories.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { AccountsService } from '../../services/accounts.service';

@Component({
  selector: 'app-new-account-modal',
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
  templateUrl: './new-account-modal.component.html',
  styleUrl: './new-account-modal.component.scss',
})
export class NewAccountModalComponent {
  @Input() opened = false;
  @Input() showCloseButton = true;

  invalidName: boolean = false;
  accountForm: FormGroup;

  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  constructor(
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private accountsService: AccountsService
  ) {
    this.accountForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  close(): void {
    this.opened = false;
    this.openedChange.emit(this.opened);
    this.onClose.emit();
  }

  onInputChange() {
    this.invalidName = false;
  }

  submit() {
    if (!this.accountForm.value.name) {
      this.invalidName = true;
      this.snackBar.openErrorSnackbar(
        this.translate.instant('VALIDATION.REQUIRED')
      );
      return;
    }

    this.accountsService.createNewAccount(this.accountForm.value).subscribe({
      next: (response) => {
        this.snackBar.openSuccessSnackbar(
          this.translate.instant('CATEGORY_CREATED')
        );
        this.close();
        this.accountForm.reset();
      },
      error: (error) => {
        if (
          error.status === 409 &&
          error.error?.message === 'A account with this name already exists.'
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
