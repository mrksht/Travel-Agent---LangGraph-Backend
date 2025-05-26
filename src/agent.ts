
// process.env.OPENAI_API_KEY = "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";
// process.env.TAVILY_API_KEY = "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";

// import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
// import { ChatOpenAI } from "@langchain/openai";
// import { HumanMessage, AIMessage } from "@langchain/core/messages";
// import { ToolNode } from "@langchain/langgraph/prebuilt";
// import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";

// // Define the tools for the agent to use
// const tools = [new TavilySearchResults({ maxResults: 3 })];
// const toolNode = new ToolNode(tools);

// // Create a model and give it access to the tools
// const model = new ChatOpenAI({
//   model: "gpt-4o-mini",
//   temperature: 0,
// }).bindTools(tools);

// // Define the function that determines whether to continue or not
// function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
//   const lastMessage = messages[messages.length - 1] as AIMessage;

//   // If the LLM makes a tool call, then we route to the "tools" node
//   if (lastMessage.tool_calls?.length) {
//     return "tools";
//   }
//   // Otherwise, we stop (reply to the user) using the special "__end__" node
//   return "__end__";
// }

// // Define the function that calls the model
// async function callModel(state: typeof MessagesAnnotation.State) {
//   const response = await model.invoke(state.messages);

//   // We return a list, because this will get added to the existing list
//   return { messages: [response] };
// }

// // Define a new graph
// const workflow = new StateGraph(MessagesAnnotation)
//   .addNode("agent", callModel)
//   .addEdge("__start__", "agent")
//   .addNode("tools", toolNode)
//   .addEdge("tools", "agent")
//   .addConditionalEdges("agent", shouldContinue);

// const app = workflow.compile();

// // Use the agent
// const finalState = await app.invoke({
//   messages: [new HumanMessage("I am in India and I want to go on a trip to North India this October. Choose a place or a list of places and curate a trip for me. Divide it properly with number of days at a place etc. I love sunny or cold places and hate rains.")],
// });
// console.log(finalState.messages[finalState.messages.length - 1].content);

// // const nextState = await app.invoke({
// //   // Including the messages from the previous run gives the LLM context.
// //   // This way it knows we're asking about the weather in NY
// //   messages: [...finalState.messages, new HumanMessage("what about ny")],
// // });
// // console.log(nextState.messages[nextState.messages.length - 1].content);