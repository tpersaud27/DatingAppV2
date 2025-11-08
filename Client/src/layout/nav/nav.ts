import { Component, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  public accountService = inject(AccountService);

  public loginForm!: FormGroup;
  public showPassword = false;

  public ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  public login(): void {
    if (this.loginForm.invalid) return;

    const userCredentials = this.loginForm.value;
    this.accountService.login(userCredentials).subscribe({
      next: () => {
        // After the user logs in we navigate them to the members page
        this.router.navigateByUrl('/members');
        this.snackBar.open('Successfully logged in', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      },
      error: (error) => {
        this.snackBar.open(`Error: ${error.error}`, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      },
      complete: () => console.log('Completed the login http request'),
    });
  }

  public logout(): void {
    // Clear form after user logging out
    this.loginForm.reset();
    // Remove user from local storage
    this.accountService.logout();
    // Redirect user to home screen after logging out
    this.router.navigateByUrl('/');
    this.snackBar.open('Successfully logged out', 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
