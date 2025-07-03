export interface User {
  id: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}
