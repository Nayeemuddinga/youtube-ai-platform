'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  generateSEO,
  logout,
  getUser,
} from '@/lib/api';

export default function HomePage() {
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any>(null);

  const [user, setUser] = useState<any>(null);

  // ===============================
  // AUTH CHECK
  // ===============================

  useEffect(() => {
    const storedUser = getUser();

    if (!storedUser) {
      router.push('/login');
      return;
    }

    setUser(storedUser);
  }, [router]);

  // ===============================
  // GENERATE SEO
  // ===============================

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const res = await generateSEO(
        topic,
        audience
      );

      setResult(res);
    } catch (err) {
      console.error(err);
      alert('Failed to generate SEO');
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOADING
  // ===============================

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // ===============================
  // PAGE
  // ===============================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            YouTube SEO Studio
          </h1>

          <p className="text-gray-500 mt-1">
            Welcome {user?.full_name || user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
        >
          Logout
        </button>
      </header>

      {/* MAIN */}

      <main className="max-w-4xl mx-auto p-8">

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-3xl font-bold mb-8">
            Generate SEO
          </h2>

          <div className="space-y-6">

            <input
              type="text"
              placeholder="Video Topic"
              value={topic}
              onChange={(e) =>
                setTopic(e.target.value)
              }
              className="w-full border rounded-xl px-4 py-4 text-lg"
            />

            <input
              type="text"
              placeholder="Target Audience"
              value={audience}
              onChange={(e) =>
                setAudience(e.target.value)
              }
              className="w-full border rounded-xl px-4 py-4 text-lg"
            />

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg"
            >
              {loading
                ? 'Generating...'
                : 'Generate SEO'}
            </button>

          </div>

          {/* RESULTS */}

          {result && (
            <div className="mt-10 border-t pt-8">

              <h3 className="text-2xl font-bold mb-6">
                SEO Results
              </h3>

              <div className="space-y-4">

                <div>
                  <h4 className="font-bold">
                    Title
                  </h4>

                  <p>
                    {result?.seo_title}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold">
                    Description
                  </h4>

                  <p>
                    {result?.seo_description}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold">
                    Keywords
                  </h4>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {result?.keywords?.map(
                      (
                        keyword: string,
                        index: number
                      ) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                        >
                          {keyword}
                        </span>
                      )
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}