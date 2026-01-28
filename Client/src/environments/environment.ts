export const environment: AppConfig = {
  production: true,
  apiUrl: '',
  wsUrl: '',
  cognito: {
    domain: '',
    clientId: '',
    redirectUri: '',
    logoutUri: '',
    scopes: ['openid', 'email'],
  },
};
