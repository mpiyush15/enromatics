import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import { MongoClient } from "mongodb";
import { compare } from "bcryptjs";

const client = new MongoClient(process.env.MONGODB_URI as string);

export const authOptions: AuthOptions = {
  debug: true, // Enable NextAuth debug mode
  
  providers: [
    // Existing Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('=== Credentials Login Attempt ===');
        
        if (!credentials?.username || !credentials.password) return null;

        await client.connect();
        const db = client.db("forteStudioz");

        const user = await db.collection("users").findOne({
          username: credentials.username,
        });

        if (!user) {
          console.log('User not found:', credentials.username);
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          console.log('Invalid password for user:', credentials.username);
          return null;
        }

        console.log('Login successful:', credentials.username);
        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role || "user",
          tenantId: user.tenantId || "default",
        };
      },
    }),

    // Facebook Business Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      authorization: {
        params: {
          scope: [
            'public_profile',
            'email',
            'business_management',
            'ads_management',
            'ads_read',
            'whatsapp_business_management',
            'whatsapp_business_messaging',
          ].join(','),
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      console.log('=== JWT Callback ===');
      console.log('Provider:', account?.provider);
      console.log('User:', user?.email);
      
      if (user) {
        token.username = user.username;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.userId = user.id;
      }
      
      if (account?.provider === "facebook") {
        console.log('=== Facebook OAuth Success ===');
        console.log('Access Token:', account.access_token ? 'Present' : 'Missing');
        console.log('Scopes:', account.scope);
        console.log('Expires at:', account.expires_at);
        
        token.facebookAccessToken = account.access_token;
        token.facebookUserId = account.providerAccountId;
        token.facebookPermissions = account.scope?.split(',') || [];
        token.facebookTokenExpiry = account.expires_at;
      }
      
      return token;
    },

    async session({ session, token }) {
      console.log('=== Session Callback ===');
      console.log('Token username:', token.username);
      console.log('Has Facebook token:', !!token.facebookAccessToken);
      
      if (token) {
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.userId = token.userId;
        
        session.facebookAccessToken = token.facebookAccessToken;
        session.facebookUserId = token.facebookUserId;
        session.facebookPermissions = token.facebookPermissions;
        session.hasWhatsAppAccess = token.facebookPermissions?.includes('whatsapp_business_messaging');
        session.hasAdsAccess = token.facebookPermissions?.includes('ads_management');
      }
      return session;
    },

    async signIn({ account }) {
      console.log('=== SignIn Callback ===');
      console.log('Provider:', account?.provider);
      
      if (account?.provider === "facebook") {
        console.log('Facebook sign-in allowed');
        return true;
      }
      return true;
    },
  },

  pages: {
    signIn: '/login',
    error: '/auth/error', // Custom error page
  },
};
