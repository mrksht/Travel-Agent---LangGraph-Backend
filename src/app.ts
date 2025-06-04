import express from "express";
import cors from "cors";
import agentRoutes from "./routes/agent.routes";
import session from "express-session";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://travel-agent-ui.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use("/agent", agentRoutes);

export default app;
