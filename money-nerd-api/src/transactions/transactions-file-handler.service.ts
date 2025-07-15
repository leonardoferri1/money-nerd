import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './entities/transaction.entity';
import { Model } from 'mongoose';
import { TransactionType } from './enums/transaction-type.enum';
import { ParsedTransaction } from './interfaces/parsed-transaction.type';
import pdfParse from 'pdf-parse';
import csvParser from 'csv-parser';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class TransactionsFileHandlerService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionSchema: Model<Transaction>,
  ) {}

  async processFile(
    uploadedFile: Express.Multer.File,
  ): Promise<ParsedTransaction[]> {
    try {
      const ext = path.extname(uploadedFile.originalname).toLowerCase();
      const fileName = uploadedFile.originalname.toLowerCase();

      if (ext === '.pdf') {
        if (fileName.includes('itau')) {
          return await this.processItauPdf(uploadedFile.buffer);
        } else {
          return await this.processInterPdf(uploadedFile.buffer);
        }
      } else if (ext === '.csv') {
        return await this.processInterCsv(uploadedFile.buffer);
      } else {
        throw new BadRequestException('Unsupported file format');
      }
    } catch (error) {
      throw new BadRequestException('Error processing file.', { cause: error });
    }
  }

  private async processItauPdf(buffer: Buffer): Promise<ParsedTransaction[]> {
    const data = await pdfParse(buffer);
    const linhas = data.text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const transactions: ParsedTransaction[] = [];

    for (const linha of linhas) {
      const match = linha.match(
        /^(\d{2}\/\d{2}\/\d{4})(.*?)(-?\d{1,3}(?:\.\d{3})*,\d{2})$/,
      );
      if (match) {
        const [, dataStr, descricao, valorStr] = match;
        const valor = this.parseValue(valorStr);
        transactions.push({
          date: this.parseDate(dataStr),
          value: Math.abs(valor),
          type: valor >= 0 ? TransactionType.Income : TransactionType.Outcome,
          description: descricao.replace(/\d{2}\/\d{2}/g, '').trim(),
        });
      }
    }

    return transactions;
  }

  private async processInterPdf(buffer: Buffer): Promise<ParsedTransaction[]> {
    const data = await pdfParse(buffer);
    const linhas = data.text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const transactions: ParsedTransaction[] = [];

    let dataAtual: string | null = null;

    for (let linha of linhas) {
      linha = linha.replace(/-R\$ ([\d.,]+)R\$ .*/, '-$1');
      const dataMatch = linha.match(/^(\d{1,2} de \w+ de \d{4})/i);
      if (dataMatch) {
        dataAtual = this.converterExtenseDate(dataMatch[1]);
        continue;
      }

      const match = linha.match(/^[^:]+:\s+"(.*?)"\s*(-?R?\$?\s*[\d.,]+)/);

      if (dataAtual && match) {
        const [, descricao, valorStrRaw] = match;
        const valorStr = valorStrRaw.replace(/[R$\s]/g, '');
        const valor = this.parseValue(valorStr);

        transactions.push({
          date: this.parseDate(dataAtual),
          value: Math.abs(valor),
          type: valor >= 0 ? TransactionType.Income : TransactionType.Outcome,
          description: descricao.trim(),
        });
      }
    }

    return transactions;
  }

  private async processInterCsv(buffer: Buffer): Promise<ParsedTransaction[]> {
    const transactions: ParsedTransaction[] = [];

    try {
      const raw = buffer.toString('utf-8');

      const lines = raw.split('\n');
      const startIndex = lines.findIndex(
        (line) => line.includes('Data Lançamento') || line.includes('Data'),
      );

      if (startIndex === -1) {
        throw new BadRequestException('Cabeçalho do CSV não encontrado.');
      }

      const csvLines = lines.slice(startIndex);
      const csvData = csvLines.join('\n');

      return await new Promise<ParsedTransaction[]>((resolve, reject) => {
        Readable.from([csvData])
          .pipe(
            csvParser({
              separator: ';',
              mapHeaders: ({ header }) => header.trim(),
            }),
          )
          .on('data', (row: Record<string, string>) => {
            try {
              const dataStr = (row['Data Lançamento'] || row['Data]'])?.trim();
              const valorStr = row['Valor']?.trim();
              const descricao = row['Descrição']?.trim();
              if (dataStr && valorStr) {
                const valor = this.parseValue(valorStr);
                transactions.push({
                  date: this.parseDate(dataStr),
                  value: Math.abs(valor),
                  type:
                    valor >= 0
                      ? TransactionType.Income
                      : TransactionType.Outcome,
                  description: descricao || undefined,
                });
              }
            } catch (err) {
              console.warn('Error processing CSV line:', err);
            }
          })
          .on('end', () => resolve(transactions))
          .on('error', (err) => reject(err));
      });
    } catch (error) {
      throw new BadRequestException('Unable to process uploaded CSV', {
        cause: error,
      });
    }
  }

  private parseValue(value: string): number {
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  }

  private parseDate(dataStr: string): Date {
    const [dia, mes, ano] = dataStr.split('/');
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  }

  private converterExtenseDate(dataExtenso: string): string {
    const meses: Record<string, string> = {
      janeiro: '01',
      fevereiro: '02',
      março: '03',
      abril: '04',
      maio: '05',
      junho: '06',
      julho: '07',
      agosto: '08',
      setembro: '09',
      outubro: '10',
      novembro: '11',
      dezembro: '12',
    };
    const match = dataExtenso.match(/(\d{1,2}) de (\w+) de (\d{4})/i);
    if (!match) throw new Error('Data inválida: ' + dataExtenso);
    const [, dia, mes, ano] = match;
    const mesNum = meses[mes.toLowerCase()];
    return `${dia.padStart(2, '0')}/${mesNum}/${ano}`;
  }
}
