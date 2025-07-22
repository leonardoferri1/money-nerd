import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root',
})
export class MasksService {
  constructor(private translationService: TranslationService) {}

  formatCurrencyPerLanguage(value: number): string {
    const locale = this.translationService.currentLang === 'pt' ? 'pt' : 'en';
    const currencyCode = locale === 'pt' ? 'BRL' : 'USD';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  }

  formatarMoeda(value: number | string): string {
    if (!value && value !== 0) {
      return '';
    }

    if (value === 0) {
      return 'R$ 0,00';
    }

    const amount = parseFloat(value.toString());
    const formattedAmount = amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return formattedAmount;
  }

  formatarData(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    const datePipe = new DatePipe('pt-BR');
    const formattedDate = datePipe.transform(date, 'dd/MM/yyyy') || '';

    return formattedDate;
  }

  formatarDataHora(value: string): string {
    const date = new Date(value);
    const datePipe = new DatePipe('pt-BR');
    const formattedDate =
      datePipe.transform(date, 'dd/MM/yyyy - HH:mm:ss') || '';

    return formattedDate;
  }
}
