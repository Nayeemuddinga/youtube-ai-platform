"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Copy, Check, Loader2, Sparkles, RefreshCw, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<{ hit_rate_percent: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/metrics/cache");
        if (res.ok) setCacheStats(await res.json());
      } catch {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://localhost:8000/api/v1/seo/optimize", {
        topic, target_audience: audience, key_points: keyPoints.split('\n').filter((l: string) => l.trim())
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });
      setResult(res.data);
      toast.success("✨ SEO optimized!");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to connect";
      setError(msg);
      toast.error(msg);
      if (err.response?.status === 401) {
        localStorage.clear();
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!topic || !audience) return toast.error("Fill topic & audience first");
    setRefreshing(true);
    try {
      await axios.post("http://localhost:8000/api/v1/seo/invalidate", {}, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });
      setResult(null);
      toast.success("🔄 Cache cleared - regenerating...");
      setTimeout(() => handleSubmit(new Event('submit') as any), 500);
    } catch { toast.error("Failed to refresh"); }
    finally { setRefreshing(false); }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success(" Logged out");
    router.push("/login");
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 mx-auto">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">YouTube SEO Optimizer</h1>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
          <p className="text-gray-600 mb-3">AI-powered titles, descriptions & tags in seconds</p>
          {cacheStats && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full text-sm">
              <span className="text-gray-600">Cache efficiency:</span>
              <span className={`font-semibold ${cacheStats.hit_rate_percent >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>{cacheStats.hit_rate_percent}%</span>
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Video Topic *" value={topic} onChange={(e) => setTopic(e.target.value)} required />
            <input className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Target Audience *" value={audience} onChange={(e) => setAudience(e.target.value)} required />
          </div>
          <textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm mb-4" placeholder="Key Points (optional, one per line)" rows={3} value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={loading} className="flex-1 sm:flex-none px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Optimizing...</> : <><Sparkles className="h-4 w-4" /> Generate SEO</>}
            </button>
            {result && <button type="button" onClick={handleRefresh} disabled={refreshing} className="flex-1 sm:flex-none px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition flex items-center justify-center gap-2"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>}
          </div>
        </form>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {result && (
          <div className="space-y-6 animate-in fade-in-50">
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Optimized Titles</h2>
              <div className="space-y-3">
                {result.titles.map((t: any, i: number) => (
                  <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg group">
                    <div><p className="font-medium">{t.title}</p><p className="text-sm text-gray-500 mt-1">Score: {t.score}/10 • {t.reason}</p></div>
                    <button onClick={() => copyToClipboard(t.title, `title-${i}`)} className="p-2 text-gray-400 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition">{copied === `title-${i}` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}</button>
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">📝 Description</h2><button onClick={() => copyToClipboard(result.description, 'desc')} className="text-sm text-purple-600">{copied === 'desc' ? '✓ Copied' : 'Copy'}</button></div>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{result.description}</p>
              {result.hashtags?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{result.hashtags.map((h: string, i: number) => <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">{h}</span>)}</div>}
            </section>
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🏷️ Tags</h2>
              <div className="flex flex-wrap gap-2">{result.tags.map((t: string, i: number) => <button key={i} onClick={() => copyToClipboard(t, `tag-${i}`)} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition">{t}</button>)}</div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
