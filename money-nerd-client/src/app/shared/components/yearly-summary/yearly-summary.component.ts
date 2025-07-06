import { NgFor, NgStyle } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-yearly-summary',
  standalone: true,
  imports: [NgFor, TranslateModule, NgStyle, MatTooltipModule],
  templateUrl: './yearly-summary.component.html',
  styleUrl: './yearly-summary.component.scss',
})
export class YearlySummaryComponent implements OnChanges {
  @Input() summaryData: { month: number; incomes: number; expenses: number }[] =
    [];

  maxValue: number = 0;

  constructor(private translate: TranslationService) {}

  ngOnChanges() {
    if (this.summaryData && this.summaryData.length) {
      const filledData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const existing = this.summaryData.find((d) => d.month === month);
        return existing || { month, incomes: 0, expenses: 0 };
      });

      this.summaryData = filledData;

      this.maxValue = Math.max(
        ...this.summaryData.map((d) => Math.max(d.incomes, d.expenses))
      );
    }
  }

  getBarWidth(value: number): string {
    if (!this.maxValue) return '0';
    return (value / this.maxValue) * 200 + 'px';
  }

  getBarHeight(value: number): string {
    if (!this.maxValue) return '0';
    return (value / this.maxValue) * 200 + 'px';
  }

  isMobile(): boolean {
    return window.innerWidth <= 600;
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
}
