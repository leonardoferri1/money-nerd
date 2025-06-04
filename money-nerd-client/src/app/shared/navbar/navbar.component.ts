import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { TranslationService } from '../services/translation.service';
import { DropdownComponent } from '../components/web-components/dropdown-menu/dropdown/dropdown.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
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

  constructor(private translation: TranslationService, private router: Router) {
    this.currentLang = this.translation.currentLang;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
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
}
