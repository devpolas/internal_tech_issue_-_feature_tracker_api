export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
  data: User;
}
