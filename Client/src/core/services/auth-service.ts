import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PkceService } from './pkce-service';
import { environment } from '../../environments/environment';
import { TokenResponse } from '../../Types/Auth';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private verifierKey = 'pkce_verifier';
  private environment = environment;
  private http = inject(HttpClient);
  private pkeService = inject(PkceService);

  async signInWithHostedUI(): Promise<void> {
    // 1️⃣ Generate a random string that will become the PKCE "code_verifier"
    // This is a secret known ONLY to the browser.
    const verifier = this.pkeService.randomString(64);
    // 2️⃣ Hash the verifier to create the "code_challenge"
    // This is SAFE to send to Cognito during redirect.
    const challenge = await this.pkeService.sha256Base64Url(verifier);

    // 3️⃣ Store the verifier temporarily so we can use it later
    // when exchanging the authorization code for tokens.
    sessionStorage.setItem(this.verifierKey, verifier);

    // 4️⃣ Generate a random state value
    // This prevents CSRF attacks during redirects.
    const state = this.pkeService.randomString(24);
    sessionStorage.setItem('oauth_state', state);

    // 5️⃣ Read Cognito config
    const { domain, clientId, redirectUri, scopes } = this.environment.cognito;

    // 6️⃣ Build query parameters for the OAuth authorize request
    const params = new HttpParams({
      fromObject: {
        client_id: clientId, // identifies your app client
        response_type: 'code', // Authorization Code flow
        redirect_uri: redirectUri, // where Cognito sends the user back
        scope: scopes.join(' '), // openid email profile
        code_challenge_method: 'S256', // PKCE hashing method
        code_challenge: challenge, // hashed verifier
        state, // CSRF protection
      },
    });

    // 7️⃣ Redirect the browser to Cognito Hosted UI
    // From here, Cognito takes over (username/password or Google).
    window.location.assign(`${domain}/oauth2/authorize?${params.toString()}`);
  }

  async handleAuthCallback(code: string, state?: string | null): Promise<TokenResponse> {
    // 1️⃣ Validate the returned state to prevent CSRF attacks
    const expectedState = sessionStorage.getItem('oauth_state');
    if (expectedState && state && expectedState !== state) {
      throw new Error('Invalid state returned from Cognito.');
    }

    // 2️⃣ Retrieve the original PKCE verifier we created earlier
    const verifier = sessionStorage.getItem(this.verifierKey);
    if (!verifier) throw new Error('Missing PKCE verifier in sessionStorage.');

    // 3️⃣ Read Cognito config
    const { domain, clientId, redirectUri } = environment.cognito; // note: no semicolon

    // 4️⃣ Build the POST body for the token exchange
    // This proves to Cognito that:
    // - we have the authorization code
    // - AND we know the original PKCE verifier
    const body = new HttpParams({
      fromObject: {
        grant_type: 'authorization_code', // OAuth flow type
        client_id: clientId, // same app client as before
        code, // the one-time auth code
        redirect_uri: redirectUri, // must match original redirect
        code_verifier: verifier, // PKCE secret
      },
    });

    // 5️⃣ Required by OAuth spec
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    // 6️⃣ Exchange code → tokens
    // This is a BACKCHANNEL call (no redirect).
    const tokenResp = await firstValueFrom(
      this.http.post<TokenResponse>(`${domain}/oauth2/token`, body.toString(), { headers }),
    );

    // 7️⃣ Store tokens (for MVP)
    // - access_token → used to call your .NET API
    // - id_token → user identity claims
    sessionStorage.setItem('access_token', tokenResp.access_token);
    sessionStorage.setItem('id_token', tokenResp.id_token);
    if (tokenResp.refresh_token) sessionStorage.setItem('refresh_token', tokenResp.refresh_token);

    // 8️⃣ Cleanup sensitive temporary data
    sessionStorage.removeItem(this.verifierKey);

    return tokenResp;
  }

  public getAccessToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  public signOut(): void {
    const { domain, clientId, logoutUri } = environment.cognito;
    sessionStorage.clear();
    window.location.assign(
      `${domain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${encodeURIComponent(logoutUri)}`,
    );
  }
}
