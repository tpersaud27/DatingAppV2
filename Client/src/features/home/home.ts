import { RegisterCredentials, User } from './../../Types/User';
import { Component, inject, Input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Register } from '../account/register/register';

@Component({
  selector: 'app-home',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  @Input({ required: true }) membersFromApp: User[] = [];

  private dialog = inject(MatDialog);

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
          // handle success (e.g., call API or show toast)
          console.log('Registered data:', data);
        }
      });
  }
}
