import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Google Sign-In only — no database. Sessions are signed JWTs stored in a
 * cookie, so no user table and no external database are required. Each
 * signed-in person's app data still lives only in their own browser's
 * IndexedDB; this only gates access and identifies who is using the app.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
};
