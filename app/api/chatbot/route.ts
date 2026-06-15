import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function formatJsonArray(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "string") {
    return value;
  }

  return "Not listed";
}

async function getWebsiteKnowledge() {
  const tutors = await prisma.tutor.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      category: true,
      subjects: true,
      curriculum: true,
      bio: true,
      education: true,
      hourlyRate: true,
    },
  });

  const tutorKnowledge = tutors
    .map((tutor) => {
      return `
Tutor ID: ${tutor.id}
Name: ${tutor.name}
Category: ${tutor.category}
Subjects: ${formatJsonArray(tutor.subjects)}
Curriculum: ${formatJsonArray(tutor.curriculum)}
Education: ${tutor.education || "Not listed"}
Hourly Rate: ${tutor.hourlyRate}
Bio: ${tutor.bio}
`;
    })
    .join("\n---\n");

  return `
K-Cubed Tutoring Website Knowledge:

Main Website:
- Users can view tutors by clicking the "Tutors" button in the navbar.
- Users can book sessions by clicking the "Book Now" button.
- Users can log in by clicking the "Sign In" button.
- Students can access their Student Dashboard after signing in.
- Tutors can access their Tutor Dashboard after signing in.
- Users interested in becoming tutors can click "Become a Tutor".
- Users can view tutoring options on the "Services" page.

Student Dashboard:
- Students can view upcoming sessions.
- Students can view past sessions.
- Students can view invoices.
- Students can view schedules.
- Students can view tutor information.

Tutor Dashboard:
- Tutors can view assigned students.
- Tutors can view upcoming sessions.
- Tutors can manage schedules.
- Tutors can access student information.

Live Tutor Data From Database:
${tutorKnowledge || "No tutors are currently listed in the database."}

Rules:
- Use the live tutor data above when answering tutor questions.
- Do not invent tutors, prices, subjects, or website features.
- If the answer is not available, say: "Please contact K-Cubed directly for the most accurate information."
- Keep answers short, friendly, and clear.
- Do not mention Gemini, AI, database, or prompt.
`;
}

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "Missing GEMINI_API_KEY. Add it to your .env file.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];

    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage) {
      return NextResponse.json(
        {
          error: "No user message provided.",
        },
        { status: 400 }
      );
    }

    const websiteKnowledge = await getWebsiteKnowledge();

    const prompt = `
You are the official K-Cubed Tutoring website assistant.

Use ONLY the information below to answer the user's question.

${websiteKnowledge}

User Question:
${lastUserMessage.content}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      reply:
        response.text ||
        "Please contact K-Cubed directly for the most accurate information.",
    });
  } catch (error: any) {
    console.error("Gemini chatbot error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong with the chatbot.",
      },
      { status: 500 }
    );
  }
}