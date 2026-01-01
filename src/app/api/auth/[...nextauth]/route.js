import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "../../../../lib/models.js";
import sequelize from "../../../../lib/db.js";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, profile }) {
      await sequelize.sync({ alter: true });
      const [existingUser, created] = await User.findOrCreate({
        where: { email: user.email },
        defaults: {
          email: user.email,
          name: user.name || profile?.name
        },
      });

      // Update name if missing
      if (!created && !existingUser.name && (user.name || profile?.name)) {
        existingUser.name = user.name || profile?.name;
        await existingUser.save();
      }

      return true;
    },

    async session({ session }) {
      const user = await User.findOne({ where: { email: session.user.email } });
      if (user) {
        // Auto-expire premium if date has passed
        if (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) {
          console.log(`Premium expired for user ${user.email}. Revoking status.`);
          user.isPremium = false;
          user.premiumExpiresAt = null;
          user.premiumStartedAt = null;
          await user.save();
        }

        session.user.id = user.id;
        session.user.name = user.name;
        session.user.linkedinConnected = !!user.linkedinAccessToken;
        session.user.isAdmin = user.isAdmin;
        session.user.isPremium = user.isPremium;
        session.user.phoneNumber = user.phoneNumber;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
