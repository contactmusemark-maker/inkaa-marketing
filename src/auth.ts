import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

const config = {
  providers: [],
  pages: {
    signIn: '/sign-up-login',
    error: '/sign-up-login',
  },
  callbacks: {
    authorized({ request, auth }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage =
        request.nextUrl.pathname.startsWith('/sign-up-login') ||
        request.nextUrl.pathname.startsWith('/landing');

      if (isOnAuthPage) {
        return !isLoggedIn;
      }
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        const appUser = user as typeof user & { role?: string };
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = appUser.role || 'user';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const appSessionUser = session.user as typeof session.user & {
          id?: string;
          role?: string;
        };
        appSessionUser.id = token.id as string;
        appSessionUser.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
