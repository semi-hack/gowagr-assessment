export interface AuthJWTInput {
  id: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoggedInState {
  id: string;
  username: string;
  token: string;
}
