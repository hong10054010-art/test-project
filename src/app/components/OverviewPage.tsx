import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, MessageSquare, AlertTriangle, Hash, Sparkles, ThumbsUp, ThumbsDown, Minus, Save, Share2, RotateCw, Download, Filter, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { queryFeedback, saveView, getSavedViews } from "../../lib/api";
import { toast } from "sonner";

// Mock data
const trendData = [
  { date: "Feb 1", mentions: 145, sentiment: 72 },
  { date: "Feb 2", mentions: 167, sentiment: 68 },
  { date: "Feb 3", mentions: 189, sentiment: 75 },
  { date: "Feb 4", mentions: 234, sentiment: 81 },
  { date: "Feb 5", mentions: 298, sentiment: 85 },
  { date: "Feb 6", mentions: 245, sentiment: 79 },
  { date: "Feb 7", mentions: 267, sentiment: 82 },
  { date: "Feb 8", mentions: 312, sentiment: 88 },
  { date: "Feb 9", mentions: 356, sentiment: 92 },
];

const topKeywords = [
  { 
    keyword: "customer service", 
    mentions: 1247, 
    growth: "+23%", 
    sentiment: "positive",
    trend: [45, 52, 58, 62, 71, 78, 82],
    watched: false
  },
  { 
    keyword: "slow loading", 
    mentions: 892, 
    growth: "+15%", 
    sentiment: "negative",
    trend: [32, 38, 42, 48, 55, 61, 65],
    watched: true
  },
  { 
    keyword: "easy to use", 
    mentions: 756, 
    growth: "+8%", 
    sentiment: "positive",
    trend: [40, 41, 43, 46, 48, 52, 55],
    watched: false
  },
  { 
    keyword: "pricing", 
    mentions: 634, 
    growth: "-3%", 
    sentiment: "neutral",
    trend: [50, 49, 47, 45, 44, 42, 41],
    watched: true
  },
  { 
    keyword: "integration", 
    mentions: 589, 
    growth: "+31%", 
    sentiment: "positive",
    trend: [25, 28, 35, 42, 48, 53, 58],
    watched: false
  },
];

const sectorData = [
  { sector: "Technology", mentions: 2341, positive: 68, negative: 12, neutral: 20 },
  { sector: "Healthcare", mentions: 1892, positive: 72, negative: 8, neutral: 20 },
  { sector: "Finance", mentions: 1567, positive: 61, negative: 15, neutral: 24 },
  { sector: "Retail", mentions: 1234, positive: 58, negative: 18, neutral: 24 },
];

