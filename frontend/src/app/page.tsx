"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSEO, logout, getUser } from "@/lib/api";
import { Copy, Check, Loader2, Sparkles, LogOut, AlertCircle, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import YoutubeGrowthAgent from "@/components/agents/YoutubeGrowthAgent";

type TabType = 'seo' | 'growth';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('seo');
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      router.push("/login");
    } else {
      setUser(userData);
    }
  }, [router]);

 const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  try {
    setLoading(true);
    setError("");

    // LOGIN API
    const data = await login(
      email,
      password
    );

    console.log(
      "LOGIN SUCCESS:",
      data
    );

    // REDIRECT TO DASHBOARD
    window.location.href =
      "/dashboard";

  } catch (err: any) {
    console.error(err);

    setError(
      err?.response?.data?.detail ||
      "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  const userName = user?.full_name || user?.username || user?.email || "User";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LearningWithAhad Studio</h1>
              <p className="text-xs text-gray-500">AI-Powered YouTube Growth</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              Hi, {userName}
            </span>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => { setActiveTab('seo'); setResult(null); }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'seo' 
                  ? 'border-purple-600 text-purple-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🎯 SEO Optimizer
            </button>
            <button
              onClick={() => { setActiveTab('growth'); setResult(null); }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                activeTab === 'growth' 
                  ? 'border-purple-600 text-purple-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Growth Agent
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {activeTab === 'seo' ? (
          <div>
            {/* SEO Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate SEO Optimization</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video Topic *</label>
                    <input 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
                      placeholder="e.g., Python Async/Await Tutorial" 
                      value={topic} 
                      onChange={e => setTopic(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience *</label>
                    <input 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
                      placeholder="e.g., Students, Developers" 
                      value={audience} 
                      onChange={e => setAudience(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Points (one per line)</label>
                  <textarea 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm" 
                    rows={3} 
                    placeholder="• What is async/await?&#10;• Syntax examples&#10;• Common pitfalls" 
                    value={keyPoints} 
                    onChange={e => setKeyPoints(e.target.value)} 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                  {loading ? "Generating..." : "Generate SEO"}
                </button>
              </form>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> 
                {error}
              </div>
            )}

            {/* SEO Results */}
            {result && (
              <div className="space-y-6 animate-in fade-in-50">
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">🎯 Optimized Titles</h3>
                  {result.titles?.map((t: any, i: number) => (
                    <div key={i} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg mb-2">
                      <div>
                        <p className="font-medium">{t.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Score: {t.score}/10 • {t.reason}</p>
                      </div>
                      <button onClick={() => copyToClipboard(t.title, `t${i}`)} className="text-gray-400 hover:text-purple-600">
                        {copied === `t${i}` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  ))}
                </section>
                
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">📝 Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{result.description}</p>
                  <button onClick={() => copyToClipboard(result.description, 'desc')} className="mt-3 text-sm text-purple-600">
                    {copied === 'desc' ? '✓ Copied' : 'Copy'}
                  </button>
                </section>

                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">🏷️ Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tags?.map((t: string, i: number) => (
                      <button key={i} onClick={() => copyToClipboard(t, `tag${i}`)} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200">
                        {t}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        ) : (
          <YoutubeGrowthAgent />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p className="font-medium text-gray-700">Built for LearningWithAhad Channel</p>
          <p className="mt-1">Powered by Groq AI • Responses cached for 1 hour</p>
        </div>
      </footer>
    </main>
  );
}
