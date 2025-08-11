import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  public openSnackbar(
    message: string,
    action: string = 'Close',
    duration: number = 5000,
    panelClass: string[] = ['default-snackbar']
  ): void {
    const config: MatSnackBarConfig = {
      duration: duration,
      panelClass: panelClass,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    };

    this.snackBar.open(message, action, config);
  }

  public openErrorSnackbar(message: string): void {
    this.openSnackbar(message, 'Close', 5000, ['error-snackbar']);
  }

  public openSuccessSnackbar(message: string): void {
    this.openSnackbar(message, 'Close', 5000, ['success-snackbar']);
  }
}
