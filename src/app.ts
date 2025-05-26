import express from "express";
import cors from "cors";
import agentRoutes from "./routes/agent.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/agent", agentRoutes);

export default app;
