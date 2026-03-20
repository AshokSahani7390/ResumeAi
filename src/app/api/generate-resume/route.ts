import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, location, jobRole, experienceLevel, skills, companyName, companyRole, duration, jobDescription, degree, college, gradYear, tone = "Professional" } = body;

    const prompt = `You are an expert resume writer and ATS optimization specialist.

Create a professional, ATS-friendly resume based on the following details.

User Details:
Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location}

Target Job Role: ${jobRole}
Experience Level: ${experienceLevel}

Skills:
${skills}

Work Experience:
Company: ${companyName}
Role: ${companyRole}
Duration: ${duration}
Description: ${jobDescription}

Education:
Degree: ${degree}
College: ${college}
Graduation Year: ${gradYear}

Tone: ${tone}

Instructions:
- Use a clean, ${tone.toLowerCase()} tone
- Optimize for ATS (include relevant keywords for the job role)
- Use bullet points for experience
- Start bullet points with strong action verbs
- Include measurable achievements where possible
- Keep it concise and impactful
- Do NOT include unnecessary personal details
- Make the output ATS-friendly and optimized for modern hiring systems
- Structure the resume in this format:

1. PROFESSIONAL SUMMARY (2-3 lines)
2. SKILLS (bullet points)
3. WORK EXPERIENCE (with bullet points using action verbs)
4. EDUCATION

Output in clean plain text format. Do not use markdown. Do not include the candidate's name or contact info at the top (that will be added separately).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
