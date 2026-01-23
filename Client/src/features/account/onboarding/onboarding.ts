import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AccountService } from '../../../core/services/account-service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-onboarding',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatDialogModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<Onboarding, any>);
  private accountService = inject(AccountService);

  public submitting = signal(false);

  onboardingForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
    gender: ['', Validators.required],
    dateOfBirth: ['', [Validators.required, this.minAgeValidator(18)]],
    city: ['', Validators.required],
    country: ['', Validators.required],
  });

  constructor() {
    // This effect runs whenever the currentUser signal changes
    effect(() => {
      const user = this.accountService.currentUser();

      if (user && user.displayName) {
        // Use patchValue to update only the displayName
        this.onboardingForm.patchValue({
          displayName: user.displayName,
        });
      }
    });
  }

  public onSubmit() {
    this.submitting.set(true);

    if (this.onboardingForm.valid) {
      console.log('Form Data:', this.onboardingForm.getRawValue());
      this.dialogRef.close(this.onboardingForm.getRawValue());
    }
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  private minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // let required validator handle empty
      }

      const birthDate = new Date(control.value);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
    };
  }
}
