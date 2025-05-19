import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MasksService {
  constructor() {}

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
