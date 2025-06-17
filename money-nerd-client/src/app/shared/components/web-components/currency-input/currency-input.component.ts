import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@Component({
  selector: 'currency-input',
  standalone: true,
  imports: [CommonModule, CurrencyMaskModule, FormsModule],
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputComponent),
      multi: true,
    },
  ],
})
export class CurrencyInputComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() allowNegativeValue: boolean = false;
  @Input() prefix: string = '';
  @Input() isReadonly: boolean = false;
  @Input() theme: string = '';

  @Output() valueChange = new EventEmitter<number>();

  value: number | null = 0;

  onTouched: () => void = () => {};
  onChange: (value: number) => void = () => {};

  writeValue(value: number): void {
    this.value = value ?? 0;
  }

  onFocus() {
    if (this.value == 0) {
      this.value = null;
    }
  }

  onFocusOut() {
    if (this.value == null) {
      this.value = 0;
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInputChange(value: number): void {
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }
}
