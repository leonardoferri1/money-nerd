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

@Component({
  selector: 'app-year-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YearSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './year-select.component.html',
  styleUrl: './year-select.component.scss',
})
export class YearSelectComponent implements ControlValueAccessor {
  @Input() options: number[] = [];
  @Input() selected: number | null = null;
  @Input() dropdownDirection: 'up' | 'down' = 'down';
  @Input() isReadonly: boolean = false;
  @Input() invalid: boolean = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  @Output() selectedChange = new EventEmitter<number>();

  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

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

  selectYear(year: number) {
    this.selected = year;
    this.isOpen = false;
    this.onChange(year);
    this.onTouched();
    this.selectedChange.emit(year);
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
