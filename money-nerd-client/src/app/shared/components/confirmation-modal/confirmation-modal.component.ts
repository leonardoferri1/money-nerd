import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SnackbarService } from '../snackbar/snackbar.service';
import { NgClass, NgIf } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [NgIf, TranslateModule, NgClass],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
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
})
export class ConfirmationModalComponent implements OnInit {
  private _opened = false;

  @Input()
  set opened(value: boolean) {
    this._opened = value;
  }
  @Input() showCloseButton = true;
  @Input() title: string = 'PROCEED';

  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(
    private snackBar: SnackbarService,
    private translate: TranslateService
  ) {}

  get opened(): boolean {
    return this._opened;
  }

  ngOnInit() {}

  close(): void {
    this.cancelled.emit();
    this.opened = false;
    this.openedChange.emit(this.opened);
    this.onClose.emit();
  }

  submit() {
    this.confirmed.emit();
    this.close();
  }
}
