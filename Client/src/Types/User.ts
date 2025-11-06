export interface User {
  id: string;
  displayName: string;
  email: string;
  token: string;
  imageUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  displayName: string;
  password: string;
}
