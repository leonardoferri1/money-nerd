import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, NgClass, TranslateModule],
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
export class DatePickerComponent {
  @Input() value: Date | null = null;
  @Output() valueChange = new EventEmitter<Date>();

  showCalendar = false;
  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  weekdays: string[] = ['Do', '2ª', '3ª', '4ª', '5ª', '6ª', 'Sá'];
  constructor(private elementRef: ElementRef) {}

  get calendarColumns(): (Date | null)[][] {
    const columns: (Date | null)[][] = Array.from({ length: 7 }, () => []);

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const startDay = firstDay.getDay(); // 0 (domingo) a 6 (sábado)

    const days: (Date | null)[] = [];

    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    const date = new Date(this.currentYear, this.currentMonth, 1);
    while (date.getMonth() === this.currentMonth) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    // Distribui os dias por coluna (domingo a sábado)
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
