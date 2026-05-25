"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  generateSEO,
  logout,
  getUser,
  isAuthenticated,
} from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState<any>(null);

  const [topic, setTopic] =
    useState("");

  const [audience, setAudience] =
    useState("");

  const [result, setResult] =
    useState<any>(null);

  const [generating, setGenerating] =
    useState(false);

  // =========================
  // AUTH CHECK
  // =========================

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

  // =========================
  // LOADING SCREEN
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // =========================
  // GENERATE SEO
  // =========================

  async function handleGenerate() {
    try {
      setGenerating(true);

      const data =
        await generateSEO(
          topic,
          audience,
          []
        );

      setResult(data);

    } catch (err) {
      console.error(err);

      alert(
        "Failed to generate SEO"
      );

    } finally {
      setGenerating(false);
    }
  }

  // =========================
  // PAGE UI
  // =========================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            YouTube SEO Studio
          </h1>

          <p className="text-sm text-gray-500">
            Welcome{" "}
            {user?.full_name ||
              user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </header>

      {/* CONTENT */}

      <section className="max-w-3xl mx-auto p-6">

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-xl font-semibold mb-4">
            Generate SEO
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Video Topic"
              value={topic}
              onChange={(e) =>
                setTopic(
                  e.target.value
                )
              }
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              type="text"
              placeholder="Target Audience"
              value={audience}
              onChange={(e) =>
                setAudience(
                  e.target.value
                )
              }
              className="w-full border rounded-lg px-4 py-3"
            />

            <button
              onClick={
                handleGenerate
              }
              disabled={
                generating
              }
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
            >
              {generating
                ? "Generating..."
                : "Generate SEO"}
            </button>

          </div>

        </div>

        {/* RESULTS */}

        {result && (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">

            <h3 className="text-lg font-semibold mb-4">
              SEO Result
            </h3>

            <pre className="whitespace-pre-wrap text-sm overflow-auto">
              {JSON.stringify(
                result,
                null,
                2
              )}
            </pre>

          </div>
        )}

      </section>
    </main>
  );
}