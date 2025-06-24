import { Component, OnInit } from '@angular/core';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { TransactionsService } from './transactions.service';
import { TransactionsTableComponent } from './transactions-table/transactions-table.component';
import { Column } from '../../shared/interfaces/ITabela';
import { NewTransactionModalComponent } from '../../shared/components/new-transaction-modal/new-transaction-modal.component';
import { ModalOverlayService } from '../../shared/services/modalOverlay.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [TransactionsTableComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  editTransactionModal: boolean = false;
  transactionEditId!: string;
  transactionEditType!: 1 | 2;

  constructor(
    private transactionsService: TransactionsService,
    private snackBar: SnackbarService,
    private translate: TranslateService,
    private modalOverlayService: ModalOverlayService
  ) {}

  ngOnInit() {
    this.kickstart();
  }

  async kickstart() {
    await this.getAllTransactions();
  }

  async getAllTransactions() {
    this.transactionsService.getAllTransactions().subscribe({
      next: (response) => {
        this.transactions = response.sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  editTransaction(transaction: any) {
    const type = transaction.type === 'Income' ? 1 : 2;
    const id = transaction._id;

    this.modalOverlayService.openModal(NewTransactionModalComponent, {
      transactionType: type,
      transactionId: id,
      type: 'edit',
      opened: true,
    });
  }
}
