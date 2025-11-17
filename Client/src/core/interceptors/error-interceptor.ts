import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';
import { SnackBar } from '../services/snack-bar-service';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBarService = inject(SnackBar);

  return next(req).pipe(
    catchError((error) => {
      if (error) {
        switch (error.status) {
          case 400:
            snackBarService.openErrorSnackBar(error.error, 'Try again!');
            break;
          case 401:
            snackBarService.openErrorSnackBar('Unauthorized', 'Close');
            break;
          case 404:
            snackBarService.openErrorSnackBar('Not found', 'Close');
            break;
          case 500:
            snackBarService.openErrorSnackBar('Server error', 'Close');
            break;
          default:
            snackBarService.openErrorSnackBar('Something went wrong', 'Close');
            break;
        }
      }
      throw error;
    })
  );
};
