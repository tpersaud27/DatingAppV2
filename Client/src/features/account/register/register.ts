import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AccountService } from '../../../core/services/account-service';
import { RegisterCredentials, RegisterDTO } from '../../../Types/User';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-register',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatStepperModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<Register, any>);
  private accountService = inject(AccountService);

  public hidePassword = signal(true);
  public submitting = signal(false);

  public registerForm: FormGroup = this.formBuilder.group({});
  public profileDetailsForm: FormGroup = this.formBuilder.group({});

  constructor() {
    this.initializeRegisterForm();
    this.intializeProfileDetailsForm();
  }

  public initializeRegisterForm(): void {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });

    const getPassword = () => this.registerForm.get('password');
    const confirm = this.registerForm.get('confirmPassword');
    confirm?.addValidators(this.match(getPassword));
    this.registerForm
      .get('password')
      ?.valueChanges.subscribe(() => confirm?.updateValueAndValidity());
  }

  public intializeProfileDetailsForm(): void {
    this.profileDetailsForm = this.formBuilder.group({
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required, this.minAgeValidator(18)]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
    });
  }

  public onSubmitRegisterForm(): void {
    if (this.registerForm.invalid || this.profileDetailsForm.invalid) return;

    this.submitting.set(true);
    // Send payload to API
    const { confirmPassword, ...registerCredentials } = this.registerForm.value;
    const { ...profileDetails } = this.profileDetailsForm.value;
    const payload = { ...registerCredentials, ...profileDetails };

    this.accountService.register(payload as RegisterDTO).subscribe({
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

  public onCloseRegisterForm(): void {
    this.dialogRef.close();
  }

  private match(
    other: () => AbstractControl | null
  ): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const otherCtrl = other();
      if (!otherCtrl) return null;
      return control.value === otherCtrl.value ? null : { mismatch: true };
    };
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
