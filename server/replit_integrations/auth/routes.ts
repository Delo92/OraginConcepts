import type { Express } from "express";
import { authStorage } from "./storage";
import * as client from "openid-client";
import memoize from "memoizee";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user with session refresh support
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = req.user;
      const now = Math.floor(Date.now() / 1000);

      // Check if session is expired and try to refresh
      if (user.expires_at && now > user.expires_at) {
        const refreshToken = user.refresh_token;
        if (!refreshToken) {
          return res.status(401).json({ message: "Session expired" });
        }

        try {
          const config = await getOidcConfig();
          const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
          updateUserSession(user, tokenResponse);
        } catch (refreshError) {
          return res.status(401).json({ message: "Session expired" });
        }
      }

      const userId = user.claims.sub;
      const dbUser = await authStorage.getUser(userId);
      if (!dbUser) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json(dbUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
