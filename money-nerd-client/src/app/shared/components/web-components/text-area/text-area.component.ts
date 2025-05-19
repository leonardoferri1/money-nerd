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
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'text-area',
  templateUrl: './text-area.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  styleUrls: ['./text-area.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextAreaComponent),
      multi: true,
    },
    provideNgxMask(),
  ],
})
export class TextAreaComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() maxLength!: number;
  @Input() isReadonly: boolean = false;
  @Input() disabled!: boolean;
  @Input() rows: number = 3;
  @Input() cols: number = 30;
  @Input() invalidValidator: boolean = false;

  @Output() valueChange = new EventEmitter<string | null>();

  value: string | null = '';

  onTouched: () => void = () => {};
  onChange: (value: string | null) => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInputChange(value: string): void {
    this.invalidValidator = false;
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }
}
