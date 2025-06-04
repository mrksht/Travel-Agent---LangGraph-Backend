import { Request, Response } from "express";
import { queryAgent } from "../services/agent.service";
import { verifyGoogleToken } from "../services/google-auth.service";

declare module "express-session" {
  interface SessionData {
    user?: {
      name?: string;
      email?: string;
      picture?: string;
      googleId?: string;
    };
  }
}

export const handleAgentQuery = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { message, threadId } = req.body;
  if (!message || !threadId) {
    return res.status(400).json({ error: "Missing message or threadId" });
  }

  try {
    const response = await queryAgent(message, threadId);
    res.json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const googleSignIn = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: "Missing credential token" });
  }

  try {
    const user = await verifyGoogleToken(credential);
    req.session.user = user;
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ error: "Invalid Google token" });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.clearCookie("connect.sid"); // Default session cookie name
    res.json({ success: true, message: "Logged out successfully" });
  });
};

export const getUser = (req: Request, res: Response) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
};
