import { Component, Input, OnChanges } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor, NgIf } from '@angular/common';
import { ExpenseCategorySummary } from './category-summary.type';
import { MasksService } from '../../services/masks.service';

@Component({
  selector: 'app-category-summary',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule, MatTooltipModule],
  templateUrl: './category-summary.component.html',
  styleUrl: './category-summary.component.scss',
})
export class CategorySummaryComponent implements OnChanges {
  @Input() categories: ExpenseCategorySummary[] = [];

  total = 0;
  processedCategories: any[] = [];

  readonly CIRCUMFERENCE = 100;
  constructor(private masksService: MasksService) {}

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

  formatCurrency(value: number) {
    return this.masksService.formatCurrencyPerLanguage(value);
  }

  isMobile(): boolean {
    return window.innerWidth <= 600;
  }
}
