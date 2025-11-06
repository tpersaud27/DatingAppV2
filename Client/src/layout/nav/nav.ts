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
  ],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  private formBuilder = inject(FormBuilder);
  private accountService = inject(AccountService);

  public loggedIn = signal(false);
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
      next: (response) => {
        this.loggedIn.set(true);
      },
      error: (error) => {
        alert(error.message);
      },
      complete: () => console.log('Completed the login http request'),
    });
  }

  public logout(): void {
    // Clear form after user logging out
    this.loginForm.reset();
    this.loggedIn.set(false);
  }
}
