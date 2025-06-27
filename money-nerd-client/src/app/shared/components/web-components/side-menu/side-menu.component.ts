import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    MatButtonModule,
    NgIf,
    NgTemplateOutlet,
    NgClass,
    MatTooltipModule,
  ],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
})
export class SidemenuComponent {
  @Input() opened = false;
  @Input() tooltip = 'Fechar';
  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onMenuClose = new EventEmitter<Event>();

  close() {
    this.opened = false;
    this.openedChange.emit(this.opened);
  }

  onMenuCloseEvent(event: Event): void {
    this.onMenuClose.emit(event);
  }
}
