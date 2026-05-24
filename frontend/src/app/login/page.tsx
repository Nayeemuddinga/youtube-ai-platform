"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, register, getUser } from "@/lib/api";
import { Loader2, Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// Separate component that uses useSearchParams (must be client component)
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(!searchParams.get("register"));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    fullName: "",
  });

  useEffect(() => {
    if (getUser()) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const response = await login(formData.email.trim(), formData.password);
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("refresh_token", response.refresh_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        toast.success("✅ Logged in successfully!");
        router.push("/");
        router.refresh();
      } else {
        await register(
          formData.email.trim(),
          formData.password,
          formData.username.trim() || undefined,
          formData.fullName.trim() || undefined
        );
        toast.success("✅ Account created! Please login.");
        setIsLogin(true);
        setFormData({ email: "", username: "", password: "", fullName: "" });
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMsg = isLogin ? "Login failed" : "Registration failed";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        errorMsg = typeof detail === "string" ? detail : JSON.stringify(detail);
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(String(errorMsg).slice(0, 300));
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">YouTube SEO Studio</h1>
          </div>
          <p className="text-gray-600">
            {isLogin ? "Welcome back to LearningWithAhad tools" : "Create your account"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username (optional)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!isLogin && <p className="text-xs text-gray-500 mt-1">Min 8 characters with uppercase, lowercase, and number</p>}
            </div>
            
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
              ) : (
                <>{isLogin ? "Sign In" : "Create Account"}</>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData({ email: "", username: "", password: "", fullName: "" });
              }}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-6">
          Built for LearningWithAhad • Secure JWT authentication
        </p>
      </div>
    </main>
  );
}

// Main page component with Suspense boundary
export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}