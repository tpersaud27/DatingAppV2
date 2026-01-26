import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { OnboardingRequest, User } from '../../Types/User';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesServices } from './likes-services';
import { MatDialog } from '@angular/material/dialog';
import { Onboarding } from '../../features/account/onboarding/onboarding';
import { SnackBar } from './snack-bar-service';
import { MemberService } from './member-service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private likesService = inject(LikesServices);
  private http = inject(HttpClient);
  private snackBarService = inject(SnackBar);
  private dialog = inject(MatDialog);
  private memberService = inject(MemberService);

  public currentUser = signal<User | null>(null);
  private baseUrl = environment.apiUrl;

  public bootstrapUser(): void {
    this.http
      .post<User>(this.baseUrl + 'account/bootstrap', {})
      .pipe(
        tap((user) => {
          this.setCurrentUser(user);

          if (!user.onboardingComplete) {
            this.showUserOnboading();
          }
        }),
        switchMap((user) => {
          // If onboarding isn't complete, member might not have imageUrl yet
          // You can still fetch it, but often unnecessary.
          return this.memberService.getMember(user.id);
        }),
        tap((member) => {
          // Update user state immutably
          const current = this.currentUser();
          if (!current) return;

          this.setCurrentUser({
            ...current,
            imageUrl: member.imageUrl,
          });

          console.log('Current User ', this.currentUser());
        }),
      )
      .subscribe();
  }

  public completeOnboarding(onboardingRequest: OnboardingRequest): Observable<void> {
    return this.http.put<void>(this.baseUrl + 'account/onboarding', onboardingRequest);
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

  // NO LONGER USED AFTER SWITCHING TO COGNITO
  // public register(registerCredentials: RegisterCredentials) {
  //   // After user is register we need to log them in
  //   return this.http.post<User>(this.baseUrl + 'account/register', registerCredentials).pipe(
  //     tap((user) => {
  //       if (user) {
  //         this.setCurrentUser(user);
  //       }
  //     }),
  //   );
  // }

  // NO LONGER USED AFTER SWITCHING TO COGNITO
  // public login(userCredentials: LoginCredentials) {
  //   return this.http.post<User>(this.baseUrl + 'account/login', userCredentials).pipe(
  //     tap((user) => {
  //       if (user) {
  //         this.setCurrentUser(user);
  //       }
  //     }),
  //   );
  // }
}
