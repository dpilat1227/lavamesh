import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "LavaMesh Admin",
      credentials: {
        password: { label: "Dashboard Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.password === (process.env.ADMIN_PASSWORD || "lavamesh2026")) {
          return { id: "1", name: "Admin" };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
