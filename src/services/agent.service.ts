import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { config } from "../config/env";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
dotenv.config();

const agentTools = [new TavilySearchResults({ maxResults: 3 })];
const agentModel = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: config.OPENAI_API_KEY,
});
const memory = new MemorySaver();

const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: memory,
});

export const queryAgent = async (message: string, thread_id: string) => {
  const result = await agent.invoke(
    { messages: [new HumanMessage(message)] },
    { configurable: { thread_id } }
  );

  const last = result.messages[result.messages.length - 1];
  return last.content;
};
