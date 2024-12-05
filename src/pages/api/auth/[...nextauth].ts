// NOTE: remove the line below before editing this file
/* eslint-disable */
import { instance } from "@/lib/axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { getSession } from "next-auth/react";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const res = await instance.post("/user/login", credentials);

          if (res.status === 200)
            if (res.data?.user.role !== "admin") {
              throw new Error("Invalid login credentials");
            }

          return {
            ...res.data,
            accessToken: res.data.token,
            email: credentials?.email,

            user: {
              ...res.data.user,
            },
          };
        } catch (error) {
          console.log(error);

          throw new Error("Invalid login credentials");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.email = user.user.email;
        token.id = user.user.id;
        token.name = user.user.name;
        token.slug = user.user.slug;
        token.role = user.role_name;
        token.status = user.user.status;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      session.email = token.email;
      session.id = token.id;
      session.name = token.name;
      session.slug = token.slug;
      session.role = token.role;
      session.status = token.status;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
});
