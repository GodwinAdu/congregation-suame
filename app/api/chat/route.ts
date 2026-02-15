

import { streamText, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { databaseTools } from "@/lib/mcp/database-tools";
import { currentUser } from "@/lib/helpers/session";
import { connectToDB } from "@/lib/mongoose";
import Role from "@/lib/models/role.models";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user has permission to use AI assistant
    await connectToDB();
    const userRole = await Role.findOne({ name: user.role });
    
    if (!userRole?.permissions?.aiAssistant) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to use the AI Assistant. Please contact an administrator." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { messages, mode, selectedModelId } = body;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set.");
    }

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const finalModelId = selectedModelId || "gpt-4o";
    const modelInstance = openai(finalModelId);

    const userRoleName = user.role || "publisher";
    const isAdmin = userRole?.permissions?.manageBackups || false;

    const baseInstruction = `
**USER ROLE: ${userRoleName.toUpperCase()}**
**IMPORTANT RESTRICTIONS:**
- ONLY answer questions related to Jehovah's Witnesses congregation activities, Bible topics, theocratic organization, and spiritual matters
- If asked about unrelated topics, politely decline
- Provide practical, spiritually encouraging answers
- Use the available tools to query the database for accurate, real-time information
- When users ask about territories, meetings, reports, or publishers, use the appropriate tool to get current data
- When using populate parameter: ShepherdingCall uses 'member', PublisherRecord uses 'memberId', most others use 'user'
- When displaying member information, show their full name, not just the ID
- ALWAYS provide a response after using a tool, even if the data is minimal or empty
- If a query returns limited data, explain what you found and offer to help with more specific queries
- When querying for "today" or specific dates, ALWAYS use filters with date comparisons (e.g., filters: {"date": {"$gte": "2025-01-20T00:00:00.000Z", "$lt": "2025-01-21T00:00:00.000Z"}})
- For large datasets: Use aggregateData tool for counts/statistics instead of querying all records
- For summaries: Query with small limit (5-10) and DON'T use select parameter - get all fields for better context
- For detailed info: Query specific records using filters (e.g., by ID, date range, status)
- If user asks for "all" data, explain you'll provide a summary and offer to show specific records
- Only use select parameter when you need to reduce token usage for very large result sets (>20 records)
${isAdmin ? "- You have ADMIN access: Can create backups, restore data, and access all congregation information" : "- You have LIMITED access: Cannot create backups or restore data"}
`;

    const systemPrompts = {
      shepherding: "You help elders with shepherding and pastoral care. Use the New World Translation. Show warmth and empathy. When querying ShepherdingCall collection, ALWAYS use populate: 'member' to get full member details." + baseInstruction,
      letters: "You help write congregation correspondence such as transfer letters, recommendations, and introductions. Use formal theocratic language." + baseInstruction,
      ministry: "You assist with field service, return visits, and Bible studies. Use getTerritories and getPublishers tools to access real territory and publisher data." + baseInstruction,
      meetings: "You assist with meeting preparation, talks, and schedules. Use getMeetings and getAttendance tools to access real meeting data." + baseInstruction,
      reports: "You assist with congregation statistics and reports. Use getFieldServiceReports and getCongregationStats tools to access real data." + baseInstruction,
      general: "You are a helpful congregation assistant. Use available tools to query database when needed." + baseInstruction,
    };

    const result = streamText({
      model: modelInstance,
      system: systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.general,
      messages: await convertToModelMessages(messages),
      tools: databaseTools,
      temperature: mode === "ministry" ? 0.8 : 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}