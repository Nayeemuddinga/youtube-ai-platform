'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  generateSEO,
  logout,
} from '@/lib/api';

export default function HomePage() {
  const router = useRouter();

  // =========================
  // STATE
  // =========================

  const [user, setUser] =
  useState<any | undefined>(
    undefined
  );

  const [topic, setTopic] =
    useState('');

  const [audience, setAudience] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<any>(null);

  // =========================
  // AUTH CHECK
  // =========================

  useEffect(() => {
    if (
      typeof window === 'undefined'
    ) {
      return;
    }

    const token =
      localStorage.getItem(
        'access_token'
      );

    const userData =
      localStorage.getItem('user');

    // NOT LOGGED IN
    if (!token || !userData) {
      router.replace('/login');
      return;
    }

    try {
      const parsedUser =
        JSON.parse(userData);

      setUser(parsedUser);

    } catch (err) {

      console.error(err);

      localStorage.clear();

      router.replace('/login');
    }

  }, [router]);

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
  // LOADING SCREEN
  // =========================

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

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
              Welcome{' '}
              {
                user?.full_name ||
                user?.username ||
                user?.email ||
                'User'
              }
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

            {/* TOPIC */}

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
                className="w-full border border-gray-300 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

            {/* AUDIENCE */}

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
                className="w-full border border-gray-300 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

            {/* BUTTON */}

            <button
              onClick={handleGenerate}
              disabled={
                loading ||
                !topic ||
                !audience
              }
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-8 py-4 rounded-xl text-lg transition"
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

              {/* TITLE */}

              <div className="mb-8">

                <h4 className="text-lg font-semibold mb-2">
                  SEO Title
                </h4>

                <div className="bg-gray-50 border rounded-xl p-4">
                  {
                    result?.seo_title ||
                    'No title generated'
                  }
                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="mb-8">

                <h4 className="text-lg font-semibold mb-2">
                  Description
                </h4>

                <div className="bg-gray-50 border rounded-xl p-4 whitespace-pre-wrap">
                  {
                    result?.seo_description ||
                    'No description generated'
                  }
                </div>

              </div>

              {/* KEYWORDS */}

              <div className="mb-8">

                <h4 className="text-lg font-semibold mb-3">
                  Keywords
                </h4>

                <div className="flex flex-wrap gap-2">

                  {
                    result?.keywords?.map(
                      (
                        keyword: string,
                        index: number
                      ) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      )
                    )
                  }

                </div>

              </div>

              {/* RAW JSON */}

              <div>

                <h4 className="text-lg font-semibold mb-3">
                  Full Response
                </h4>

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

            </div>

          )}

        </div>

      </main>

    </div>
  );
}