import { H3EventContext } from 'h3';

interface AuthContext {
  user: string;
  roles: string[];
}

declare module 'h3' {
  interface H3EventContext {
    auth: AuthContext;
  }
}
