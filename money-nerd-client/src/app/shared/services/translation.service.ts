import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  supportedLangs = ['en', 'pt'];
  defaultLang = 'en';

  constructor(private translate: TranslateService) {
    this.translate.addLangs(this.supportedLangs);

    const savedLang = localStorage.getItem('app-lang');
    const browserLang = this.translate.getBrowserLang();

    const langToUse =
      savedLang && this.supportedLangs.includes(savedLang)
        ? savedLang
        : browserLang && this.supportedLangs.includes(browserLang)
        ? browserLang
        : this.defaultLang;

    this.use(langToUse);
  }

  use(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('app-lang', lang);
  }

  get currentLang() {
    return this.translate.currentLang;
  }

  instant(key: string, params?: Object): string {
    return this.translate.instant(key, params);
  }

  get(key: string, params?: Object) {
    return this.translate.get(key, params);
  }
}
