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

export interface ProfileDetails {
  gender: string;
  dateOfBirth: Date;
  city: string;
  country: string;
}

export interface RegisterDTO extends RegisterCredentials, ProfileDetails {}
