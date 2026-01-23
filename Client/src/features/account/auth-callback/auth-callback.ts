import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { AccountService } from '../../../core/services/account-service';

@Component({
  selector: 'app-auth-callback',
  imports: [],
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.css',
})
export class AuthCallback {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private accountService = inject(AccountService);

  public async ngOnInit(): Promise<void> {
    // 1️⃣ Read query parameters from the redirect URL
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    const error = this.route.snapshot.queryParamMap.get('error');
    const errorDesc = this.route.snapshot.queryParamMap.get('error_description');

    // 2️⃣ If Cognito returned an error, stop
    if (error) {
      console.error('OAuth error:', error, errorDesc);
      // route to a dedicated error page if you want
      await this.router.navigateByUrl('/');
      return;
    }

    // 3️⃣ No code = invalid redirect
    if (!code) {
      console.error('Missing auth code');
      await this.router.navigateByUrl('/');
      return;
    }

    // 4️⃣ Complete the login by exchanging code → tokens
    this.auth
      .handleAuthCallback(code, state)
      .then(() => {
        // 5️⃣ Login is complete 🎉
        // Tokens are stored, user is authenticated
        this.router.navigateByUrl('/'); // Navigate to home
        // Check if user is onboarded (i.e. basic profile information is submitted)
        this.accountService.bootstrapUser();
      })
      .catch((err) => {
        console.error(err);
        this.router.navigateByUrl('/');
      });
  }
}
