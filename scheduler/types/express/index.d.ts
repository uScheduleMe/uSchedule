import { UserAccount } from '@services/DataAccess';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserAccount;
  }
}
