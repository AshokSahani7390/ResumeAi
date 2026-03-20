import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, jobRole, skills, experience } = body;

    const prompt = `You are a professional career coach.

Write a personalized, compelling cover letter for the following candidate.

Candidate Info:
Name: ${name}
Job Role: ${jobRole}
Skills: ${skills}
Experience: ${experience}

Instructions:
- Keep it under 300 words
- Make it engaging and human (not robotic)
- Highlight key strengths and achievements
- Align with the job role
- Use a confident and professional tone
- Include a strong opening and closing
- Make the output ATS-friendly and optimized for modern hiring systems

Output format:
- Proper paragraph structure
- Ready to send
- Do not include placeholder brackets like [Company Name] — write naturally
- Start with "Dear Hiring Manager,"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Cover letter generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
