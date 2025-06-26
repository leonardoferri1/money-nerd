import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import localeEn from '@angular/common/locales/en';

registerLocaleData(localePt, 'pt');
registerLocaleData(localeEn, 'en');

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
