import express from "express";
import { handleAgentQuery } from "../controllers/agent.controller";

const router = express.Router();

router.post("/query", handleAgentQuery);

export default router;
