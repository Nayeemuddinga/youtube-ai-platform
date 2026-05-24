// frontend/src/app/dashboard/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/api';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Mock data for demo - replace with real API call later
    setTimeout(() => {
      setStats({
        totalPackages: 12,
        totalThumbnails: 36,
        totalSeoOptimizations: 8,
        avgSeoScore: 87,
        recentActivity: [
          { id: 1, topic: 'AI for Kids', type: 'Growth Package', date: '2024-01-15' },
          { id: 2, topic: 'Python Tutorial', type: 'SEO Optimization', date: '2024-01-14' },
          { id: 3, topic: 'Thumbnail Design', type: 'Thumbnail', date: '2024-01-13' },
        ]
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-gray-500">Track your content growth and usage stats</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Total Packages</p>
          <p className="text-2xl font-bold mt-1">{stats?.totalPackages || 0}</p>
          <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Thumbnails</p>
          <p className="text-2xl font-bold mt-1">{stats?.totalThumbnails || 0}</p>
          <p className="text-xs text-green-600 mt-1">+24% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">SEO Optimizations</p>
          <p className="text-2xl font-bold mt-1">{stats?.totalSeoOptimizations || 0}</p>
          <p className="text-xs text-green-600 mt-1">+8% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Avg SEO Score</p>
          <p className="text-2xl font-bold mt-1">{stats?.avgSeoScore || 0}/100</p>
          <p className="text-xs text-green-600 mt-1">+5 pts improvement</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {stats?.recentActivity?.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">{item.topic}</p>
                  <p className="text-sm text-gray-500">{item.type}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent activity found.</p>
        )}
      </div>
    </div>
  );
}