import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'number-input',
  templateUrl: './number-input.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./number-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
})
export class NumberInputComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() maxLength!: number;
  @Input() isReadonly: boolean = false;
  @Input() disabled!: boolean;
  @Input() invalidValidator: boolean = false;

  @Output() valueChange = new EventEmitter<string | null>();

  value: string | null = '';

  onTouched: () => void = () => {};
  onChange: (value: string | null) => void = () => {};

  writeValue(value: string | number | null): void {
    if (value !== null && value !== undefined) {
      const strValue = String(value);
      this.value = strValue.replace(/\D/g, '');
    } else {
      this.value = '';
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onKeyPress(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    const inputElement = event.target as HTMLInputElement;

    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return;
    }

    if (inputElement.value.length >= this.maxLength) {
      event.preventDefault();
    }
  }

  onInputChange(event: Event): void {
    this.invalidValidator = false;
    const inputElement = event.target as HTMLInputElement;
    let numericValue = inputElement.value.replace(/\D/g, '');

    if (this.maxLength && numericValue.length > this.maxLength) {
      numericValue = numericValue.substring(0, this.maxLength);
    }

    this.value = numericValue;
    this.onChange(numericValue || null);
    this.valueChange.emit(numericValue || null);

    inputElement.value = numericValue;
  }
}
