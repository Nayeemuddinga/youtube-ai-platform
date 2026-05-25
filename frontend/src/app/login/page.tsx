'use client';

import { useState } from 'react';

import {
  generateSEO,
  logout,
} from '@/lib/api';

export default function HomePage() {

  const [topic, setTopic] =
    useState('');

  const [audience, setAudience] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<any>(null);

  // =========================
  // GENERATE SEO
  // =========================

  const handleGenerate =
    async () => {

    try {

      setLoading(true);

      const response =
        await generateSEO(
          topic,
          audience,
          []
        );

      setResult(response);

    } catch (err) {

      console.error(err);

      alert(
        'SEO generation failed'
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white border-b shadow-sm">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold text-gray-900">
              YouTube SEO Studio
            </h1>

            <p className="text-gray-500 mt-1">
              AI Powered YouTube Growth
            </p>

          </div>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
          >
            Logout
          </button>

        </div>

      </header>

      {/* MAIN */}

      <main className="max-w-5xl mx-auto p-8">

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-3xl font-bold mb-8">
            Generate SEO
          </h2>

          {/* FORM */}

          <div className="space-y-6">

            <div>

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
                className="w-full border border-gray-300 rounded-xl px-4 py-4 text-lg"
              />

            </div>

            <div>

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
                className="w-full border border-gray-300 rounded-xl px-4 py-4 text-lg"
              />

            </div>

            <button
              onClick={handleGenerate}
              disabled={
                loading ||
                !topic ||
                !audience
              }
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-8 py-4 rounded-xl text-lg"
            >
              {
                loading
                  ? 'Generating...'
                  : 'Generate SEO'
              }
            </button>

          </div>

          {/* RESULTS */}

          {result && (

            <div className="mt-10 border-t pt-8">

              <h3 className="text-2xl font-bold mb-6">
                SEO Results
              </h3>

              <pre className="bg-black text-green-400 rounded-xl p-6 overflow-auto text-sm">
                {
                  JSON.stringify(
                    result,
                    null,
                    2
                  )
                }
              </pre>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}