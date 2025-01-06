// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      // Add other user properties you expect to have
      email?: string;
      name?: string;
      image?: string;
    };
  }
}