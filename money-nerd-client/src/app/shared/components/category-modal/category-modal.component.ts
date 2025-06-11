import {
  NgClass,
  NgFor,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
} from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TextInputComponent } from '../web-components/text-input/text-input.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [NgIf, NgClass, TextInputComponent, TranslateModule, NgStyle, NgFor],
  templateUrl: './category-modal.component.html',
  styleUrl: './category-modal.component.scss',
})
export class CategoryModalComponent {
  @Input() opened = false;
  @Input() colorModalOpen = false;
  @Input() iconModalOpen = false;
  @Input() type: 'edit' | 'create' = 'create';
  @Input() showCloseButton = true;
  @Input() selectedColor: string | null = '#4bb7e6';
  @Input() selectedIcon: string | null = 'bi bi-basket';

  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  availableColors: string[] = [
    '#ec684a',
    '#4bb7e6',
    '#7ec05f',
    '#e8f168',
    '#911d3a',
    '#eb5cad',
    '#7e4a94',
    '#374553',
    '#0f3c69',
    '#f3f2f2',
    '#5c208d',
    '#277739',
    '#a02323',
    '#886231',
    '#3b6965',
    '#c5c0c0',
    '#989e5c',
    '#73d6d1',
  ];

  availableIcons: string[] = [
    'bi bi-airplane',
    'bi bi-alarm',
    'bi bi-apple-music',
    'bi bi-backpack2',
    'bi bi-bag',
    'bi bi-bandaid',
    'bi bi-basket',
    'bi bi-bar-chart-line',
    'bi bi-beaker',
    'bi bi-bicycle',
    'bi bi-brilliance',
    'bi bi-bug',
    'bi bi-cake2',
    'bi bi-calendar-check',
    'bi bi-car-front-fill',
    'bi bi-cart',
    'bi bi-cloud',
    'bi bi-cloud-drizzle',
    'bi bi-controller',
    'bi bi-cookie',
    'bi bi-cup-hot',
    'bi bi-droplet',
    'bi bi-emoji-smile',
    'bi bi-ev-front',
    'bi bi-flower2',
    'bi bi-gem',
    'bi bi-fuel-pump',
    'bi bi-gift',
    'bi bi-gender-female',
    'bi bi-gender-male',
    'bi bi-globe-central-south-asia-fill',
    'bi bi-hammer',
    'bi bi-headphones',
    'bi bi-heart',
    'bi bi-leaf',
    'bi bi-lightning-charge-fill',
    'bi bi-magnet',
    'bi bi-lungs',
    'bi bi-pc-display-horizontal',
    'bi bi-rocket',
    'bi bi-scooter',
    'bi bi-thermometer-half',
  ];

  close(): void {
    this.opened = false;
    this.openedChange.emit(this.opened);
    this.onClose.emit();
  }

  closeIconModal(): void {
    this.iconModalOpen = false;
  }

  closeColorModal(): void {
    this.colorModalOpen = false;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.closeColorModal();
  }

  changeColor(): void {
    this.colorModalOpen = true;
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.closeIconModal();
  }

  changeIcon(): void {
    this.iconModalOpen = true;
  }
}
