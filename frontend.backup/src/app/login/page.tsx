"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", username: "", password: "", fullName: "" });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const params = new URLSearchParams();
        params.append("username", formData.email);
        params.append("password", formData.password);
        const res = await axios.post("http://localhost:8000/api/v1/auth/login", params, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("✅ Logged in!");
        router.push("/");
      } else {
        await axios.post("http://localhost:8000/api/v1/auth/register", { email: formData.email, username: formData.username || undefined, full_name: formData.fullName || undefined, password: formData.password });
        toast.success("✅ Account created! Please login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2"><Sparkles className="h-8 w-8 text-purple-600" /><h1 className="text-2xl font-bold">YouTube AI</h1></div>
          <p className="text-gray-600">{isLogin ? "Welcome back!" : "Create your account"}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (<><input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} /><input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} /></>)}
          <input type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} required minLength={8} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none pr-10" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <>{isLogin ? "Sign In" : "Create Account"}</>}</button>
        </form>
        <div className="mt-6 text-center"><button type="button" onClick={() => { setIsLogin(!isLogin); setFormData({ email: "", username: "", password: "", fullName: "" }); }} className="text-sm text-purple-600 hover:text-purple-700">{isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}</button></div>
      </div>
    </main>
  );
}
