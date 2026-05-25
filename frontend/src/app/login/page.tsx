"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  generateSEO,
  logout,
  getUser,
  isAuthenticated,
} from "@/lib/api";

import {
  Copy,
  LogOut,
  Sparkles,
  YoutubeIcon,
  BarChart3,
  Hash,
  FileText,
  Wand2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type SEOResult = {
  titles?: string[];
  description?: string;
  keywords?: string[];
  hashtags?: string[];
  thumbnail_text?: string[];
  script_outline?: string[];
  cta?: string[];
};

// ======================================================
// COMPONENT
// ======================================================

export default function HomePage() {
  const router = useRouter();

  // ======================================================
  // AUTH
  // ======================================================

  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState<any>(null);

  // ======================================================
  // FORM STATE
  // ======================================================

  const [topic, setTopic] =
    useState("");

  const [audience, setAudience] =
    useState("");

  const [keyPoints, setKeyPoints] =
    useState("");

  // ======================================================
  // SEO STATE
  // ======================================================

  const [generating, setGenerating] =
    useState(false);

  const [result, setResult] =
    useState<SEOResult | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState("");

  // ======================================================
  // AUTH CHECK
  // ======================================================

  useEffect(() => {
    const auth =
      isAuthenticated();

    if (!auth) {
      router.replace("/login");
      return;
    }

    const currentUser =
      getUser();

    setUser(currentUser);

    setLoading(false);
  }, [router]);

  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />

          <p className="text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // GENERATE SEO
  // ======================================================

  async function handleGenerate() {
    try {
      setError("");
      setGenerating(true);

      const parsedKeyPoints =
        keyPoints
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);

      const data =
        await generateSEO(
          topic,
          audience,
          parsedKeyPoints
        );

      setResult(data);

    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Failed to generate SEO"
      );

    } finally {
      setGenerating(false);
    }
  }

  // ======================================================
  // COPY
  // ======================================================

  async function handleCopy(
    text: string,
    type: string
  ) {
    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 2000);

    } catch (err) {
      console.error(err);
    }
  }

  // ======================================================
  // FULL EXPORT
  // ======================================================

  const exportText = useMemo(() => {
    if (!result) return "";

    return `
=========================
YOUTUBE SEO PACKAGE
=========================

TOPIC:
${topic}

TARGET AUDIENCE:
${audience}

=========================
TITLES
=========================

${result?.titles?.join("\n")}

=========================
DESCRIPTION
=========================

${result?.description}

=========================
KEYWORDS
=========================

${result?.keywords?.join(", ")}

=========================
HASHTAGS
=========================

${result?.hashtags?.join(" ")}

=========================
THUMBNAIL TEXT
=========================

${result?.thumbnail_text?.join(
  "\n"
)}

=========================
SCRIPT OUTLINE
=========================

${result?.script_outline?.join(
  "\n"
)}

=========================
CTA
=========================

${result?.cta?.join("\n")}
`;
  }, [result, topic, audience]);

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="bg-white border-b shadow-sm sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LEFT */}

          <div className="flex items-center gap-4">

            <div className="bg-purple-100 p-3 rounded-xl">
              <YoutubeIcon className="h-7 w-7 text-purple-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                YouTube SEO Studio
              </h1>

              <p className="text-gray-500">
                Welcome{" "}
                <span className="font-medium">
                  {user?.full_name ||
                    user?.username ||
                    user?.email}
                </span>
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl transition"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>

        </div>
      </header>

      {/* ======================================================
          BODY
      ====================================================== */}

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ======================================================
            LEFT PANEL
        ====================================================== */}

        <div className="lg:col-span-1">

          <div className="bg-white rounded-3xl shadow-sm border p-8 sticky top-28">

            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-8 w-8 text-purple-600" />

              <div>
                <h2 className="text-2xl font-bold">
                  Generate SEO
                </h2>

                <p className="text-gray-500">
                  AI-powered YouTube optimization
                </p>
              </div>
            </div>

            {/* TOPIC */}

            <div className="mb-6">

              <label className="block text-sm font-medium mb-2">
                Video Topic
              </label>

              <input
                type="text"
                placeholder="How to grow on YouTube"
                value={topic}
                onChange={(e) =>
                  setTopic(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

            {/* AUDIENCE */}

            <div className="mb-6">

              <label className="block text-sm font-medium mb-2">
                Target Audience
              </label>

              <input
                type="text"
                placeholder="Beginner creators"
                value={audience}
                onChange={(e) =>
                  setAudience(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

            {/* KEY POINTS */}

            <div className="mb-6">

              <label className="block text-sm font-medium mb-2">
                Key Points
              </label>

              <textarea
                placeholder="SEO, thumbnails, hooks, retention"
                value={keyPoints}
                onChange={(e) =>
                  setKeyPoints(
                    e.target.value
                  )
                }
                rows={5}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500"
              />

              <p className="text-xs text-gray-400 mt-2">
                Separate with commas
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6">
                {error}
              </div>
            )}

            {/* BUTTON */}

            <button
              onClick={handleGenerate}
              disabled={
                generating ||
                !topic ||
                !audience
              }
              className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:opacity-90 disabled:opacity-50 text-white py-4 rounded-2xl font-semibold text-lg transition flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  Generate SEO
                </>
              )}
            </button>

          </div>
        </div>

        {/* ======================================================
            RIGHT PANEL
        ====================================================== */}

        <div className="lg:col-span-2">

          {!result ? (

            <div className="bg-white rounded-3xl shadow-sm border p-16 flex flex-col items-center justify-center text-center">

              <div className="bg-purple-100 p-6 rounded-full mb-6">
                <BarChart3 className="h-16 w-16 text-purple-600" />
              </div>

              <h3 className="text-3xl font-bold mb-4">
                Generate Your SEO Package
              </h3>

              <p className="text-gray-500 max-w-xl">
                Create titles, descriptions,
                keywords, hashtags, thumbnails,
                and script outlines using AI.
              </p>

            </div>

          ) : (

            <div className="space-y-6">

              {/* ======================================================
                  EXPORT BUTTON
              ====================================================== */}

              <div className="flex justify-end">

                <button
                  onClick={() =>
                    handleCopy(
                      exportText,
                      "all"
                    )
                  }
                  className="bg-black text-white px-5 py-3 rounded-xl flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />

                  {copied === "all"
                    ? "Copied!"
                    : "Copy Full Package"}
                </button>

              </div>

              {/* ======================================================
                  TITLES
              ====================================================== */}

              <div className="bg-white rounded-3xl shadow-sm border p-8">

                <div className="flex items-center gap-3 mb-6">

                  <FileText className="h-6 w-6 text-purple-600" />

                  <h3 className="text-2xl font-bold">
                    SEO Titles
                  </h3>

                </div>

                <div className="space-y-4">

                  {result?.titles?.map(
                    (title, index) => (
                      <div
                        key={index}
                        className="border rounded-2xl p-5 flex items-start justify-between gap-4"
                      >
                        <div className="flex gap-3">

                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />

                          <p className="font-medium">
                            {title}
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            handleCopy(
                              title,
                              `title-${index}`
                            )
                          }
                        >
                          <Copy className="h-5 w-5 text-gray-400 hover:text-black" />
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* ======================================================
                  DESCRIPTION
              ====================================================== */}

              <div className="bg-white rounded-3xl shadow-sm border p-8">

                <div className="flex items-center gap-3 mb-6">

                  <FileText className="h-6 w-6 text-purple-600" />

                  <h3 className="text-2xl font-bold">
                    Description
                  </h3>

                </div>

                <div className="bg-gray-50 rounded-2xl p-6 whitespace-pre-wrap">
                  {result?.description}
                </div>

              </div>

              {/* ======================================================
                  KEYWORDS
              ====================================================== */}

              <div className="bg-white rounded-3xl shadow-sm border p-8">

                <div className="flex items-center gap-3 mb-6">

                  <Hash className="h-6 w-6 text-purple-600" />

                  <h3 className="text-2xl font-bold">
                    Keywords
                  </h3>

                </div>

                <div className="flex flex-wrap gap-3">

                  {result?.keywords?.map(
                    (
                      keyword,
                      index
                    ) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium"
                      >
                        {keyword}
                      </span>
                    )
                  )}

                </div>

              </div>

              {/* ======================================================
                  HASHTAGS
              ====================================================== */}

              <div className="bg-white rounded-3xl shadow-sm border p-8">

                <div className="flex items-center gap-3 mb-6">

                  <Hash className="h-6 w-6 text-purple-600" />

                  <h3 className="text-2xl font-bold">
                    Hashtags
                  </h3>

                </div>

                <div className="flex flex-wrap gap-3">

                  {result?.hashtags?.map(
                    (
                      hashtag,
                      index
                    ) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-4 py-2 rounded-full"
                      >
                        {hashtag}
                      </span>
                    )
                  )}

                </div>

              </div>

            </div>

          )}

        </div>

      </div>
    </main>
  );
}