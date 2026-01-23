import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-home',
  imports: [MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private authService = inject(AuthService);

  public async signUpWithCognito() {
    await this.authService.signInWithHostedUI();
  }

  // NO LONGER USED. OLD IMPLEMENTATION
  // public showRegister(): void {
  //   this.dialog
  //     .open(Register, {
  //       width: '560px',
  //       maxWidth: '95vw',
  //       autoFocus: 'first-tabbable',
  //       disableClose: true,
  //     })
  //     .afterClosed()
  //     .subscribe((data: RegisterCredentials) => {
  //       if (data) {
  //         this.snackBarService.openSuccessfullyRegisteredSnackBar();
  //       }
  //     });
  // }
}
