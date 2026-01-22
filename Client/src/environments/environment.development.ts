export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api/',
  wsUrl: 'wss://wbi5n927xg.execute-api.us-east-1.amazonaws.com/production/',
  cognito: {
    domain: 'https://dating-app-v2-auth.auth.us-east-1.amazoncognito.com',
    clientId: '7ie27nb65tl0t77dcp3ee4ln4h',
    redirectUri: 'http://localhost:4200/auth/callback',
    logoutUri: 'http://localhost:4200/',
    scopes: ['openid', 'email'],
  },
};
