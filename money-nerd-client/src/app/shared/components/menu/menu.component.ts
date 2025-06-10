import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslationService } from '../../services/translation.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownMenuComponent } from '../web-components/dropdown-menu/menu/dropdown-menu.component';
import { CategoryModalComponent } from '../category-modal/category-modal.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    MatMenuModule,
    MatButtonModule,
    TranslateModule,
    RouterModule,
    NgIf,
    NgTemplateOutlet,
    NgClass,
    MatTooltipModule,
    DropdownMenuComponent,
    CategoryModalComponent,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  currentRoute: string = '';
  currentLang: any;
  showDropdown = false;
  selected: string | null = null;
  isCategoryModalOpen: boolean = false;
  items = [
    {
      id: 1,
      label: 'ACTIONS.INCOME',
      icon: 'bi-graph-up-arrow',
      iconColor: 'green',
    },
    {
      id: 2,
      label: 'ACTIONS.OUTCOME',
      icon: 'bi-graph-down-arrow',
      iconColor: 'red',
    },
    { id: 3, label: 'ACTIONS.CATEGORY', icon: 'bi-tags', iconColor: 'yellow' },
  ];
  openNewItemMenu: boolean = false;

  constructor(
    private translation: TranslationService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.currentLang = this.translation.currentLang;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  @Input() opened = false;
  @Output() openedChange = new EventEmitter<boolean>();
  @Output() onNavClose = new EventEmitter<Event>();

  toggle() {
    this.opened = !this.opened;
    this.openedChange.emit(this.opened);
  }

  shouldHideElement(): boolean {
    const hiddenRoutes = [
      '/login',
      '/email-verification',
      '/password-recovery',
    ];
    return !hiddenRoutes.includes(this.currentRoute);
  }

  onNavCloseEvent(event: Event): void {
    this.onNavClose.emit(event);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showDropdown = false;
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  newItemButtonClick(item: any) {
    if (item.id === 3) {
      this.isCategoryModalOpen = true;
    }

    this.toggleDropdown();
  }
}
