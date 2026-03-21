import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  role: Role;
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: Role;
    }
  }
}
