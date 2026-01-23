import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCredentials, OnboardingRequest, RegisterCredentials, User } from '../../Types/User';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesServices } from './likes-services';
import { MatDialog } from '@angular/material/dialog';
import { Onboarding } from '../../features/account/onboarding/onboarding';
import { SnackBar } from './snack-bar-service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  public currentUser = signal<User | null>(null);

  private likesService = inject(LikesServices);
  private http = inject(HttpClient);
  private snackBarService = inject(SnackBar);
  private dialog = inject(MatDialog);
  private baseUrl = environment.apiUrl;

  public bootstrapUser(): void {
    this.http.post<User>(this.baseUrl + 'account/bootstrap', {}).subscribe((user) => {
      this.setCurrentUser(user);
      console.log('Current User ', this.currentUser());
      if (!this.currentUser()?.onboardingComplete) {
        console.log('User onboarding not complete');
        this.showUserOnboading();
      }
    });
  }

  public completeOnboarding(onboardingRequest: OnboardingRequest): Observable<void> {
    return this.http.put<void>(this.baseUrl + 'account/onboarding', onboardingRequest);
  }

  // NO LONGER USED AFTER SWITCHING TO COGNITO
  public register(registerCredentials: RegisterCredentials) {
    // After user is register we need to log them in
    return this.http.post<User>(this.baseUrl + 'account/register', registerCredentials).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  // NO LONGER USED AFTER SWITCHING TO COGNITO
  public login(userCredentials: LoginCredentials) {
    return this.http.post<User>(this.baseUrl + 'account/login', userCredentials).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  public logout(): void {
    // Remove user from local storage
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.likesService.clearLikeIds();
  }

  public setCurrentUser(user: User): void {
    // Store user into local storage
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.likesService.getLikeIds().subscribe();
  }

  public showUserOnboading(): void {
    this.dialog
      .open(Onboarding, {
        width: '560px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((data: any) => {
        if (data) {
          this.snackBarService.openSuccessfullyRegisteredSnackBar();
        }
      });
  }
}
