import { CanActivateFn } from '@angular/router';
import { AccountService } from '../services/account-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { inject } from '@angular/core';
import { SnackBar } from '../services/snack-bar';

export const authGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const snackBarService = inject(SnackBar);

  if (accountService.currentUser()) {
    return true;
  } else {
    snackBarService.openFailureSnackBar();
    return false;
  }
};
