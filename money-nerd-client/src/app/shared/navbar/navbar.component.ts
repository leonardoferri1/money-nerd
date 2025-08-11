import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { TranslationService } from '../services/translation.service';
import { DropdownComponent } from '../components/web-components/dropdown-menu/dropdown/dropdown.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ModalOverlayService } from '../services/modalOverlay.service';
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal.component';
import { Subscription } from 'rxjs';
import { ScreenService } from '../services/screen-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    DropdownComponent,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  currentLang: any;
  currentUser: any;
  optionsLang = [
    { id: 'en', name: 'English (en)' },
    { id: 'pt', name: 'Português (pt-BR)' },
  ];
  currentRoute: string = '';

  screenWidth: number = 0;
  private subscription = new Subscription();
  langDropdownMedia = 600;

  constructor(
    private translation: TranslationService,
    private router: Router,
    private authService: AuthService,
    private modalOverlayService: ModalOverlayService,
    private screenService: ScreenService
  ) {
    this.currentLang = this.translation.currentLang;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    this.screenWidth = this.screenService.currentWidth;
    this.subscription.add(
      this.screenService.screenWidth$.subscribe((width) => {
        this.screenWidth = width;
      })
    );
  }

  shouldHideElement(): boolean {
    const hiddenRoutes = ['/login', '/register'];
    return !hiddenRoutes.includes(this.currentRoute);
  }

  onLangSelect(lang: any) {
    if (lang.id) {
      this.translation.use(lang.id);
      this.currentLang = lang.id;
    } else {
      this.translation.use(lang);
      this.currentLang = lang;
    }
  }

  logout() {
    const { overlayRef, instance } = this.modalOverlayService.openModal(
      ConfirmationModalComponent,
      {
        title: 'CONFIRM_LOGOUT',
        showCloseButton: true,
        opened: true,
      }
    );

    instance.confirmed?.subscribe?.(() => {
      overlayRef.dispose();
      this.authService.logout();
    });

    instance.cancelled?.subscribe?.(() => {
      overlayRef.dispose();
    });
  }
}
