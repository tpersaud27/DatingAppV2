export const environment = {
  production: true,
  apiUrl: 'api/',
  wsUrl: 'wss/',
  cognito: {
    domain: 'https://dating-app-v2-auth.auth.us-east-1.amazoncognito.com',
    clientId: '7ie27nb65tl0t77dcp3ee4ln4h',
    redirectUri: 'http://localhost:4200/auth/callback',
    logoutUri: 'http://localhost:4200/',
    scopes: ['openid', 'email'],
  },
};
