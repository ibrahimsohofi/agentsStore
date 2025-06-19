import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: "BUYER" | "SELLER" | "ADMIN"
    }
  }

  interface User {
    role: "BUYER" | "SELLER" | "ADMIN"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "BUYER" | "SELLER" | "ADMIN"
  }
}
