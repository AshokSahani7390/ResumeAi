"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SavedResume {
  id: string;
  title: string;
  jobRole: string;
  template: string;
  atsScore: number | null;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch resumes from API
  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("resumeai_token");
      if (!token) return;

      const res = await fetch("/api/resumes", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
      // Fallback to localStorage if API fails
      const savedResumes = localStorage.getItem("resumeai_resumes");
      if (savedResumes) {
        setResumes(JSON.parse(savedResumes));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("resumeai_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(stored));
    fetchResumes();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      const token = localStorage.getItem("resumeai_token");
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setResumes(resumes.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete resume:", err);
      // Fallback
      const updated = resumes.filter((r) => r.id !== id);
      setResumes(updated);
      localStorage.setItem("resumeai_resumes", JSON.stringify(updated));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("resumeai_user");
    localStorage.removeItem("resumeai_token");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Top Bar */}
      <header className="glass-card border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            ResumeAI
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-text-muted)]">
              Hi, <span className="font-semibold text-[var(--color-text)]">{user.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Resumes</h1>
            <p className="text-[var(--color-text-muted)] text-base mt-2">
              Manage and create new AI-optimized career documents
            </p>
          </div>
          <Link href="/create" className="btn-primary flex items-center justify-center gap-2 px-8 py-4 !rounded-2xl shadow-lg hover:shadow-blue-200/50 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Resume
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-gray-100 shadow-sm border border-gray-200"></div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center border-2 border-dashed border-[var(--color-border)]">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-8">
              📄
            </div>
            <h3 className="text-2xl font-bold mb-3">No Resumes Yet</h3>
            <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Start building your first AI-powered resume in just 2 minutes and get hired faster by top companies.
            </p>
            <Link href="/create" className="btn-primary inline-flex items-center gap-2 px-10 py-4 !rounded-2xl text-lg font-bold">
              Build My First Resume
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="glass-card rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group border border-[var(--color-border)] relative overflow-hidden"
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-100/50 transition-colors"></div>

                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-inner">
                    📄
                  </div>
                  {resume.atsScore && (
                    <div className="flex flex-col items-end">
                      <span className={`text-base font-bold ${resume.atsScore > 80 ? 'text-green-600' : 'text-orange-600'}`}>
                        {resume.atsScore}%
                      </span>
                      <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">ATS Score</span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors truncate">
                  {resume.title}
                </h3>
                <p className="text-sm font-medium text-[var(--color-text-muted)] mb-6 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  {resume.jobRole || "Professional Resume"}
                </p>
                
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-8 pb-6 border-b border-gray-50">
                   <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(resume.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                   </div>
                   <span className="px-2 py-1 rounded-lg bg-gray-100 font-bold text-gray-500 tracking-tight">
                    {resume.template} Template
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <Link
                    href={`/create?resumeId=${resume.id}`}
                    className="flex-[1.5] text-center py-3 rounded-2xl text-sm font-bold bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-all border border-gray-100 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="flex-1 text-center py-3 rounded-2xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Premium CTA */}
      <footer className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-blue-200">
           <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Upgrade to Pro</h3>
              <p className="text-blue-100 opacity-90 max-w-sm">Unlock unlimited resumes, premium templates, and deep ATS analysis for just ₹499.</p>
           </div>
           <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-lg text-lg">
              Get Pro Access
           </button>
        </div>
      </footer>
    </div>
  );
}
