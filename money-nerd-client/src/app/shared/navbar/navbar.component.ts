import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { TranslationService } from '../services/translation.service';
import { DropdownComponent } from '../components/web-components/dropdown-menu/dropdown/dropdown.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

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
export class NavbarComponent {
  currentLang: any;
  optionsLang = [
    { id: 'en', name: 'English (en)' },
    { id: 'pt', name: 'Português (pt-BR)' },
  ];

  constructor(private translation: TranslationService) {
    this.currentLang = this.translation.currentLang;
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
