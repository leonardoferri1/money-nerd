import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './category-modal.component.html',
  styleUrl: './category-modal.component.scss',
})
export class CategoryModalComponent {
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
