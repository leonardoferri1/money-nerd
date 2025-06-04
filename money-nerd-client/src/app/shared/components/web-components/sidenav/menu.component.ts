import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    MatMenuModule,
    MatButtonModule,
    NgIf,
    NgTemplateOutlet,
    NgClass,
    MatTooltipModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  @Input() opened = true;
  @Input() tooltip = 'Fechar';
  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onNavClose = new EventEmitter<Event>();

  toggle() {
    this.opened = !this.opened;
    this.openedChange.emit(this.opened);
  }

  onNavCloseEvent(event: Event): void {
    this.onNavClose.emit(event);
  }
}
