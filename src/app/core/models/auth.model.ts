export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  nombre: string;
  puesto: string;
  expiresAt: string;
}
