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
import { NewCategoryModalComponent } from '../category-modal/new-category-modal.component';
import { NewTransactionModalComponent } from '../new-transaction-modal/new-transaction-modal.component';
import { NewAccountModalComponent } from '../account-modal/new-account-modal.component';

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
    NewCategoryModalComponent,
    NewTransactionModalComponent,
    NewAccountModalComponent,
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
  isAccountModalOpen: boolean = false;
  isTransactionModalOpen: boolean = false;
  transactionModalType: 1 | 2 = 1;

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
    { id: 4, label: 'ACTIONS.ACCOUNT', icon: 'bi-bank', iconColor: 'purple' },
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
    if (item.id === 1) {
      this.isTransactionModalOpen = true;
      this.transactionModalType = 1;
    }

    if (item.id === 2) {
      this.isTransactionModalOpen = true;
      this.transactionModalType = 2;
    }

    if (item.id === 3) {
      this.isCategoryModalOpen = true;
    }

    if (item.id === 4) {
      this.isAccountModalOpen = true;
    }

    this.toggleDropdown();
  }
}
