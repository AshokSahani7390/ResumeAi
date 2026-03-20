import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    // Send Welcome Email (Non-blocking)
    try {
      await resend.emails.send({
        from: "ResumeAI <onboarding@resend.dev>",
        to: email,
        subject: "🚀 Welcome to ResumeAI - Get Hired Faster!",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
            <h1 style="color: #2563eb;">Welcome to ResumeAI!</h1>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your account is now active. You’re just 2 minutes away from a professional, AI-optimized resume that beats the ATS.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Next Step:</h3>
              <p>Go to your dashboard and click <strong>"Create New Resume"</strong> to begin.</p>
              <a href="http://localhost:3002/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 25px; border-radius: 10px; text-decoration: none; font-weight: bold;">Create My Resume</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">Happy job hunting,<br>The ResumeAI Team</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }

    // Generate JWT
    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });

    // Set cookie
    response.cookies.set("resumeai_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
