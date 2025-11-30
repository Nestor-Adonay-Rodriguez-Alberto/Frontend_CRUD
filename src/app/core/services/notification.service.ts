import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.open(message, ['snackbar-success']);
  }

  error(message: string): void {
    this.open(message, ['snackbar-error']);
  }

  info(message: string): void {
    this.open(message, ['snackbar-info']);
  }

  private open(message: string, panelClass: string[]): void {
    const config: MatSnackBarConfig = {
      duration: 3500,
      panelClass,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    };

    this.snackBar.open(message, 'Cerrar', config);
  }
}
