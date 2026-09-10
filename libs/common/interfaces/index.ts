import { Role } from '../enums';
export interface AuthenticatedUser {
  sub: string;
  role: Role;
}
export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
}
