import { Component, Input, OnChanges } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { ExpenseCategorySummary } from './category-summary.type';

@Component({
  selector: 'app-category-summary',
  standalone: true,
  imports: [NgIf, NgStyle, NgFor, TranslateModule, MatTooltipModule],
  templateUrl: './category-summary.component.html',
  styleUrl: './category-summary.component.scss',
})
export class CategorySummaryComponent implements OnChanges {
  @Input() categories: ExpenseCategorySummary[] = [];

  total = 0;
  processedCategories: any[] = [];

  readonly CIRCUMFERENCE = 100;
  constructor(private translate: TranslationService) {}

  ngOnChanges(): void {
    if (!this.categories?.length) return;

    this.total = this.categories.reduce((sum, cat) => sum + cat.total, 0);
    let currentOffset = 25;

    this.processedCategories = this.categories.map((cat) => {
      const percentage = (cat.total / this.total) * 100;
      const slice = {
        ...cat,
        percentage: +percentage.toFixed(2),
        offset: +currentOffset.toFixed(2),
      };
      currentOffset -= percentage;
      return slice;
    });
  }

  formatCurrency(value: number): string {
    const locale = this.translate.currentLang === 'pt' ? 'pt' : 'en';
    const currencyCode = locale === 'pt' ? 'BRL' : 'USD';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  }

  isMobile(): boolean {
    return window.innerWidth <= 600;
  }
}
