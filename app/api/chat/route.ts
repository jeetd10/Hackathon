import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { getSession } from "../../lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ messages: [] }, { status: 401 });

    const messages = await prisma.chatMessage.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    // Allow anonymous chat if not logged in (or return error)
    if (!session) {
      return NextResponse.json({ reply: "Please sign in to chat.", error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from environment variables");
      return NextResponse.json({ reply: "Configuration error." }, { status: 500 });
    }

    const { message } = await req.json();

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        role: "user",
        text: message,
        userId: session.userId,
      }
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Retrieve previous messages for context (last 5)
    const history = await prisma.chatMessage.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    let historyContext = "";
    if (history.length > 0) {
      historyContext = "Recent chat history:\n" + history.reverse().map(h => `${h.role}: ${h.text}`).join('\n') + "\n\n";
    }

    const result = await model.generateContent(
      `You are a caring mental health assistant for students named Aura.
      
      Your tasks:
      - Detect emotion (happy, stressed, anxious, depressed)
      - Respond like a supportive human
      - Keep it short and helpful
      
      ${historyContext}
      User: ${message}`
    );

    const reply = result.response.text();

    // Save assistant message to database
    await prisma.chatMessage.create({
      data: {
        role: "assistant",
        text: reply,
        userId: session.userId,
      }
    });

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Gemini API Error:", error.message || error);

    return NextResponse.json(
      { reply: "I'm having trouble connecting right now. Let's try again in a moment." },
      { status: 500 }
    );
  }
}