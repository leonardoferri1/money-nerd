import { CommonModule, NgIf, NgStyle } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { DropdownService } from '../service/dropdown.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgStyle],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent implements ControlValueAccessor {
  @Input() _options: any[] = [];
  @Input() placeholder: string = '';
  @Input() multiSelect: boolean = false;
  @Input() icon: string = '';
  @Input() selectedValue: any = null;
  @Input() labelField: string = '';
  @Input() valueField: string = '';

  @Input() isReadonly: boolean = false;
  @Input() dropdownDirection: 'up' | 'down' = 'down';
  @Input() invalidValidator: boolean = false;
  @Input() semResultado: string = 'Nenhum resultado encontrado.';

  @Input()
  set options(value: any[]) {
    this._options = value ?? [];
    this.filteredOptions = [...this._options];
    this.tryResolveSelectedValue();
  }

  @Output() valueChange = new EventEmitter<any>();
  @Output() onKeyUp = new EventEmitter<any>();

  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  @ViewChild('inputField') inputField!: ElementRef;

  isOpen = false;
  filteredOptions: any[] = [];
  searchQuery: string = '';
  get options() {
    return this._options;
  }
  private internalFormValue: any = null;
  private keyupSubject = new Subject<string>();
  private onTouched!: () => void;
  private onChange!: (value: any) => void;

  constructor(
    private elementRef: ElementRef,
    private dropdownService: DropdownService
  ) {}

  ngOnInit() {
    this.filteredOptions = [...this.options];

    this.keyupSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.onKeyUp.emit(value);
      });
  }

  toggleDropdown(event: Event) {
    if (!this.isReadonly) {
      event.stopPropagation();

      if (!this.isOpen) {
        this.dropdownService.setActiveDropdown(this);
      } else {
        this.dropdownService.clearActiveDropdown(this);
      }

      this.isOpen = !this.isOpen;

      if (this.isOpen) {
        this.filteredOptions = [...this.options];

        if (this.filteredOptions.length == 0) {
          this.filteredOptions = [
            { id: '0', name: 'Nenhum resultado encontrado' },
          ];
        }

        setTimeout(() => {
          if (!this.dropdownMenu || !this.dropdownMenu.nativeElement) {
            return;
          }

          const dropdownRect =
            this.dropdownMenu.nativeElement.getBoundingClientRect();
          const spaceBelow = window.innerHeight - dropdownRect.bottom;
          const spaceAbove = dropdownRect.top;

          if (
            this.dropdownDirection === 'down' &&
            spaceBelow < dropdownRect.height
          ) {
            this.dropdownDirection = 'up';
          } else if (
            this.dropdownDirection === 'up' &&
            spaceAbove < dropdownRect.height
          ) {
            this.dropdownDirection = 'down';
          }
        });
      }
    }
  }

  selectOption(option: any) {
    this.invalidValidator = false;
    this.selectedValue = option;
    this.searchQuery = option[this.labelField];
    this.isOpen = false;
    this.onChange(option);
    this.valueChange.emit(option);
    this.dropdownService.clearActiveDropdown(this);
  }

  onInputFocus() {
    if (!this.isReadonly) {
      this.isOpen = true;
      this.searchQuery = '';
      this.filterOptions();
      this.onChange(null);
      this.dropdownService.setActiveDropdown(this);
    }
  }

  filterOptions() {
    this.filteredOptions = this.options.filter((option) =>
      option[this.labelField]
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase())
    );
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.dropdownService.clearActiveDropdown(this);
    }
  }

  writeValue(value: any): void {
    this.internalFormValue = value;

    // Always try to resolve from options, now or later.
    this.tryResolveSelectedValue();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onQueryChange(event: any): void {
    const value = event?.target?.value?.trim();
    if (value !== undefined) {
      this.searchQuery = value;
      this.filterOptions();
      this.keyupSubject.next(value);
    }
  }

  close() {
    this.isOpen = false;
  }

  private tryResolveSelectedValue(): void {
    if (!this._options?.length || this.internalFormValue === null) return;

    const match = this._options.find(
      (option) => option[this.valueField] === this.internalFormValue
    );

    if (match) {
      this.selectedValue = match;
      this.searchQuery = match[this.labelField];
      this.valueChange.emit(this.selectedValue);
    }
  }
}
