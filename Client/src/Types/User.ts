export interface User {
  authProvider: string;
  authUserId: string;
  displayName: string;
  email: string;
  id: string;
  onboardingComplete: false;
}

export interface OnboardingRequest {
  displayName: string;
  gender: string;
  dateOfBirth: string; // ISO format: YYYY-MM-DD
  city: string;
  country: string;
  description?: string;
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
