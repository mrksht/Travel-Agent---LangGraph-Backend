// process.env.OPENAI_API_KEY = "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";
// process.env.TAVILY_API_KEY = "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";

// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { Annotation, StateGraph } from "@langchain/langgraph";
// import { createRetrieverTool } from "langchain/tools/retriever";
// import { ToolNode } from "@langchain/langgraph/prebuilt";
// import { END, START } from "@langchain/langgraph";
// import { pull } from "langchain/hub";
// import { z } from "zod";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { ChatOpenAI } from "@langchain/openai";
// import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

// const urls = [
//     "https://lilianweng.github.io/posts/2023-06-23-agent/",
//     "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
//     "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
// ];

// const docs = await Promise.all(
//     urls.map((url) => new CheerioWebBaseLoader(url).load()),
// );
// const docsList = docs.flat();

// const textSplitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 500,
//     chunkOverlap: 50,
// });
// const docSplits = await textSplitter.splitDocuments(docsList);

// // Add to vectorDB
// const vectorStore = await MemoryVectorStore.fromDocuments(
//     docSplits,
//     new OpenAIEmbeddings(),
// );

// const retriever = vectorStore.asRetriever();

// const GraphState = Annotation.Root({
//     messages: Annotation<BaseMessage[]>({
//         reducer: (x, y) => x.concat(y),
//         default: () => [],
//     })
// })

// const tool = createRetrieverTool(
//     retriever,
//     {
//         name: "retrieve_blog_posts",
//         description:
//             "Search and return information about Lilian Weng blog posts on LLM agents, prompt engineering, and adversarial attacks on LLMs.",
//     },
// );
// const tools = [tool];

// const toolNode = new ToolNode<typeof GraphState.State>(tools);

// function shouldRetrieve(state: typeof GraphState.State): string {
//     const { messages } = state;
//     console.log("---DECIDE TO RETRIEVE---");
//     const lastMessage = messages[messages.length - 1];

//     if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length) {
//         console.log("---DECISION: RETRIEVE---");
//         return "retrieve";
//     }
//     return END;
// }

// async function gradeDocuments(state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> {
//     console.log("---GET RELEVANCE---");

//     const { messages } = state;
//     const tool = {
//         name: "give_relevance_score",
//         description: "Give a relevance score to the retrieved documents.",
//         schema: z.object({
//             binaryScore: z.string().describe("Relevance score 'yes' or 'no'"),
//         })
//     }

//     const prompt = ChatPromptTemplate.fromTemplate(
//         `You are a grader assessing relevance of retrieved docs to a user question.
//   Here are the retrieved docs:
//   \n ------- \n
//   {context} 
//   \n ------- \n
//   Here is the user question: {question}
//   If the content of the docs are relevant to the users question, score them as relevant.
//   Give a binary score 'yes' or 'no' score to indicate whether the docs are relevant to the question.
//   Yes: The docs are relevant to the question.
//   No: The docs are not relevant to the question.`,
//     );

//     const model = new ChatOpenAI({
//         model: "gpt-4o",
//         temperature: 0,
//     }).bindTools([tool], {
//         tool_choice: tool.name,
//     });

//     const chain = prompt.pipe(model);

//     const lastMessage = messages[messages.length - 1];

//     const score = await chain.invoke({
//         question: messages[0].content as string,
//         context: lastMessage.content as string,
//     });

//     return {
//         messages: [score]
//     };
// }

// function checkRelevance(state: typeof GraphState.State): string {
//     console.log("---CHECK RELEVANCE---");

//     const { messages } = state;
//     const lastMessage = messages[messages.length - 1];
//     if (!("tool_calls" in lastMessage)) {
//         throw new Error("The 'checkRelevance' node requires the most recent message to contain tool calls.")
//     }
//     const toolCalls = (lastMessage as AIMessage).tool_calls;
//     if (!toolCalls || !toolCalls.length) {
//         throw new Error("Last message was not a function message");
//     }

//     if (toolCalls[0].args.binaryScore === "yes") {
//         console.log("---DECISION: DOCS RELEVANT---");
//         return "yes";
//     }
//     console.log("---DECISION: DOCS NOT RELEVANT---");
//     return "no";
// }

// async function agent(state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> {
//     console.log("---CALL AGENT---");

//     const { messages } = state;
//     const filteredMessages = messages.filter((message) => {
//         if ("tool_calls" in message && Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
//             return message.tool_calls[0].name !== "give_relevance_score";
//         }
//         return true;
//     });

//     const model = new ChatOpenAI({
//         model: "gpt-4o",
//         temperature: 0,
//         streaming: true,
//     }).bindTools(tools);

//     const response = await model.invoke(filteredMessages);
//     return {
//         messages: [response],
//     };
// }

// async function rewrite(state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> {
//     console.log("---TRANSFORM QUERY---");

//     const { messages } = state;
//     const question = messages[0].content as string;
//     const prompt = ChatPromptTemplate.fromTemplate(
//         `Look at the input and try to reason about the underlying semantic intent / meaning. \n 
// Here is the initial question:
// \n ------- \n
// {question} 
// \n ------- \n
// Formulate an improved question:`,
//     );

//     const model = new ChatOpenAI({
//         model: "gpt-4o",
//         temperature: 0,
//         streaming: true,
//     });
//     const response = await prompt.pipe(model).invoke({ question });
//     return {
//         messages: [response],
//     };
// }


// async function generate(state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> {
//     console.log("---GENERATE---");

//     const { messages } = state;
//     const question = messages[0].content as string;
//     const lastToolMessage = messages.slice().reverse().find((msg) => msg._getType() === "tool");
//     if (!lastToolMessage) {
//         throw new Error("No tool message found in the conversation history");
//     }

//     const docs = lastToolMessage.content as string;

//     const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

//     const llm = new ChatOpenAI({
//         model: "gpt-4o",
//         temperature: 0,
//         streaming: true,
//     });

//     const ragChain = prompt.pipe(llm);

//     const response = await ragChain.invoke({
//         context: docs,
//         question,
//     });

//     return {
//         messages: [response],
//     };
// }

// const workflow = new StateGraph(GraphState)
//     .addNode("agent", agent)
//     .addNode("retrieve", toolNode)
//     .addNode("gradeDocuments", gradeDocuments)
//     .addNode("rewrite", rewrite)
//     .addNode("generate", generate);

// workflow.addEdge(START, "agent");

// workflow.addConditionalEdges(
//     "agent",
//     shouldRetrieve,
// );

// workflow.addEdge("retrieve", "gradeDocuments");

// workflow.addConditionalEdges(
//     "gradeDocuments",
//     checkRelevance,
//     {
//         yes: "generate",
//         no: "rewrite",
//     },
// );

// workflow.addEdge("generate", END);
// workflow.addEdge("rewrite", "agent");

// const app = workflow.compile();

// const inputs = {
//   messages: [
//     new HumanMessage(
//       "What are the types of agent memory based on Lilian Weng's blog post?",
//     ),
//   ],
// };
// let finalState: any;
// for await (const output of await app.stream(inputs)) {
//   for (const [key, value] of Object.entries(output)) {
//     const lastMsg = output[key].messages[output[key].messages.length - 1];
//     console.log(`Output from node: '${key}'`);
//     console.dir({
//       type: lastMsg._getType(),
//       content: lastMsg.content,
//       tool_calls: lastMsg.tool_calls,
//     }, { depth: null });
//     console.log("---\n");
//     finalState = value;
//   }
// }

// console.log(JSON.stringify(finalState, null, 2));