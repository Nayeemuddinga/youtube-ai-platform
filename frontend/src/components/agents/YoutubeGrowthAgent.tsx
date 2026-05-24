"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Sparkles, Copy, Check, Image, FileText, Hash, Clock, TrendingUp, MessageSquare, Download, RefreshCw, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface GrowthResult {
  success: boolean;
  topic: string;
  data?: {
    seo: {
      titles: Array<{title: string; score: number; reason: string}>;
      description: string;
      tags: string[];
      hashtags: string[];
    };
    thumbnails: Array<{title: string; visual_description: string; text_overlay: string; color_palette: string[]}>;
    social_posts: {facebook: string; instagram: string; twitter: string; linkedin: string};
    hooks: string[];
    script_outline: {hook: string; main_points: Array<{timestamp: string; content: string}>; cta: string};
    upload_strategy: {best_time_ist: string; playlist: string; community_post: string};
    growth_tips: string[];
    follow_up_ideas: string[];
  };
  error?: string;
}

interface ThumbnailWithImage {
  title: string;
  visual_description: string;
  text_overlay: string;
  color_palette: string[];
  image_url?: string;
  generation_status?: "success" | "fallback" | "loading";
}

export default function YoutubeGrowthAgent() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [videoLength, setVideoLength] = useState("8-12 minutes");
  const [loading, setLoading] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [result, setResult] = useState<GrowthResult | null>(null);
  const [thumbnailImages, setThumbnailImages] = useState<ThumbnailWithImage[] | null>(null);
  const [imageLoading, setImageLoading] = useState<{[key: number]: boolean}>({});
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setThumbnailImages(null);
    
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await api.post("/api/v1/youtube/growth/generate", {
        topic,
        target_audience: audience,
        key_points: keyPoints.split('\n').filter(k => k.trim()),
        video_length: videoLength
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResult(response.data);
      toast.success("🎬 Marketing package generated!");
      
      // Auto-generate thumbnail images if concepts exist
      if (response.data.data?.thumbnails?.length > 0) {
        setTimeout(() => handleGenerateImages(response.data.data.thumbnails), 500);
      }
      
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to generate package";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImages = async (concepts: any[]) => {
    setGeneratingImages(true);
    // Set all images to loading state
    const loadingState: {[key: number]: boolean} = {};
    concepts.forEach((_, i) => { loadingState[i] = true; });
    setImageLoading(loadingState);
    
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.post("/api/v1/thumbnails/generate", {
        concepts: concepts.map(c => ({
          title: c.title,
          visual_description: c.visual_description,
          text_overlay: c.text_overlay
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setThumbnailImages(response.data.images);
        toast.success("🎨 Thumbnail images generated!");
      }
    } catch (err: any) {
      toast.error("Failed to generate images, using placeholders");
      // Fallback: use concepts with placeholder URLs
      setThumbnailImages(concepts.map(c => ({
        ...c,
        image_url: `https://via.placeholder.com/1280x720/8b5cf6/ffffff?text=${encodeURIComponent(c.title)}`,
        generation_status: "fallback"
      })));
    } finally {
      setGeneratingImages(false);
      // Clear loading state
      setImageLoading({});
    }
  };

  const handleImageLoad = (index: number) => {
    const newLoading = {...imageLoading};
    delete newLoading[index];
    setImageLoading(newLoading);
  };

  const handleImageError = (index: number, concept: ThumbnailWithImage) => {
    // Fallback to placeholder if image fails to load
    const newImages = [...(thumbnailImages || [])];
    if (newImages[index]) {
      newImages[index] = {
        ...newImages[index],
        image_url: `https://via.placeholder.com/1280x720/ef4444/ffffff?text=${encodeURIComponent(concept.title)}`,
        generation_status: "fallback"
      };
      setThumbnailImages(newImages);
    }
    toast.error(`Failed to load image ${index + 1}`);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("📥 Image downloaded!");
    } catch (err) {
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
      toast.success("🔗 Image opened in new tab");
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Generate Complete Marketing Package
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Topic *</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g., Python Async/Await Explained"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience *</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g., Students, Developers"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Points (optional, one per line)</label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
              rows={3}
              placeholder="• What is async/await?&#10;• Syntax examples&#10;• Common pitfalls"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Length</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={videoLength}
              onChange={(e) => setVideoLength(e.target.value)}
            >
              <option value="3-5 minutes">Short (3-5 min)</option>
              <option value="8-12 minutes">Standard (8-12 min)</option>
              <option value="15-20 minutes">Long-form (15-20 min)</option>
              <option value="20+ minutes">Deep Dive (20+ min)</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading || !topic}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-5 w-5" /> Generate Full Package</>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && result.success && result.data && (
        <div className="space-y-8 animate-in fade-in-50">
          
          {/* Thumbnails Section with Images */}
          {result.data.thumbnails?.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold">Thumbnail Concepts</h3>
                </div>
                {!thumbnailImages && !generatingImages && (
                  <button
                    onClick={() => handleGenerateImages(result.data!.thumbnails)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition"
                  >
                    <Image className="h-4 w-4" /> Generate Images
                  </button>
                )}
              </div>
              
              {generatingImages && (
                <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500 mr-3" />
                  <div>
                    <p className="text-gray-700 font-medium">Generating thumbnail images...</p>
                    <p className="text-sm text-gray-500">This may take 10-30 seconds for the first generation</p>
                  </div>
                </div>
              )}
              
              {thumbnailImages && (
                <div className="grid md:grid-cols-3 gap-4">
                  {thumbnailImages.map((thumb: ThumbnailWithImage, i: number) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg border hover:border-orange-300 transition">
                      {/* Image Preview */}
                      <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-200 aspect-video">
                        {imageLoading[i] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                          </div>
                        )}
                        <img 
                          src={thumb.image_url} 
                          alt={thumb.title}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading[i] ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={() => handleImageLoad(i)}
                          onError={() => handleImageError(i, thumb)}
                          loading="lazy"
                        />
                        {thumb.generation_status === "fallback" && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
                            Placeholder
                          </div>
                        )}
                      </div>
                      
                      {/* Concept Details */}
                      <p className="font-medium text-sm mb-1 text-gray-900">{thumb.title}</p>
                      <p className="text-xs text-gray-500 mb-2 italic line-clamp-2">"{thumb.visual_description}"</p>
                      
                      {/* Text Overlay Preview */}
                      <div className="bg-white p-2 rounded text-center font-bold text-sm border-2 border-dashed border-gray-300 mb-3">
                        {thumb.text_overlay}
                      </div>
                      
                      {/* Color Palette */}
                      {thumb.color_palette && thumb.color_palette.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Colors:</p>
                          <div className="flex gap-1">
                            {thumb.color_palette.slice(0, 3).map((color: string, j: number) => (
                              <div 
                                key={j} 
                                className="w-6 h-6 rounded border border-gray-200 shadow-sm" 
                                style={{backgroundColor: color}} 
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadImage(thumb.image_url || "", `thumbnail-${i+1}.png`)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium"
                        >
                          <Download className="h-3 w-3" /> Download
                        </button>
                        <button
                          onClick={() => window.open(thumb.image_url, '_blank')}
                          className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(thumb.text_overlay, `overlay-${i}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition font-medium"
                        >
                          {copied === `overlay-${i}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SEO Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">SEO Optimization</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Best Title</p>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-start">
                  <div>
                    <p className="font-medium">{result.data.seo.titles[0]?.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Score: {result.data.seo.titles[0]?.score}/10 • {result.data.seo.titles[0]?.reason}</p>
                  </div>
                  <button onClick={() => copyToClipboard(result.data?.seo?.titles?.[0]?.title ?? '', 'title')} className="p-1.5 hover:bg-gray-200 rounded">
                    {copied === 'title' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.data.seo.hashtags.map((tag: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">{tag}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Social Posts Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Social Media Posts</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(result.data.social_posts).map(([platform, content]: [string, any]) => (
                <div key={platform} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm capitalize mb-2">{platform}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
                  <button onClick={() => copyToClipboard(content as string, platform)} className="mt-2 text-xs text-purple-600 hover:underline">
                    {copied === platform ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Script Outline Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold">Video Script Outline</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <p className="text-sm font-medium text-yellow-800 mb-1">🎣 Hook (0-15s)</p>
                <p className="text-gray-800">{result.data.script_outline.hook}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-sm font-medium mb-2">📝 Main Points</p>
                <ul className="space-y-2">
                  {result.data.script_outline.main_points.map((point: any, i: number) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-gray-400 font-mono">{point.timestamp}</span>
                      <span>{point.content}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm font-medium text-green-800 mb-1">📢 Call to Action</p>
                <p className="text-gray-800">{result.data.script_outline.cta}</p>
              </div>
            </div>
          </section>

          {/* Upload Strategy */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold">Upload Strategy</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-1">Best Time (IST)</p>
                <p className="font-medium">{result.data.upload_strategy.best_time_ist}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-1">Playlist</p>
                <p className="font-medium">{result.data.upload_strategy.playlist}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-1">Community Post</p>
                <p className="font-medium">{result.data.upload_strategy.community_post}</p>
              </div>
            </div>
          </section>

          {/* Growth Tips */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-pink-600" />
              <h3 className="font-semibold">💡 Growth Tips</h3>
            </div>
            <ul className="space-y-2">
              {result.data.growth_tips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>
      )}

      {/* Error State */}
      {result && !result.success && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Generation Failed</p>
          <p className="text-sm">{result.error}</p>
        </div>
      )}
    </div>
  );
}
