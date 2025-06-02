import express from "express";
import { handleAgentQuery, googleSignIn, logout, getUser } from "../controllers/agent.controller";

const router = express.Router();

router.post("/query", handleAgentQuery);
router.post('/google', googleSignIn);
router.post('/logout', logout);
router.get('/user', getUser);

export default router;
