import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { DropdownService } from '../service/dropdown.service';

@Component({
  selector: 'multiselect',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiselectComponent),
      multi: true,
    },
  ],
})
export class MultiselectComponent implements ControlValueAccessor, OnInit {
  @Input() options: any[] = [];
  @Input() placeholder: string = 'Select options';
  @Input() labelField: string = '';
  @Input() valueField: string = '';
  @Input() isReadonly: boolean = false;
  @Input() multiselectDirection: 'up' | 'down' = 'down';
  @Input() invalidValidator: boolean = false;
  @Input() semResultado: string = 'Nenhum resultado encontrado.';

  @Output() valueChange = new EventEmitter<any[]>();

  @ViewChild('multiselectMenu') multiselectMenu!: ElementRef;
  @ViewChild('multiInputField') multiInputField!: ElementRef;

  isOpen = false;
  filteredOptions: any[] = [];
  selectedValues: any[] = [];
  searchQuery: string = '';
  selectAllOn: boolean = false;
  private onTouched!: () => void;
  private onChange!: (value: any) => void;

  constructor(
    private elementRef: ElementRef,
    private dropdownService: DropdownService
  ) {}

  ngOnInit() {
    this.filteredOptions = [...this.options];
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.searchQuery = '';
      this.filteredOptions = [...this.options];
      this.dropdownService.setActiveDropdown(this);
    } else {
      this.dropdownService.clearActiveDropdown(this);
    }
  }

  selectOption(option: any) {
    this.invalidValidator = false;

    const index = this.selectedValues.findIndex(
      (item) => item[this.valueField] === option[this.valueField]
    );

    if (index === -1) {
      this.selectedValues.push(option);
    } else {
      this.selectedValues.splice(index, 1);
    }
    this.updateSelectAllState();

    this.onChange(this.selectedValues);
    this.valueChange.emit(this.selectedValues);
  }

  selectAll() {
    this.invalidValidator = false;

    if (this.selectedValues.length === this.options.length) {
      this.selectedValues = [];
    } else {
      this.selectedValues = [...this.options];
    }
    this.updateSelectAllState();
    this.updateSelection();
  }

  updateSelectAllState() {
    if (this.selectedValues.length != this.options.length) {
      this.selectAllOn = false;
    } else if (this.selectedValues.length === this.options.length) {
      this.selectAllOn = true;
    }
  }

  updateSelection() {
    this.onChange(this.selectedValues);
    this.valueChange.emit(this.selectedValues);
  }

  isSelected(option: any): boolean {
    return this.selectedValues.some(
      (item) => item[this.valueField] === option[this.valueField]
    );
  }

  getDisplayText(): string {
    if (!this.selectedValues.length) {
      return '';
    }

    const labels = this.selectedValues.map((item) => item[this.labelField]);
    const displayLimit = 2;

    if (labels.length > displayLimit) {
      return `${labels.slice(0, displayLimit).join(', ')} (+${
        labels.length - displayLimit
      })`;
    }

    return labels.join(', ');
  }

  onInputFocus() {
    this.isOpen = true;
    this.filterOptions();
    this.dropdownService.setActiveDropdown(this);
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

  writeValue(value: any[]): void {
    this.selectedValues = value || [];
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  close() {
    this.isOpen = false;
  }
}
