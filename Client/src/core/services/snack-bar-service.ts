import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackBar {
  private snackBar = inject(MatSnackBar);

  // Snackbar that opens with success background
  openSuccessSnackBar() {
    this.snackBar.open('Login Successful', 'OK', {
      duration: 3000,
      panelClass: ['green-snackbar'],
    });
  }
  //Snackbar that opens with failure background
  openFailureSnackBar() {
    this.snackBar.open('Invalid Login Credentials', 'Try again!', {
      duration: 3000,
      panelClass: ['red-snackbar'],
    });
  }

  openSuccessfullyRegisteredSnackBar() {
    this.snackBar.open('Successfully registered', 'OK', {
      duration: 3000,
      panelClass: ['green-snackbar'],
    });
  }

  openLogoutSnackBar() {
    this.snackBar.open('Logged Out Successful', 'OK', {
      duration: 3000,
      panelClass: ['green-snackbar'],
    });
  }

  openErrorSnackBar(errorMessage: string, action: string) {
    this.snackBar.open(errorMessage, action, {
      duration: 3000,
      panelClass: ['red-snackbar'],
    });
  }

  openGenericSuccessSnackBar(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: ['green-snackbar'],
    });
  }
}
