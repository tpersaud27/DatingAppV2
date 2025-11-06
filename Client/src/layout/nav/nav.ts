import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);

  public loginForm!: FormGroup;
  public showPassword = false;

  public ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  public login(): void {
    if (this.loginForm.invalid) return;

    const userCredentials = this.loginForm.value;
    this.accountService.login(userCredentials).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        alert(error.message);
      },
      complete: () => console.log('Completed the http request'),
    });
  }
}
