import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return NextResponse.json({ messages: [] });
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Validate API Key - Check if it exists and looks like a real Google AI key
    const rawKey = process.env.GEMINI_API_KEY;
    const hasValidKey = rawKey && rawKey.length > 20 && rawKey.startsWith('AIza');

    // --- HACKATHON FAILSAFE: Mock Assistant ---
    if (!hasValidKey) {
      const mockResponses = [
        "That sounds like a lot to handle. How can I best support you with that right now?",
        "I hear you. Remember that taking even a small breath can help reset your system.",
        "It's completely valid to feel that way. Have you tried the breathing exercise at the top?",
        "I'm here for you. You're doing a great job navigating these feelings.",
        "Thank you for sharing that with me. What's one small thing that could make today feel 1% better?",
        "I'm listening. Sometimes just putting these thoughts into words is the first step toward clarity."
      ];
      const randomReply = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      // Mimic AI latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return NextResponse.json({ 
        reply: randomReply, 
        isMock: true,
        note: "Support Mode Active" 
      });
    }

    // Only attempt AI call if we have a real key
    const genAI = new GoogleGenerativeAI(rawKey as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `You are Aura, a supportive mental health assistant. 
       Speak like a kind, empathetic human. Keep it concise.
       User: ${message}`
    );

    const reply = result.response.text();
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Chat Error:", error);
    
    // Ultimate fallback if even the mock logic somehow fails
    return NextResponse.json({ 
      reply: "I'm here and listening. Tell me more about how you're feeling.", 
      status: 200 
    });
  }
}