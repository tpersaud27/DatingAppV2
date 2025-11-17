import { CanActivateFn } from '@angular/router';
import { AccountService } from '../services/account-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const snackBar = inject(MatSnackBar);

  if (accountService.currentUser()) {
    return true;
  } else {
    snackBar.open('Invalid route access', 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
    return false;
  }
};
