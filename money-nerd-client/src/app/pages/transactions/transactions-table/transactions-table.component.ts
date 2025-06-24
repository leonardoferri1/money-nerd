import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  DatePipe,
  NgClass,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
} from '@angular/common';
import { TransactionsTableService } from './transactions-table.service';
import { Column } from '../../../shared/interfaces/ITabela';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../shared/services/translation.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NewTransactionModalComponent } from '../../../shared/components/new-transaction-modal/new-transaction-modal.component';

@Component({
  selector: 'app-transactions-table',

  imports: [
    NgClass,
    NgStyle,
    NgTemplateOutlet,
    NgIf,
    TranslateModule,
    MatTooltipModule,
  ],
  standalone: true,
  templateUrl: './transactions-table.component.html',
  styleUrl: './transactions-table.component.scss',
})
export class TransactionsTableComponent {
  transactionsTableService = inject(TransactionsTableService);
  @Input() showSelectionColumn: boolean = false;
  @Input() selectionMode: 'single' | 'multiple' = 'multiple';
  @Input() columns: Column[] = [
    {
      label: 'COLUMNS.DESCRIPTION',
      field: 'description',
      width: '40%',
    },
    {
      label: 'COLUMNS.CATEGORY',
      field: 'category',
      width: '15%',
    },
    {
      label: 'COLUMNS.ACCOUNT',
      field: 'account',
      width: '15%',
    },
    {
      label: 'COLUMNS.DATE',
      field: 'date',
      width: '10%',
    },
    {
      label: 'COLUMNS.VALUE',
      field: 'value',
      width: '10%',
    },
  ];

  @Input() items: any[] | undefined = [];
  @Input() selectedIds: any[] = [];
  @Input() trackBy: string = '_id';
  @Input() customTemplate!: TemplateRef<any>;

  @Output() selectedItems = new EventEmitter<any[]>();
  @Output() emitTransaction = new EventEmitter<any[]>();

  constructor(private translationService: TranslationService) {}

  isSelected(id: any): boolean {
    return <boolean>this.selectedIds?.includes(id);
  }

  get selectedCount(): number {
    return this.selectedIds.length;
  }

  private getSelectedItems(): any[] {
    return (
      this.items?.filter((item) =>
        this.selectedIds.includes(item[this.trackBy])
      ) ?? []
    );
  }

  formatDate(date: string | Date): string {
    const lang = this.translationService.currentLang;

    const locale = lang === 'pt' ? 'pt' : 'en';
    const format = lang === 'pt' ? 'dd/MM/yyyy' : 'MMM d, y';

    const pipe = new DatePipe(locale);
    return pipe.transform(date, format) ?? '';
  }

  formatCellValue(item: any, col: Column): string {
    if (col.field === 'date') {
      return this.formatDate(item[col.field]);
    }

    if (col.field === 'value') {
      return this.formatCurrency(item[col.field]);
    }

    return item[col.field];
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

  getCellClass(item: any, col: Column): string {
    if (col.field === 'value') {
      const result =
        item.type === 'Income'
          ? 'text-success'
          : item.type === 'Outcome'
          ? 'text-danger'
          : '';
      return result;
    }
    return 'text-' + col.textAlignContent;
  }

  getCellStyle(item: any, col: Column): any {
    if (col.field === 'description') {
      return {
        'box-shadow': `inset 2px 0 0 0 ${item.category?.color}`,
        'padding-left': '15px',
        'box-sizing': 'border-box',
      };
    }
    return {};
  }

  isAllSelected() {
    if (this.items != undefined) {
      return this.items.every((item) => this.isSelected(item[this.trackBy]));
    }
    return false;
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedIds = [];
    } else {
      this.selectedIds = this.items?.map((item) => item[this.trackBy]) ?? [];
    }

    this.selectedItems.emit(this.getSelectedItems());
  }

  toggleSelection(id: any): void {
    const index = this.selectedIds.indexOf(id);

    if (index > -1) {
      this.selectedIds.splice(index, 1);
    } else {
      this.selectedIds.push(id);
    }

    this.selectedIds = [...this.selectedIds];
    this.selectedItems.emit(this.getSelectedItems());
  }

  editTransaction(transaction: any) {
    this.emitTransaction.emit(transaction);
  }
}
