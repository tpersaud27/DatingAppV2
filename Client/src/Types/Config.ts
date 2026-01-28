interface CognitoConfig {
  domain: string;
  clientId: string;
  redirectUri: string;
  logoutUri: string;
  scopes: string[];
}

interface AppConfig {
  production: boolean;
  apiUrl: string;
  wsUrl: string;
  cognito: CognitoConfig;
}
