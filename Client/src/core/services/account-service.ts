import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { OnboardingRequest, User } from '../../Types/User';
import { catchError, finalize, mapTo, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesServices } from './likes-services';
import { MatDialog } from '@angular/material/dialog';
import { Onboarding } from '../../features/account/onboarding/onboarding';
import { SnackBar } from './snack-bar-service';
import { MemberService } from './member-service';
import { MessagesSocketService } from './messages-socket-service';
import { AuthService } from './auth-service';
import { LoadingService } from './loading-service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private likesService = inject(LikesServices);
  private http = inject(HttpClient);
  private snackBarService = inject(SnackBar);
  private dialog = inject(MatDialog);
  private memberService = inject(MemberService);
  private messageSocketService = inject(MessagesSocketService);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);

  public currentUser = signal<User | null>(null);
  private baseUrl = environment.apiUrl;

  public bootstrapUser$(): Observable<void> {
    return this.http.post<User>(this.baseUrl + 'account/bootstrap', {}).pipe(
      tap((user) => {
        this.setCurrentUser(user);

        if (!user.onboardingComplete) {
          this.showUserOnboading();
        }
      }),
      switchMap((user) => this.memberService.getMember(user.id)),
      tap((member) => {
        const current = this.currentUser();
        if (!current) return;

        this.setCurrentUser({
          ...current,
          imageUrl: member.imageUrl,
        });
      }),
      mapTo(void 0),
      // don't break the callback page if bootstrap fails
      catchError(() => of(void 0)),
    );
  }

  public completeOnboarding(onboardingRequest: OnboardingRequest): Observable<void> {
    return this.http.put<void>(this.baseUrl + 'account/onboarding', onboardingRequest);
  }

  public logOut(): void {
    // Remove user from local storage
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.likesService.clearLikeIds();
    this.messageSocketService.onDisconnect();
    this.authService.signOutWithHostedUI();
  }

  public setCurrentUser(user: User): void {
    // Store user into local storage
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.likesService.getLikeIds().subscribe();
    this.messageSocketService.onConnect();
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
