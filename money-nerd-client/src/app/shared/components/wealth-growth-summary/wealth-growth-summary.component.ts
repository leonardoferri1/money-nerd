import { NgClass, NgFor, NgStyle } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MasksService } from '../../services/masks.service';

@Component({
  selector: 'app-wealth-growth-summary',
  standalone: true,
  imports: [NgFor, NgStyle, TranslateModule, MatTooltipModule, NgClass],
  templateUrl: './wealth-growth-summary.component.html',
  styleUrl: './wealth-growth-summary.component.scss',
})
export class WealthGrowthSummaryComponent implements OnChanges {
  @Input() monthly: { month: number; balance: number }[] = [];

  maxValue: number = 0;

  constructor(private masksService: MasksService) {}

  ngOnChanges(): void {
    if (this.monthly?.length) {
      const filled = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        return (
          this.monthly.find((m) => m.month === month) ?? {
            month,
            balance: 0,
          }
        );
      });
      this.monthly = filled;
      this.maxValue = Math.max(...this.monthly.map((m) => Math.abs(m.balance)));
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= 1234;
  }

  getBarStyle(value: number): { [key: string]: string } {
    const size = this.maxValue ? (Math.abs(value) / this.maxValue) * 200 : 0;
    const dimension = size + 'px';
    const isMobile = this.isMobile();
    return {
      height: isMobile ? '20px' : dimension,
      width: isMobile ? dimension : '20px',
    };
  }

  getBarColor(value: number): string {
    if (value > 0) return 'positive-bar';
    if (value < 0) return 'negative-bar';
    return 'neutral-bar';
  }

  formatCurrency(value: number) {
    return this.masksService.formatCurrencyPerLanguage(value);
  }
}
