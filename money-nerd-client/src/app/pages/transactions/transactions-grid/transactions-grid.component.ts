import { DatePipe, KeyValuePipe, NgClass, NgFor } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-transactions-grid',
  standalone: true,
  imports: [NgClass, TranslateModule, NgFor, KeyValuePipe],
  templateUrl: './transactions-grid.component.html',
  styleUrl: './transactions-grid.component.scss',
})
export class TransactionsGridComponent implements OnInit {
  private _items: any[] = [];

  @Input() set items(value: any[]) {
    this._items = value ?? [];
    this.groupByDate();
  }

  @Output() emitEditTransaction = new EventEmitter<any>();
  @Output() emitDeleteTransaction = new EventEmitter<any>();

  groupedTransactions: { [date: string]: any[] } = {};

  translationService = inject(TranslationService);

  ngOnInit(): void {
    this.groupByDate();
  }

  get items(): any[] {
    return this._items;
  }

  sortByDate = (a: any, b: any): number => {
    return new Date(b.key).getTime() - new Date(a.key).getTime();
  };

  groupByDate(): void {
    this.groupedTransactions = this.items.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      acc[date] = acc[date] || [];
      acc[date].push(transaction);
      return acc;
    }, {} as { [key: string]: any[] });
  }

  getTotal(transactions: any[]): number {
    return transactions.reduce((total, t) => {
      return total + (t.type === 'Income' ? t.value : -t.value);
    }, 0);
  }

  formatDate(date: string | Date): string {
    const lang = this.translationService.currentLang;
    const locale = lang === 'pt' ? 'pt' : 'en';
    const format = lang === 'pt' ? 'dd/MM/yyyy' : 'MMM d, y';

    const pipe = new DatePipe(locale);
    return pipe.transform(date, format) ?? '';
  }

  formatCurrency(value: number): string {
    const locale = this.translationService.currentLang === 'pt' ? 'pt' : 'en';
    const currencyCode = locale === 'pt' ? 'BRL' : 'USD';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  }
}
