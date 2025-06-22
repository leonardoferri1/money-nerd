import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '../dropdown-menu/dropdown/dropdown.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { YearSelectComponent } from './year-select/year-select.component';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    TranslateModule,
    DropdownComponent,
    FormsModule,
    YearSelectComponent,
  ],
  templateUrl: './date-picker.component.html',
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)' }),
        animate(
          '150ms ease',
          style({ opacity: 1, transform: 'translate(-50%, -50%) scale(1)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms ease',
          style({ opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)' })
        ),
      ]),
    ]),
  ],
  styleUrls: ['./date-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DatePickerComponent implements OnInit {
  @Input() value: Date | null = null;
  @Input() theme: string = '';
  @Output() valueChange = new EventEmitter<Date>();
  years: number[] = [];
  showCalendar = false;
  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  weekdays: string[] = ['Do', '2ª', '3ª', '4ª', '5ª', '6ª', 'Sá'];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    const startYear = 2000;
    for (let y = currentYear; y >= startYear; y--) {
      this.years.push(y);
    }
  }

  get calendarColumns(): (Date | null)[][] {
    const columns: (Date | null)[][] = Array.from({ length: 7 }, () => []);

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const startDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    const date = new Date(this.currentYear, this.currentMonth, 1);
    while (date.getMonth() === this.currentMonth) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    days.forEach((day, index) => {
      const columnIndex = index % 7;
      columns[columnIndex].push(day);
    });

    return columns;
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  selectDate(date: Date) {
    this.value = date;
    this.valueChange.emit(date);
    this.showCalendar = false;
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  formatDate(date: Date | null): string {
    return date ? date.toLocaleDateString('pt-BR') : '';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showCalendar = false;
    }
  }
}
