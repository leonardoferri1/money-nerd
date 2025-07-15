import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-month-select',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonthSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './month-select.component.html',
  styleUrl: './month-select.component.scss',
})
export class MonthSelectComponent implements ControlValueAccessor {
  @Input() options: (string | number)[] = [];
  @Input() selected: string | number | null = null;
  @Input() placeholder: string = 'Selecionar mês';
  @Input() dropdownDirection: 'up' | 'down' = 'down';
  @Input() isReadonly: boolean = false;
  @Input() invalid: boolean = false;

  @Output() selectedChange = new EventEmitter<string | number>();

  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  isOpen = false;
  onChange: any = () => {};
  onTouched: any = () => {};

  readonly monthKeys = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  constructor(
    private elementRef: ElementRef,
    private translate: TranslateService
  ) {}

  getTranslatedMonth(value: string | number | null): string {
    if (value === null || value === undefined || isNaN(+value)) {
      return '';
    }
    const monthKey = this.monthKeys[+value];
    return this.translate.instant(`MONTHS.${monthKey}`);
  }

  writeValue(value: any): void {
    this.selected = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggleDropdown(event: Event) {
    if (this.isReadonly) return;
    event.stopPropagation();
    this.isOpen = !this.isOpen;

    setTimeout(() => {
      if (!this.dropdownMenu?.nativeElement) return;

      const rect = this.dropdownMenu.nativeElement.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom;
      const above = rect.top;

      if (this.dropdownDirection === 'down' && below < rect.height) {
        this.dropdownDirection = 'up';
      } else if (this.dropdownDirection === 'up' && above < rect.height) {
        this.dropdownDirection = 'down';
      }
    });
  }

  selectMonth(month: string | number) {
    this.selected = month;
    this.isOpen = false;
    this.onChange(month);
    this.onTouched();
    this.selectedChange.emit(month);
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
