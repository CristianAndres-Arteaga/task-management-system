export interface AuthUser {
  sub: string;
  email: string;
}

export interface SignUpData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}
