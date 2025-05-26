import { Request, Response } from "express";
import { queryAgent } from "../services/agent.service";

export const handleAgentQuery = async (req: Request, res: Response): Promise<any> => {
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
