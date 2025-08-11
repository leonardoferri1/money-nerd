import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { MasksService } from '../../../services/masks.service';
import { Subscription } from 'rxjs';
import { ScreenService } from '../../../services/screen-service';

@Component({
  selector: 'transactions-list',
  standalone: true,
  imports: [CommonModule, CurrencyMaskModule, FormsModule, NgIf],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss'],
})
export class TransactionsListComponent implements OnInit {
  @Input() transaction!: any;
  @Input() index!: number;

  screenWidth: number = 0;
  private subscription = new Subscription();
  descriptionTransactionMedia = 450;

  @Output() remove = new EventEmitter<number>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  constructor(
    private masksService: MasksService,
    private screenService: ScreenService
  ) {}

  ngOnInit() {
    this.screenWidth = this.screenService.currentWidth;
    this.subscription.add(
      this.screenService.screenWidth$.subscribe((width) => {
        this.screenWidth = width;
      })
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number) {
    return this.masksService.formatCurrencyPerLanguage(value);
  }

  onRemove() {
    this.remove.emit(this.index);
    this.delete.emit(this.transaction);
  }

  onEdit() {
    this.edit.emit(this.transaction);
  }
}
