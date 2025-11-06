import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AccountService } from '../../../core/services/account-service';
import { RegisterCredentials } from '../../../Types/User';

@Component({
  selector: 'app-register',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<Register, any>);
  private accountService = inject(AccountService);

  public hidePassword = signal(true);
  public submitting = signal(false);

  public registerForm = this.formBuilder.group({
    email: ['', [Validators.required]],
    displayName: ['', [Validators.required]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
  });

  constructor() {
    const getPassword = () => this.registerForm.get('password');
    const confirm = this.registerForm.get('confirmPassword');
    confirm?.addValidators(this.match(getPassword));
    this.registerForm
      .get('password')
      ?.valueChanges.subscribe(() => confirm?.updateValueAndValidity());
  }

  public submitRegisterForm(): void {
    if (this.registerForm.invalid) return;

    this.submitting.set(true);
    // Send payload to API
    const { confirmPassword, ...payload } = this.registerForm.value;
    this.accountService.register(payload as RegisterCredentials).subscribe({
      next: (response) => {
        console.log(response);
        this.dialogRef.close(payload);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('User completed registration.');
      },
    });
  }

  public closeRegisterForm(): void {
    this.dialogRef.close();
  }

  private match(other: () => AbstractControl | null) {
    return (control: AbstractControl): ValidationErrors | null => {
      const otherCtrl = other();
      if (!otherCtrl) return null;
      return control.value === otherCtrl.value ? null : { mismatch: true };
    };
  }
}
