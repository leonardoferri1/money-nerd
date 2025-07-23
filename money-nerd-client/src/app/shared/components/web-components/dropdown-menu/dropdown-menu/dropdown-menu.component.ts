import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatTooltipModule],
  styleUrls: ['./dropdown-menu.component.scss'],
})
export class DropdownMenuComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() selectedItem: string | null = null;
  @Input() opened: boolean = false;
  @Input() disabled: boolean = false;
  isSmallScreen: boolean = false;

  @Output() valueChange = new EventEmitter<any>();
  @Output() closeChange = new EventEmitter<any>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.close();
    }
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 1100;
  }

  selectOption(option: any) {
    this.selectedItem = option;
    this.valueChange.emit(option);
  }

  close() {
    this.opened = false;
    this.closeChange.emit(false);
  }
}
