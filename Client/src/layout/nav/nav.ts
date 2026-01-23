import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SnackBar } from '../../core/services/snack-bar-service';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-nav',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  private router = inject(Router);
  private snackBarService = inject(SnackBar);
  public accountService = inject(AccountService);
  private authService = inject(AuthService);

  public ngOnInit(): void {
    // OLD LOGIN FORM
    // this.loginForm = this.formBuilder.group({
    //   email: ['', [Validators.required, Validators.email]],
    //   password: ['', Validators.required],
    // });
  }

  public async onLogin(): Promise<void> {
    await this.authService.signInWithHostedUI();

    // OLD LOGIN LOGIC
    // if (this.loginForm.invalid) return;

    // const userCredentials = this.loginForm.value;
    // this.accountService.login(userCredentials).subscribe({
    //   next: () => {
    //     // After the user logs in we navigate them to the members page
    //     this.router.navigateByUrl('/members');
    //     this.snackBarService.openSuccessSnackBar();
    //   },
    //   error: (error) => {
    //     this.snackBarService.openFailureSnackBar();
    //   },
    //   complete: () => console.log('Completed the login http request'),
    // });
  }

  public logout(): void {
    // Remove user from local storage
    this.accountService.logout();
    // Redirect user to home screen after logging out
    this.router.navigateByUrl('/');
    this.snackBarService.openLogoutSnackBar();
  }

  public editProfile(): void {
    this.router.navigate([`/members/${this.accountService.currentUser()?.id}/profile`]);
  }
}
