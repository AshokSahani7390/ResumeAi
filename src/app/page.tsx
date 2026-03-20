import Link from "next/link";

const features = [
  {
    icon: "🤖",
    title: "AI Resume Generator",
    description:
      "Input your details and let AI craft perfectly structured, achievement-driven resume content in seconds.",
  },
  {
    icon: "🎯",
    title: "ATS Score Optimization",
    description:
      "Tailored specifically to pass Applicant Tracking Systems with the right keywords and formatting.",
  },
  {
    icon: "🎨",
    title: "Premium Templates",
    description:
      "Choose from clean, modern, and professional templates designed to impress recruiters instantly.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    text: "ResumeAI helped me land 3 interviews in my first week. The AI-generated content was incredibly professional.",
    avatar: "PS",
  },
  {
    name: "Rahul Verma",
    role: "Product Manager at Flipkart",
    text: "I was skeptical, but the ATS optimization feature genuinely made a difference. Highly recommend!",
    avatar: "RV",
  },
  {
    name: "Ananya Gupta",
    role: "Data Analyst at Amazon",
    text: "Created my resume in under 2 minutes. The templates are sleek and the AI suggestions were spot-on.",
    avatar: "AG",
  },
];

const stats = [
  { value: "50K+", label: "Resumes Created" },
  { value: "92%", label: "ATS Pass Rate" },
  { value: "2 min", label: "Average Time" },
  { value: "4.9★", label: "User Rating" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-card border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            ResumeAI
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Log in
            </Link>
            <Link href="/signup" className="btn-primary !py-2 !px-5 !text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "4s" }}></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center slide-up">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Powered by AI • Trusted by 50,000+ users
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Create ATS-Optimized
            <br />
            <span className="gradient-text">Resumes in 2 Minutes</span>
            <br />
            with AI
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10">
            Generate resumes, cover letters & get hired faster. Our AI crafts
            perfectly tailored, keyword-rich content that passes every ATS
            scanner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-center">
              Create My Resume — It&apos;s Free
            </Link>
            <a href="#features" className="btn-secondary text-center">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-[var(--color-border)] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Land Your Dream Job</span>
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
              Our AI-powered platform handles everything from content generation
              to formatting, so you can focus on what matters — getting hired.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-[var(--color-text-muted)]">
              Three simple steps to your perfect resume
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Fill Your Details",
                desc: "Enter your name, skills, experience, and target job role in our simple form.",
              },
              {
                step: "02",
                title: "AI Generates Content",
                desc: "Our AI crafts achievement-driven bullet points, summaries, and ATS-friendly formatting.",
              },
              {
                step: "03",
                title: "Download & Apply",
                desc: "Pick a premium template, preview your resume, and download a polished PDF instantly.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by <span className="gradient-text">Job Seekers</span>
            </h2>
            <p className="text-[var(--color-text-muted)]">
              See what our users are saying about ResumeAI
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="glass-card rounded-2xl p-8 hover:shadow-lg transition-all duration-300 relative"
              >
                <div className="text-4xl text-blue-100 font-serif absolute top-4 right-6">
                  &ldquo;
                </div>
                <p className="text-[var(--color-text-muted)] leading-relaxed mb-6 relative z-10">
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[var(--color-text-muted)]">
              Start free, upgrade when you need premium features.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="glass-card rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Free
              </div>
              <div className="text-4xl font-bold mb-6">₹0</div>
              <ul className="space-y-3 mb-8 text-sm">
                {[
                  "1 AI-generated resume",
                  "Basic template",
                  "PDF download",
                  "Standard formatting",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="btn-secondary w-full block text-center !py-3"
              >
                Get Started
              </Link>
            </div>
            {/* Premium */}
            <div className="relative rounded-2xl p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute -top-3 right-6 bg-yellow-400 text-black text-xs font-bold py-1 px-3 rounded-full">
                MOST POPULAR
              </div>
              <div className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">
                Premium
              </div>
              <div className="text-4xl font-bold mb-1">₹99</div>
              <div className="text-sm text-blue-200 mb-6">per resume</div>
              <ul className="space-y-3 mb-8 text-sm">
                {[
                  "Unlimited AI resumes",
                  "All premium templates",
                  "Cover letter generator",
                  "ATS score checker",
                  "Multiple download formats",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-yellow-300">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-xl w-full block text-center hover:bg-blue-50 transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your{" "}
            <span className="gradient-text">Perfect Resume?</span>
          </h2>
          <p className="text-[var(--color-text-muted)] mb-8 max-w-lg mx-auto">
            Join 50,000+ job seekers who used ResumeAI to land their dream
            roles. Start free — no credit card required.
          </p>
          <Link href="/signup" className="btn-primary">
            Create My Resume Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-white py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold gradient-text">ResumeAI</div>
          <div className="text-sm text-[var(--color-text-muted)]">
            © 2026 ResumeAI. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Privacy</a>
            <a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Terms</a>
            <a href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
