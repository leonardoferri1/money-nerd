import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TextInputComponent } from '../web-components/text-input/text-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyInputComponent } from '../web-components/currency-input/currency-input.component';
@Component({
  selector: 'app-new-transaction-modal',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    TextInputComponent,
    TranslateModule,
    CurrencyInputComponent,
  ],
  templateUrl: './new-transaction-modal.component.html',
  styleUrl: './new-transaction-modal.component.scss',
})
export class NewTransactionModalComponent {
  @Input() opened = false;
  @Input() type: 'edit' | 'create' = 'create';
  @Input() showCloseButton = true;

  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  close(): void {
    this.opened = false;
    this.openedChange.emit(this.opened);
    this.onClose.emit();
  }
}
