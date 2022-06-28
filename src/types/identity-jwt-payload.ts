import { JwtPayload } from 'jsonwebtoken';

export interface IdentityJwtPayload extends JwtPayload {
  exp: number;
  accountId: string;
  userId: string;
}