interface OverviewPageProps {
  onNavigate?: (page: string, filter?: string) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [watchedKeywords, setWatchedKeywords] = useState<string[]>(["slow loading", "pricing"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await queryFeedback({ timeRange: "30" });
      if (response.ok) {
        // Data loaded successfully
        console.log("Overview data loaded:", response);
      }
    } catch (error) {
      console.error("Failed to load overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const result = await saveView("Overview Dashboard", { timeRange: "30" });
      if (result.ok) {
        toast.success("View saved successfully");
      } else {
        toast.error("Failed to save view");
      }
    } catch (error) {
      toast.error("Failed to save view");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: "Feedback Insights Dashboard",
        text: "Check out this feedback analytics dashboard",
        url: url
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const handleRefresh = () => {
    loadData();
    toast.success("Data refreshed");
  };

  const handleFilter = () => {
    toast.info("Filter panel coming soon");
  };

  const handleExport = () => {
    const data = {
      metrics: {
        totalMentions: 8234,
        positivePercent: 68,
        negativePercent: 10,
        spikeAlerts: 3
      },
      trends: trendData,
      keywords: topKeywords,
      sectors: sectorData
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `overview-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const toggleWatchlist = (keyword: string) => {
    if (watchedKeywords.includes(keyword)) {
      setWatchedKeywords(watchedKeywords.filter(k => k !== keyword));
      toast.info(`Removed "${keyword}" from watchlist`);
    } else {
      setWatchedKeywords([...watchedKeywords, keyword]);
      toast.success(`Added "${keyword}" to watchlist`);
    }
  };

  const handleKeywordClick = (keyword: string) => {
    if (onNavigate) {
      onNavigate("keywords", keyword);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-[#84cc16]" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-[#ef4444]" />;
      default:
        return <Minus className="h-4 w-4 text-[#fde047]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">Real-time feedback analytics and AI insights</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-2"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RotateCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-2"
            onClick={handleFilter}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90" 
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Section 1: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-2 hover:border-primary transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Mentions</p>
              <h2 className="mt-2">8,234</h2>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-[#84cc16]" />
                <span className="text-sm text-[#84cc16]">+12.5%</span>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 hover:border-primary transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Positive %</p>
              <h2 className="mt-2">68%</h2>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-[#84cc16]" />
                <span className="text-sm text-[#84cc16]">+5.2%</span>
              </div>
            </div>
            <div className="p-3 bg-[#84cc16]/10 rounded-lg">
              <ThumbsUp className="h-6 w-6 text-[#84cc16]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 hover:border-primary transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Negative %</p>
              <h2 className="mt-2">10%</h2>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="h-4 w-4 text-[#84cc16]" />
                <span className="text-sm text-[#84cc16]">-2.1%</span>
              </div>
            </div>
            <div className="p-3 bg-[#ef4444]/10 rounded-lg">
              <ThumbsDown className="h-6 w-6 text-[#ef4444]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 hover:border-primary transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Spike Alerts</p>
              <h2 className="mt-2">3</h2>
              <Badge className="mt-2 bg-[#fde047] text-[#365314]">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="p-3 bg-[#fde047]/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-[#facc15]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Section 2: Trend + Peak */}
      <Card className="p-6 border-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3>Mention Trends & Sentiment</h3>
            <p className="text-sm text-muted-foreground mt-1">Daily mentions with sentiment scores</p>
          </div>
          <Badge className="bg-[#84cc16] text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            Peak: Feb 9
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fde047" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fde047" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(132, 204, 22, 0.2)" />
            <XAxis dataKey="date" stroke="#65a30d" />
            <YAxis stroke="#65a30d" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '2px solid rgba(132, 204, 22, 0.2)',
                borderRadius: '0.625rem'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="mentions" 
              stroke="#84cc16" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMentions)"
              name="Mentions"
            />
            <Area 
              type="monotone" 
              dataKey="sentiment" 
              stroke="#fde047" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSentiment)"
              name="Sentiment Score"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Section 3 & 4: Keywords and Sectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3: Top Keywords Snapshot */}
        <Card className="p-6 border-2">
          <div className="flex items-center justify-between mb-4">
            <h3>Top Keywords</h3>
            <Hash className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {topKeywords.map((item) => (
              <div 
                key={item.keyword}
                className="group p-4 bg-muted/50 hover:bg-muted rounded-lg border-2 border-transparent hover:border-primary transition-all cursor-pointer relative"
                onClick={() => handleKeywordClick(item.keyword)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="truncate">{item.keyword}</h4>
                      {getSentimentIcon(item.sentiment)}
                      {watchedKeywords.includes(item.keyword) && (
                        <Bookmark className="h-4 w-4 text-primary fill-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{item.mentions.toLocaleString()} mentions</span>
                      <span className={`${item.growth.startsWith('+') ? 'text-[#84cc16]' : 'text-[#ef4444]'}`}>
                        {item.growth}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mini Trend Chart */}
                  <div className="w-20 h-12 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={item.trend.map((value, i) => ({ value }))}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#84cc16" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Watch Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(item.keyword);
                    }}
                  >
                    <Bookmark className={`h-4 w-4 ${watchedKeywords.includes(item.keyword) ? 'fill-primary text-primary' : ''}`} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 4: Sector Overview */}
        <Card className="p-6 border-2">
          <h3 className="mb-4">Sector Overview</h3>
          <div className="space-y-4">
            {sectorData.map((sector) => (
              <div key={sector.sector} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4>{sector.sector}</h4>
                    <p className="text-sm text-muted-foreground">{sector.mentions.toLocaleString()} mentions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-[#84cc16]" />
                    <span className="text-sm">{sector.positive}%</span>
                  </div>
                </div>
                <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
                  <div 
                    className="bg-[#84cc16]" 
                    style={{ width: `${sector.positive}%` }}
                  />
                  <div 
                    className="bg-[#fde047]" 
                    style={{ width: `${sector.neutral}%` }}
                  />
                  <div 
                    className="bg-[#ef4444]" 
                    style={{ width: `${sector.negative}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Positive: {sector.positive}%</span>
                  <span>Neutral: {sector.neutral}%</span>
                  <span>Negative: {sector.negative}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Section 5: AI Quick Insights */}
      <Card className="p-6 border-2 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary rounded-lg">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3>AI Quick Insights</h3>
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-background rounded-lg border-2">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-[#84cc16] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">
                      <span className="text-primary">Positive Trend:</span> "Customer service" mentions increased 23% with 89% positive sentiment. Consider highlighting this in marketing materials.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-background rounded-lg border-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-[#fde047] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">
                      <span className="text-primary">Alert:</span> "Slow loading" complaints spiked 31% today. Performance team should investigate immediately.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-background rounded-lg border-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">
                      <span className="text-primary">Opportunity:</span> Healthcare sector shows 72% positive sentiment. Consider expanding features for this vertical.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
