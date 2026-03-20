import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { Resend } from "resend";

import { getUserFromRequest } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeTitle, content, email } = await req.json();

    if (!content || !email) {
      return NextResponse.json({ error: "Content and email are required" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "ResumeAI <delivery@resend.dev>",
      to: email,
      subject: `📄 Your Resume: ${resumeTitle || "New Resume"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 2rem; background: #ffffff;">
          <h2 style="color: #1e293b; font-weight: 800; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">${resumeTitle || "Professional Resume"}</h2>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 25px;">Hello! Here is the AI-generated resume you requested from <strong>ResumeAI</strong>.</p>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 1.5rem; color: #0f172a; white-space: pre-wrap; font-size: 11pt; line-height: 1.6; border: 1px solid #f1f5f9; font-family: 'Inter', system-ui, sans-serif;">
${content}
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 11px;">
            <p>© 2026 ResumeAI. The smartest way to beat the ATS.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Resume sent successfully!", id: data?.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
