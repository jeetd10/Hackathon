import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { getSession } from "../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Return empty history for the stateless demo
  return NextResponse.json({ messages: [] });
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // --- HACKATHON FAILSAFE: Mock Assistant ---
    // If no API key is provided, we use a smart fallback to ensure the demo never breaks.
    if (!apiKey) {
      const mockResponses = [
        "That sounds like a lot to handle. How can I best support you with that right now?",
        "I hear you. Remember that taking even a small breath can help reset your system.",
        "It's completely valid to feel that way. Have you tried the breathing exercise at the top?",
        "I'm here for you. You're doing a great job navigating these feelings.",
        "Thank you for sharing that with me. What's one small thing that could make today feel 1% better?"
      ];
      const randomReply = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      // Artificial delay to make it feel 'real'
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({ 
        reply: randomReply, 
        isMock: true,
        note: "AI Mock mode active (No API Key found)" 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the latest stable model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `You are a caring mental health assistant for students named Aura.
      Your task is to respond like a supportive human. Keep it short, empathetic, and helpful.
      User says: ${message}`
    );

    const reply = result.response.text();
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Chat API Error:", error.message || error);

    return NextResponse.json(
      { reply: "I'm here for you, but I'm having a small technical hiccup. Let's keep talking anyway—what else is on your mind?" },
      { status: 200 } // Return 200 even on error to keep the UI from breaking during a demo
    );
  }
}