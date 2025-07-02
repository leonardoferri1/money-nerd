import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Category } from '../../shared/interfaces/ICategory.type';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { CategoriesService } from './categories.service';
import { Router } from '@angular/router';
import { TranslationService } from '../../shared/services/translation.service';
import { ModalOverlayService } from '../../shared/services/modalOverlay.service';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [NgIf, NgFor, NgStyle],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];

  constructor(
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private categoriesService: CategoriesService,
    private modalOverlayService: ModalOverlayService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.getCategories();
  }

  getCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response;
      },
      error: (error) => {},
    });
  }

  deleteCategory(id: any) {
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
      this.categoriesService.deleteCategory(id).subscribe({
        next: () => {
          window.location.reload();
          this.snackBar.openSuccessSnackbar(
            this.translate.instant('CATEGORY_DELETED')
          );
        },
        error: (error) => {
          if (
            error.status === 400 &&
            error.error?.message ===
              'It is not possible to delete the category as it is being used by an existing transaction.'
          ) {
            this.snackBar.openErrorSnackbar(
              this.translate.instant('VALIDATION.CATEGORY_USED_IN_TRANSACTION')
            );
          } else {
            this.snackBar.openErrorSnackbar(error.error?.message);
          }
        },
      });
    });

    instance.cancelled?.subscribe?.(() => {
      overlayRef.dispose();
    });
  }
}
