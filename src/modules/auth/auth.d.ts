export type UserRole = "contributor" | "maintainer";

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

export type AuthTokenType = "access_token" | "refresh_token";
