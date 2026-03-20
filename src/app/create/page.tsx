"use client";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Use a wrapper component to handle searchParams safely with Suspense
function CreateResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryResumeId = searchParams.get("resumeId");

  const [resumeId, setResumeId] = useState<string | null>(queryResumeId);
  const [step, setStep] = useState<Step>("form");
  const [data, setData] = useState<ResumeData>(initialData);
  const [editableContent, setEditableContent] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [tone, setTone] = useState<(typeof toneOptions)[number]>("Professional");
  const [selectedTemplate, setSelectedTemplate] = useState("Professional");
  const [loadingMessage, setLoadingMessage] = useState("AI is crafting your resume…");
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("resumeai_user");
    if (!stored) router.push("/login");

    // If editing existing resume, fetch it
    if (resumeId) {
      fetchExistingResume(resumeId);
    }
  }, [router, resumeId]);

  const fetchExistingResume = async (id: string) => {
    try {
      const token = localStorage.getItem("resumeai_token");
      const res = await fetch(`/api/resumes/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const { resume } = await res.json();
        setResumeId(resume.id);
        setData({
          fullName: resume.fullName || "",
          email: resume.email || "",
          phone: resume.phone || "",
          location: resume.location || "",
          jobRole: resume.jobRole || "",
          experienceLevel: resume.experienceLevel || "Fresher",
          skills: resume.skills || "",
          companyName: resume.experience ? "Previously Saved" : "", // simplified for MVP
          companyRole: "",
          duration: "",
          jobDescription: "",
          degree: resume.education || "",
          college: "",
          gradYear: "",
        });
        setEditableContent(resume.aiResume || "");
        setCoverLetter(resume.aiCoverLetter || "");
        setSelectedTemplate(resume.template || "Professional");
        if (resume.atsScore) {
          setAtsResult({
            score: resume.atsScore,
            strengths: JSON.parse(resume.atsStrengths || "[]"),
            weaknesses: JSON.parse(resume.atsWeaknesses || "[]"),
            suggestions: JSON.parse(resume.atsSuggestions || "[]"),
            missingKeywords: [],
            summary: "Loaded from saved analysis"
          });
        }
        setStep("content");
      }
    } catch (err) {
      console.error("Failed to fetch resume:", err);
    }
  };

  const handleInputChange = (field: keyof ResumeData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // ====== DATABASE PERSISTENCE ======
  const saveToDatabase = async (overrideContent?: string, overrideAts?: ATSResult) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("resumeai_token");
      const method = resumeId ? "PUT" : "POST";
      const url = resumeId ? `/api/resumes/${resumeId}` : "/api/resumes";

      const payload = {
        ...data,
        aiResume: overrideContent || editableContent,
        aiCoverLetter: coverLetter,
        template: selectedTemplate,
        atsScore: overrideAts?.score || atsResult?.score,
        atsStrengths: overrideAts?.strengths || atsResult?.strengths,
        atsWeaknesses: overrideAts?.weaknesses || atsResult?.weaknesses,
        atsSuggestions: overrideAts?.suggestions || atsResult?.suggestions,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        if (!resumeId) setResumeId(result.resume.id);
        console.log("Saved to cloud!");
      }
    } catch (err) {
      console.error("Database save failed, falling back to local:", err);
      // Fallback: save to local list
      const localResume = {
        id: resumeId || Date.now().toString(),
        title: `${data.jobRole} Resume`,
        createdAt: new Date().toISOString(),
        template: selectedTemplate,
      };
      const existing = JSON.parse(localStorage.getItem("resumeai_resumes") || "[]");
      const filtered = existing.filter((r: any) => r.id !== localResume.id);
      filtered.push(localResume);
      localStorage.setItem("resumeai_resumes", JSON.stringify(filtered));
    } finally {
      setIsSaving(false);
    }
  };

  // ====== AI API CALLS ======
  const generateResume = async () => {
    setStep("loading");
    setLoadingMessage("AI is crafting your resume…");

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, name: data.fullName, tone }),
      });
      const result = await res.json();

      let content = "";
      if (result.error) {
        content = buildMockContent(data, tone);
      } else {
        content = result.content;
      }
      setEditableContent(content);
      // Auto-save initial generation
      await saveToDatabase(content);
    } catch {
      const content = buildMockContent(data, tone);
      setEditableContent(content);
      await saveToDatabase(content);
    }

    setStep("content");
  };

  const regenerate = async () => {
    setStep("loading");
    setLoadingMessage("Regenerating with new tone…");

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, name: data.fullName, tone }),
      });
      const result = await res.json();

      if (!result.error) {
        setEditableContent(result.content);
        await saveToDatabase(result.content);
      }
    } catch {
      // keep existing content
    }

    setStep("content");
  };

  const generateCoverLetter = async () => {
    setShowCoverLetter(true);
    setCoverLetter("Generating your cover letter…");

    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          jobRole: data.jobRole,
          skills: data.skills,
          experience: `${data.companyRole} at ${data.companyName} (${data.duration}). ${data.jobDescription}`,
        }),
      });
      const result = await res.json();
      const content = result.error ? "Could not generate cover letter. Please check your API key." : result.content;
      setCoverLetter(content);
      await saveToDatabase(editableContent); // Saves current state with new cover letter
    } catch {
      setCoverLetter("Could not connect to AI. Cover letter generation requires an OpenAI API key.");
    }
  };

  const runATSCheck = async () => {
    setStep("loading");
    setLoadingMessage("Analyzing your resume for ATS compatibility…");

    try {
      const res = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: data.jobRole,
          resumeText: editableContent,
        }),
      });
      const result = await res.json();

      let ats: ATSResult;
      if (result.error) {
        ats = {
          score: 72, strengths: ["Good structure", "Action verbs used", "Skills section present"],
          weaknesses: ["Could include more keywords", "Achievements lack metrics"],
          suggestions: ["Add industry-specific keywords", "Quantify achievements with numbers"],
          missingKeywords: ["CI/CD", "Agile", "Cloud"],
          summary: "Good foundation but needs keyword optimization",
        };
      } else {
        ats = result;
      }
      setAtsResult(ats);
      await saveToDatabase(editableContent, ats);
    } catch {
      const ats = {
        score: 72, strengths: ["Good structure", "Action verbs used"],
        weaknesses: ["Missing keywords"], suggestions: ["Add relevant tech keywords"],
        missingKeywords: ["CI/CD"], summary: "Needs API key for detailed analysis",
      };
      setAtsResult(ats);
      await saveToDatabase(editableContent, ats);
    }

    setStep("ats");
  };

  const improveResume = async () => {
    setIsImproving(true);

    try {
      const res = await fetch("/api/improve-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: data.jobRole,
          resumeText: editableContent,
        }),
      });
      const result = await res.json();

      if (!result.error) {
        setEditableContent(result.content);
        await saveToDatabase(result.content);
      }
    } catch {
      // keep existing
    }

    setIsImproving(false);
    setStep("content");
  };

  const downloadPDF = () => {
    if (previewRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html><head><title>${data.fullName} - Resume</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
            body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 40mm 20mm; color: #0f172a; line-height: 1.5; background: white; }
            h1 { font-size: 24pt; margin-bottom: 2pt; font-weight: 800; }
            .contact { color: #64748b; font-size: 10pt; margin-bottom: 20pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 10pt; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 11pt; }
            @page { size: A4; margin: 0; }
            @media print { body { padding: 20mm; } }
          </style></head>
          <body>${previewRef.current.innerHTML}</body></html>
        `);
        printWindow.document.close();
        // Wait for fonts/rendering
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  const sendToEmail = async () => {
    setIsEmailing(true);
    try {
      const stored = localStorage.getItem("resumeai_user");
      const user = JSON.parse(stored || "{}");
      const token = localStorage.getItem("resumeai_token");

      if (!user.email) throw new Error("No user email found");

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeTitle: `${data.jobRole} Resume`,
          content: editableContent,
          email: user.email
        }),
      });

      if (res.ok) {
        alert("🚀 Professional resume sent to your inbox!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send email. Check your connection.");
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Top Bar */}
      <header className="glass-card border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold gradient-text">
            ResumeAI
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {(["form", "content", "template", "preview"] as const).map((s, i) => (
              <div key={s} className={`flex items-center gap-1.5 ${step === s ? "text-blue-600 font-semibold" : "text-[var(--color-text-muted)]"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {i + 1}
                </span>
                <span className="hidden md:inline capitalize">{s}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
             {isSaving && <span className="text-[10px] uppercase font-black text-blue-500 animate-pulse">Syncing...</span>}
             <Link href="/dashboard" className="text-xs font-bold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 bg-white border border-gray-100 transition-all">Exit</Link>
          </div>
        </div>
      </header>

      {/* ====== STEP: FORM ====== */}
      {step === "form" && (
        <main className="max-w-3xl mx-auto px-6 py-10 slide-up">
          <h1 className="text-3xl font-black mb-2 tracking-tight">Create Professional Resume</h1>
          <p className="text-[var(--color-text-muted)] text-base mb-10 leading-relaxed">
            Fill in your details and let our AI specialist craft a high-impact, ATS-optimized document for your next career move.
          </p>

          <div className="space-y-10">
            <fieldset className="glass-card rounded-3xl p-8 border border-[var(--color-border)] shadow-sm">
              <legend className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-3 bg-blue-50 rounded-full py-1">Step 1: Contact Detail</legend>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <InputField label="Full Name" value={data.fullName} onChange={(v) => handleInputChange("fullName", v)} placeholder="John Doe" />
                <InputField label="Email Address" value={data.email} onChange={(v) => handleInputChange("email", v)} placeholder="john@example.com" type="email" />
                <InputField label="Phone Number" value={data.phone} onChange={(v) => handleInputChange("phone", v)} placeholder="+91 9876543210" />
                <InputField label="Current Location" value={data.location} onChange={(v) => handleInputChange("location", v)} placeholder="Mumbai, India" />
              </div>
            </fieldset>

            <fieldset className="glass-card rounded-3xl p-8 border border-[var(--color-border)] shadow-sm">
              <legend className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] px-3 bg-purple-50 rounded-full py-1">Step 2: Career Goal</legend>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <InputField label="Target Job Role" value={data.jobRole} onChange={(v) => handleInputChange("jobRole", v)} placeholder="Full Stack Developer" />
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Experience Level</label>
                  <select value={data.experienceLevel} onChange={(e) => handleInputChange("experienceLevel", e.target.value)} className="w-full px-4 py-3.5 rounded-2xl border border-[var(--color-border)] bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium">
                    <option>Fresher</option>
                    <option>1-3 years</option>
                    <option>3-5 years</option>
                    <option>5-10 years</option>
                    <option>10+ years</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="glass-card rounded-3xl p-8 border border-[var(--color-border)] shadow-sm">
              <legend className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] px-3 bg-indigo-50 rounded-full py-1">Step 3: Core Skills</legend>
              <div className="mt-6">
                <InputField label="Top Skills (comma-separated)" value={data.skills} onChange={(v) => handleInputChange("skills", v)} placeholder="React, Tailwind, Node.js, SQL, AWS, Git" />
                <p className="text-[10px] text-gray-500 mt-2 italic">* Add at least 5 skills for better ATS scoring</p>
              </div>
            </fieldset>

            <fieldset className="glass-card rounded-3xl p-8 border border-[var(--color-border)] shadow-sm">
              <legend className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] px-3 bg-green-50 rounded-full py-1">Step 4: Latest Experience</legend>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <InputField label="Company Name" value={data.companyName} onChange={(v) => handleInputChange("companyName", v)} placeholder="Example Corp" />
                <InputField label="Your Designation" value={data.companyRole} onChange={(v) => handleInputChange("companyRole", v)} placeholder="Software Engineer" />
                <InputField label="Tenure (e.g. 2022 - present)" value={data.duration} onChange={(v) => handleInputChange("duration", v)} placeholder="Jan 2023 - Present" />
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-gray-700">Key Responsibilities / Achievements</label>
                  <textarea value={data.jobDescription} onChange={(e) => handleInputChange("jobDescription", e.target.value)} className="w-full px-4 py-3.5 rounded-2xl border border-[var(--color-border)] bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium min-h-[100px]" placeholder="Built scalable APIs, Managed a team of 4, etc." />
                </div>
              </div>
            </fieldset>

            <fieldset className="glass-card rounded-3xl p-8 border border-[var(--color-border)] shadow-sm">
              <legend className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] px-3 bg-orange-50 rounded-full py-1">Step 5: Education</legend>
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <InputField label="Highest Degree" value={data.degree} onChange={(v) => handleInputChange("degree", v)} placeholder="B.Tech CS" />
                <InputField label="University / School" value={data.college} onChange={(v) => handleInputChange("college", v)} placeholder="University of Mumbai" />
                <InputField label="Graduation Year" value={data.gradYear} onChange={(v) => handleInputChange("gradYear", v)} placeholder="2024" />
              </div>
            </fieldset>

            <button onClick={generateResume} disabled={!data.fullName || !data.jobRole} className="btn-primary w-full !py-5 text-xl font-bold !rounded-3xl shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all disabled:opacity-40 flex items-center justify-center gap-3 active:scale-[0.98]">
              Generate AI Resume ✨
            </button>
          </div>
        </main>
      )}

      {/* ====== STEP: LOADING ====== */}
      {step === "loading" && (
        <main className="flex flex-col items-center justify-center min-h-[70vh] fade-in">
          <div className="relative w-24 h-24 mb-10">
            <div className="absolute inset-0 rounded-full border-8 border-blue-50"></div>
            <div className="absolute inset-0 rounded-full border-8 border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
               <span className="text-2xl animate-pulse">🤖</span>
            </div>
          </div>
          <h2 className="text-3xl font-black mb-3 tracking-tight">{loadingMessage}</h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-sm text-center leading-relaxed">
            Analyzing industry standards, injecting power verbs, and optimizing for ATS crawlers.
          </p>
        </main>
      )}

      {/* ====== STEP: CONTENT ====== */}
      {step === "content" && (
        <main className="max-w-6xl mx-auto px-6 py-10 fade-in">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4 rounded-3xl border border-gray-100 shadow-sm bg-white/70 backdrop-blur-xl">
                <h2 className="text-xl font-black px-2">
                  {showCoverLetter ? "Drafting Cover Letter" : "Refining AI Resume"}
                </h2>
                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                  <button onClick={() => setShowCoverLetter(false)} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${!showCoverLetter ? "bg-white text-blue-600 shadow-md ring-1 ring-black/[0.03]" : "text-gray-500 hover:text-gray-900"}`}>
                    Resume
                  </button>
                  <button onClick={() => { setShowCoverLetter(true); if (!coverLetter) generateCoverLetter(); }} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${showCoverLetter ? "bg-white text-blue-600 shadow-md ring-1 ring-black/[0.03]" : "text-gray-500 hover:text-gray-900"}`}>
                    Cover Letter
                  </button>
                </div>
              </div>

              {showCoverLetter ? (
                <div className="relative group">
                   <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} onBlur={() => saveToDatabase()} className="w-full min-h-[600px] p-10 rounded-[2.5rem] border-2 border-transparent bg-white shadow-2xl focus:outline-none focus:border-blue-500/20 text-[15px] leading-relaxed resize-y font-medium transition-all" />
                   <div className="absolute top-4 right-10 text-[10px] font-black text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">EDITABLE</div>
                </div>
              ) : (
                <div className="relative group">
                  <textarea value={editableContent} onChange={(e) => setEditableContent(e.target.value)} onBlur={() => saveToDatabase()} className="w-full min-h-[600px] p-10 rounded-[2.5rem] border-2 border-transparent bg-white shadow-2xl focus:outline-none focus:border-blue-500/20 text-[14px] leading-relaxed font-mono resize-y transition-all" />
                   <div className="absolute top-4 right-10 text-[10px] font-black text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">SOURCE CODE - EDITABLE</div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="glass-card rounded-[2.5rem] p-8 border border-[var(--color-border)] shadow-xl bg-white/50">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Styling & Tone</h3>
                <div className="grid grid-cols-1 gap-3">
                  {toneOptions.map((t) => (
                    <button key={t} onClick={() => setTone(t)} className={`flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold transition-all border-2 ${tone === t ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" : "bg-white text-gray-600 border-gray-50 hover:border-blue-200"}`}>
                      {t}
                      {tone === t && <span className="text-lg">✓</span>}
                    </button>
                  ))}
                </div>
                <button onClick={regenerate} className="mt-6 w-full py-4 rounded-2xl text-sm font-black text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100 active:scale-95 flex items-center justify-center gap-2">
                  🔄 Apply Selection
                </button>
              </div>

              <div className="space-y-4">
                <button onClick={runATSCheck} className="flex items-center justify-center gap-3 w-full py-5 rounded-[2rem] text-sm font-black bg-emerald-50 text-emerald-700 border-2 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all group active:scale-95">
                  <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
                  Check ATS Compatibility
                </button>

                <button onClick={improveResume} disabled={isImproving} className="flex items-center justify-center gap-3 w-full py-5 rounded-[2rem] text-sm font-black bg-indigo-50 text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all group disabled:opacity-50 active:scale-95">
                  <span className="text-xl group-hover:animate-pulse">⚡</span>
                  {isImproving ? "Brewing keywords..." : "Smart AI Boost"}
                </button>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button onClick={() => setStep("template")} className="w-full !py-6 text-lg font-black !rounded-[2rem] text-center bg-[var(--color-text)] text-white hover:bg-black transition-all shadow-xl active:scale-95">
                  Continue to Preview →
                </button>
                <p className="text-[10px] text-center font-bold text-gray-400 mt-4 uppercase tracking-widest">Your progress is autosaved</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ====== STEP: ATS SCORE ====== */}
      {step === "ats" && atsResult && (
        <main className="max-w-4xl mx-auto px-6 py-10 fade-in">
          <div className="flex items-center justify-between mb-10">
             <h2 className="text-3xl font-black tracking-tight">ATS Audit Report</h2>
             <button onClick={() => setStep("content")} className="text-xs font-bold bg-gray-100 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-200 transition-all">← Edit Content</button>
          </div>

          {/* Score Circle Card */}
          <div className="glass-card rounded-[3rem] p-10 mb-10 flex flex-col md:flex-row items-center gap-12 border border-gray-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="relative w-40 h-40 flex-shrink-0">
               <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke={atsResult.score >= 80 ? "#10b981" : atsResult.score >= 60 ? "#f59e0b" : "#f43f5e"} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(atsResult.score / 100) * 339} 339`} className="transition-all duration-1000 ease-out" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-gray-900">{atsResult.score}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</span>
               </div>
            </div>
            <div className="text-center md:text-left">
               <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 ${atsResult.score >= 80 ? "bg-emerald-100 text-emerald-700" : atsResult.score >= 60 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                  {atsResult.score >= 80 ? "Hire-Ready Profile" : atsResult.score >= 60 ? "Interview Potential" : "Critical Optimization Required"}
               </div>
               <h3 className="text-2xl font-black mb-3">
                  {atsResult.score >= 80 ? "Your resume is in the top 5%!" : atsResult.score >= 60 ? "Great foundation, let's polish it." : "Major keywords are missing."}
               </h3>
               <p className="text-gray-500 text-lg leading-relaxed max-w-lg">{atsResult.summary}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="glass-card rounded-[2.5rem] p-8 bg-emerald-50/30 border border-emerald-100">
              <h3 className="font-black text-emerald-800 mb-6 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-sm">✅</span>
                 Strengths Found
              </h3>
              <ul className="space-y-4">
                {atsResult.strengths.map((s, i) => (
                  <li key={i} className="text-sm font-bold text-gray-700 flex items-start gap-3">
                    <span className="text-emerald-500 font-black">✔</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-[2.5rem] p-8 bg-rose-50/30 border border-rose-100">
              <h3 className="font-black text-rose-800 mb-6 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-sm">⚠️</span>
                 Fix Required
              </h3>
              <ul className="space-y-4">
                {atsResult.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm font-bold text-gray-700 flex items-start gap-3">
                    <span className="text-rose-400 font-black">✖</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {atsResult.missingKeywords.length > 0 && (
            <div className="glass-card rounded-[2.5rem] p-8 mb-10 border border-indigo-100 bg-indigo-50/20">
              <h3 className="font-black text-indigo-900 mb-6 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-sm">🔑</span>
                 Target Industry Keywords
              </h3>
              <div className="flex flex-wrap gap-3">
                {atsResult.missingKeywords.map((k, i) => (
                  <span key={i} className="px-5 py-2.5 bg-white text-indigo-600 rounded-2xl text-xs font-black shadow-sm border border-indigo-50">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-6">
            <button onClick={improveResume} className="flex-1 py-5 rounded-[2rem] text-lg font-black bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
              🚀 Smart Auto-Improve
            </button>
            <button onClick={() => setStep("template")} className="flex-1 py-5 rounded-[2rem] text-lg font-black bg-white text-gray-900 border-2 border-gray-100 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm">
              Proceed to Layout →
            </button>
          </div>
        </main>
      )}

      {/* ====== STEP: TEMPLATE ====== */}
      {step === "template" && (
        <main className="max-w-6xl mx-auto px-6 py-10 fade-in">
          <h2 className="text-4xl font-black mb-3 tracking-tight text-center">Design Your Identity</h2>
          <p className="text-[var(--color-text-muted)] text-xl mb-12 text-center opacity-80">Select a layout that matches your professional personality.</p>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { id: "Professional", name: "The Standard", color: "#1e293b", desc: "Clean & authoritative. Best for corporate roles." },
              { id: "Modern", name: "The Creative", color: "#3b82f6", desc: "Bold & dynamic. Perfect for tech & design." },
              { id: "Minimal", name: "The Minimalist", color: "#64748b", desc: "Elegant & direct. Focus purely on content." },
            ].map((t) => (
              <button key={t.id} onClick={() => { setSelectedTemplate(t.id); saveToDatabase(); }} className={`group relative glass-card rounded-[3rem] p-1.5 transition-all duration-500 ${selectedTemplate === t.id ? "ring-4 ring-blue-500 shadow-2xl scale-[1.02]" : "hover:scale-[1.01] hover:shadow-xl ring-2 ring-transparent"}`}>
                <div className="bg-gray-50 rounded-[2.8rem] aspect-[3/4.2] p-8 flex flex-col overflow-hidden relative border border-gray-100">
                  <div className="h-4 rounded-lg mb-4" style={{ backgroundColor: t.color, width: "70%" }}></div>
                  <div className="space-y-2 mb-8">
                     <div className="h-2.5 bg-gray-200 rounded-lg w-full"></div>
                     <div className="h-2.5 bg-gray-200 rounded-lg w-4/5"></div>
                  </div>
                  <div className="h-3 rounded-lg mb-2" style={{ backgroundColor: t.color, width: "40%" }}></div>
                  <div className="space-y-2 mb-8">
                     <div className="h-2 bg-gray-100 rounded-lg w-full transition-all group-hover:w-full"></div>
                     <div className="h-2 bg-gray-100 rounded-lg w-full"></div>
                  </div>
                   <div className="h-3 rounded-lg mb-2" style={{ backgroundColor: t.color, width: "35%" }}></div>
                  <div className="space-y-2">
                     <div className="h-2 bg-gray-100 rounded-lg w-full"></div>
                     <div className="h-2 bg-gray-100 rounded-lg w-1/2"></div>
                  </div>
                  
                  {/* Selection Overlay */}
                  {selectedTemplate === t.id && (
                    <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[2px] flex items-center justify-center">
                       <span className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black border-4 border-white shadow-xl">✓</span>
                    </div>
                  )}
                </div>
                <div className="p-8 text-left">
                   <h4 className="font-black text-xl mb-1">{t.name}</h4>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{t.id} Layout</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-6 mt-16 justify-center">
            <button onClick={() => setStep("content")} className="px-10 py-5 rounded-3xl text-lg font-black bg-white border-2 border-gray-100 hover:border-gray-200 transition-all active:scale-95 shadow-sm">← Back to Edit</button>
            <button onClick={() => { setStep("preview"); saveToDatabase(); }} className="px-14 py-5 rounded-3xl text-lg font-black bg-[var(--color-text)] text-white hover:bg-black transition-all shadow-2xl active:scale-95">Final Preview →</button>
          </div>
        </main>
      )}

      {/* ====== STEP: PREVIEW ====== */}
      {step === "preview" && (
        <main className="max-w-6xl mx-auto px-6 py-10 fade-in">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black tracking-tight">Final Preview</h2>
                <div className="flex gap-3">
                   <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">{selectedTemplate} Layout</span>
                </div>
              </div>
              <div ref={previewRef} className="bg-white rounded-[3rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.15)] p-16 border border-gray-100 transition-all" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                <ResumePreview data={data} content={editableContent} template={selectedTemplate} />
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-card rounded-[2.5rem] p-10 border border-[var(--color-border)] shadow-2xl bg-white sticky top-24">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Ready to Download</h3>
                <div className="space-y-5">
                  <button onClick={downloadPDF} className="flex items-center justify-center gap-3 w-full py-6 rounded-[2.2rem] text-xl font-black bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 animate-bounce-subtle">
                    <span className="text-2xl">📥</span>
                    Download PDF
                  </button>
                  <button onClick={sendToEmail} disabled={isEmailing} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-sm font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all border border-indigo-100 disabled:opacity-50">
                     <span className="text-lg">{isEmailing ? "⏳" : "✉️"}</span> {isEmailing ? "Sending..." : "Email My Resume"}
                  </button>
                  <button onClick={() => setStep("content")} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-sm font-bold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all">
                     <span className="text-lg">✏️</span> Edit Content
                  </button>
                  <button onClick={() => setStep("template")} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-sm font-bold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all">
                    <span className="text-lg">🎨</span> Change Theme
                  </button>
                  <div className="pt-8 border-t border-gray-100">
                    <Link href="/dashboard" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-sm font-black text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all">
                      <span className="text-lg">✓</span> Save to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="glass-card rounded-[2rem] p-8 border border-gray-100 text-center">
                 <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Share this resume</p>
                 <div className="flex justify-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 grayscale hover:grayscale-0 cursor-pointer transition-all">🔗</div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 grayscale hover:grayscale-0 cursor-pointer transition-all">✉️</div>
                 </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

// Wrapper to handle Suspense for useSearchParams
export default function CreateResumePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
         <div className="w-20 h-20 rounded-full border-4 border-t-blue-600 animate-spin"></div>
      </div>
    }>
      <CreateResumeContent />
    </Suspense>
  );
}

/* ====== Types & Initial State ====== */
type Step = "form" | "loading" | "content" | "template" | "preview" | "ats";

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  jobRole: string;
  experienceLevel: string;
  skills: string;
  companyName: string;
  companyRole: string;
  duration: string;
  jobDescription: string;
  degree: string;
  college: string;
  gradYear: string;
}

interface ATSResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missingKeywords: string[];
  summary: string;
}

const initialData: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  jobRole: "",
  experienceLevel: "Fresher",
  skills: "",
  companyName: "",
  companyRole: "",
  duration: "",
  jobDescription: "",
  degree: "",
  college: "",
  gradYear: "",
};

const toneOptions = ["Professional", "Creative", "Concise"] as const;

/* ====== Shared Components ====== */

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; }) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2 text-gray-700">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl border border-[var(--color-border)] bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all text-sm font-medium shadow-inner" placeholder={placeholder} />
    </div>
  );
}

function ResumePreview({ data, content, template }: { data: ResumeData; content: string; template: string; }) {
  const accentColor = template === "Professional" ? "#1e293b" : template === "Modern" ? "#3b82f6" : "#64748b";

  return (
    <div>
      <h1 style={{ fontSize: "28pt", fontWeight: 800, color: accentColor, marginBottom: "4pt", letterSpacing: "-0.04em" }}>{data.fullName || "Your Full Name"}</h1>
      <div className="contact" style={{ display: 'flex', gap: '8pt', fontSize: '10pt', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9', paddingBottom: '12pt', marginBottom: '20pt' }}>
         <span>{data.email}</span>
         {data.phone && <><span>•</span> <span>{data.phone}</span></>}
         {data.location && <><span>•</span> <span>{data.location}</span></>}
      </div>
      <div style={{ whiteSpace: "pre-wrap", fontSize: "11pt", lineHeight: 1.65, color: "#1e293b" }}>{content}</div>
    </div>
  );
}

/* ====== Mock Content Fallback ====== */

function buildMockContent(data: ResumeData, tone: string): string {
  const skills = data.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const toneAdj = tone === "Creative" ? "innovative and dynamic" : tone === "Concise" ? "direct and impactful" : "professional and achievement-focused";

  return `PROFESSIONAL SUMMARY
Results-driven ${data.jobRole || "professional"} with ${data.experienceLevel || "solid"} experience delivering ${toneAdj} solutions. Proficient in ${skills.slice(0, 4).join(", ") || "relevant technologies"} with a track record of driving measurable outcomes in high-pressure environments.

CORE SKILLS
${skills.map((s) => `• ${s}`).join("\n") || "• Strategic Planning\n• Team Leadership\n• Problem Solving"}

EXPERIENCE
${data.companyRole || data.jobRole || "Role"} — ${data.companyName || "Company"}
${data.duration || "Duration"}
• Spearheaded development of core product features resulting in a 25% improvement in user engagement within six months
• Collaborated with cross-functional teams of 8+ engineers to deliver high-impact projects 15% ahead of schedule
• Implemented automated testing pipelines reducing deployment bugs by 40% and shortening release cycles
${data.jobDescription ? `• ${data.jobDescription}` : ""}

EDUCATION
${data.degree || "Degree"} — ${data.college || "University"}
Graduated: ${data.gradYear || "Year"}`;
}
