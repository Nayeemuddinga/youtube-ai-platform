'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Package,
  Image,
  Users,
  Clock,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

// Types
interface AnalyticsData {
  totalPackages: number;
  totalThumbnails: number;
  totalSeoOptimizations: number;
  avgSeoScore: number;
  recentActivity: ActivityItem[];
  packageTrend: TrendData[];
  thumbnailTypes: ThumbnailType[];
}

interface ActivityItem {
  id: string;
  type: 'seo' | 'growth' | 'thumbnail';
  topic: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
}

interface TrendData {
  date: string;
  packages: number;
}

interface ThumbnailType {
  name: string;
  value: number;
  color: string;
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/analytics?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your content performance and AI-generated assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Packages"
          value={data?.totalPackages || 0}
          icon={Package}
          trend="+12%"
        />
        <MetricCard
          title="Thumbnails Generated"
          value={data?.totalThumbnails || 0}
          icon={Image}
          trend="+24%"
        />
        <MetricCard
          title="SEO Optimizations"
          value={data?.totalSeoOptimizations || 0}
          icon={TrendingUp}
          trend="+8%"
        />
        <MetricCard
          title="Avg SEO Score"
          value={`${data?.avgSeoScore || 0}/100`}
          icon={Users}
          trend="+5 pts"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Package Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Packages Generated Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.packageTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="packages"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Thumbnail Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Thumbnail Style Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.thumbnailTypes || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.thumbnailTypes || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {(data?.thumbnailTypes || []).map((type, index) => (
                <div key={type.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{type.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(data?.recentActivity || []).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      activity.type === 'seo'
                        ? 'bg-blue-100 text-blue-600'
                        : activity.type === 'growth'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {activity.type === 'seo' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : activity.type === 'growth' ? (
                      <Package className="h-4 w-4" />
                    ) : (
                      <Image className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      {activity.type} optimization
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.topic}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      activity.status === 'completed'
                        ? 'default'
                        : activity.status === 'processing'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {activity.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: number | string;
  icon: any;
  trend: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}