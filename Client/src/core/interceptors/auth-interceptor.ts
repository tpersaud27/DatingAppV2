import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../services/account-service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  //   const accountService = inject(AccountService);
  //   const user = accountService.currentUser();

  //   // Before we send the request, we need to add our token information
  //   if (user) {
  //     req = req.clone({
  //       setHeaders: {
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     });
  //   }

  //   return next(req);

  // ✅ Only attach auth to your .NET API host
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  if (!isApiRequest) {
    return next(req);
  }

  const accessToken = sessionStorage.getItem('access_token');

  if (!accessToken) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
};
