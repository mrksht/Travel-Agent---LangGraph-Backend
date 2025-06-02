import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv"
dotenv.config()

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleUser {
  name?: string;
  email?: string;
  picture?: string;
  googleId?: string;
}

export async function verifyGoogleToken(token: string): Promise<GoogleUser> {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  console.log(ticket, payload)

  if (!payload) throw new Error("Invalid token payload");

  const { name, email, picture, sub: googleId } = payload;

  return { name, email, picture, googleId };
}
