import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "../../../../lib/models.js";
import sequelize from "../../../../lib/db.js";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      await sequelize.sync();
      const [existingUser, created] = await User.findOrCreate({
        where: { email: user.email },
        defaults: { email: user.email },
      });
      return true;
    },

    async redirect({ url, baseUrl }) {
      // After login, always go to LinkedIn connect
      return `${baseUrl}`;
    },

    async session({ session }) {
      const user = await User.findOne({ where: { email: session.user.email } });
      session.user.id = user?.id;
      session.user.linkedinConnected = !!user?.linkedinAccessToken;
      return session;
    },
    pages: {
      signIn: "/login", // 👈 your custom sign-in route
    },
  },
});

export { handler as GET, handler as POST };
