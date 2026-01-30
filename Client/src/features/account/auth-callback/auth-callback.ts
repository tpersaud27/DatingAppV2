import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { AccountService } from '../../../core/services/account-service';
import { LoadingService } from '../../../core/services/loading-service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.css',
})
export class AuthCallback {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private accountService = inject(AccountService);
  private loadingService = inject(LoadingService);

  public async ngOnInit(): Promise<void> {
    // Show global overlay immediately when callback page loads
    this.loadingService.show('Signing you in...');

    try {
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

      // 1) Exchange code -> tokens (AuthService stores tokens)
      await this.auth.handleAuthCallback(code, state);

      // 2) Bootstrap user (API call(s) + set current user, etc.)
      this.loadingService.setMessage('Loading your profile...');
      await firstValueFrom(this.accountService.bootstrapUser$());

      // 3) Navigate after everything is ready
      this.loadingService.setMessage('Redirecting...');
      await this.router.navigateByUrl('/');
    } catch (err) {
      console.error(err);
      await this.router.navigateByUrl('/');
    } finally {
      // Always hide the loader even on errors
      this.loadingService.hide();
    }
  }
}
