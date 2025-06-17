import { CommonModule, NgClass } from '@angular/common';
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
  selector: 'text-input',
  templateUrl: './text-input.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective, NgClass],
  styleUrls: ['./text-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
    provideNgxMask(),
  ],
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() maxLength!: number;
  @Input() isReadonly: boolean = false;
  @Input() mask: string = '';
  @Input() disabled!: boolean;
  @Input() type: string = 'text';
  @Input() invalidValidator: boolean = false;
  @Input() allowSpecial: boolean = false;
  @Input() theme: string = '';

  @Output() valueChange = new EventEmitter<string | null>();

  value: string | null = '';
  hide: boolean = true;

  onTouched: () => void = () => {};
  onChange: (value: string | null) => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  handleMaxLength() {
    if (this.type == 'number') {
      if (this.value) {
        this.value = this.value.slice(0, this.maxLength);
      }
    }
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

  onKeyPress(event: KeyboardEvent): void {
    if (this.allowSpecial == false) {
      const regex = /^[\p{L}\p{N}\s]$/u;
      if (!regex.test(event.key)) {
        event.preventDefault();
      }
    }
  }

  get inputType(): string {
    return this.type === 'password' && this.hide ? 'password' : 'text';
  }

  toggleVisibility(): void {
    this.hide = !this.hide;
  }
}
