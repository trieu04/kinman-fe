export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  image?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  email: string;
  password?: string;
  username?: string;
  name?: string;
}
