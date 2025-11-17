import { RegisterCredentials, User } from './../../Types/User';
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Register } from '../account/register/register';
import { SnackBar } from '../../core/services/snack-bar-service';

@Component({
  selector: 'app-home',
  imports: [MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private dialog = inject(MatDialog);
  private snackBarService = inject(SnackBar);

  public showRegister(): void {
    this.dialog
      .open(Register, {
        width: '560px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((data: RegisterCredentials) => {
        if (data) {
          this.snackBarService.openSuccessfullyRegisteredSnackBar();
        }
      });
  }
}
