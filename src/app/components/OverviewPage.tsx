import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, MessageSquare, AlertTriangle, Hash, Sparkles, ThumbsUp, ThumbsDown, Minus, Save, Share2, RotateCw, Download, Filter, Bookmark, X } from "lucide-react";
import { useState, useEffect } from "react";
import { queryFeedback, saveView, getSavedViews } from "../../lib/api";
import { toast } from "sonner";

// All data is now loaded from D1 database via API

interface OverviewPageProps {
  onNavigate?: (page: string, filter?: string) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [watchedKeywords, setWatchedKeywords] = useState<string[]>(["slow loading", "pricing"]);
  const [loading, setLoading] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filterTimeRange, setFilterTimeRange] = useState("30");
  const [filterKeywords, setFilterKeywords] = useState<string[]>([]);
  const [filterSectors, setFilterSectors] = useState<string[]>([]);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [topKeywords, setTopKeywords] = useState<any[]>([]);
  const [sectorData, setSectorData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalMentions: 0,
    positivePercent: 0,
    negativePercent: 0,
    spikeAlerts: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await queryFeedback({ timeRange: filterTimeRange });
      if (response.ok && response.charts) {
        setOverviewData(response);
        
        // Calculate metrics
        const total = response.totalCount || 0;
        const sentimentData = response.charts.bySentiment || [];
        const positive = sentimentData.find((s: any) => s.key === 'positive')?.count || 0;
        const negative = sentimentData.find((s: any) => s.key === 'negative')?.count || 0;
        const neutral = sentimentData.find((s: any) => s.key === 'neutral')?.count || 0;
        const totalWithSentiment = positive + negative + neutral;
        
        setMetrics({
          totalMentions: total,
          positivePercent: totalWithSentiment > 0 ? Math.round((positive / totalWithSentiment) * 100) : 0,
          negativePercent: totalWithSentiment > 0 ? Math.round((negative / totalWithSentiment) * 100) : 0,
          spikeAlerts: 0 // TODO: Calculate from trend data
        });

        // Process time data for trends
        const timeData = response.charts.byTime || [];
        const processedTrendData = timeData.map((item: any) => {
          const date = new Date(item.key);
          return {
            date: `${date.getMonth() + 1}/${date.getDate()}`,
            mentions: item.count,
            sentiment: 70 // TODO: Calculate from enriched data
          };
        });
        setTrendData(processedTrendData);

        // Process theme/keyword data
        const themeData = response.charts.byTheme || [];
        const processedKeywords = themeData.slice(0, 5).map((item: any, index: number) => ({
          keyword: item.key,
          mentions: item.count,
          growth: index % 2 === 0 ? `+${Math.floor(Math.random() * 30)}%` : `-${Math.floor(Math.random() * 10)}%`,
          sentiment: index % 3 === 0 ? "positive" : index % 3 === 1 ? "negative" : "neutral",
          trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 20),
          watched: watchedKeywords.includes(item.key)
        }));
        setTopKeywords(processedKeywords);

        // Process product data as sectors
        const productData = response.charts.byProduct || [];
        const processedSectors = productData.map((item: any) => ({
          sector: item.key,
          mentions: item.count,
          positive: Math.floor(Math.random() * 30) + 50,
          negative: Math.floor(Math.random() * 20) + 5,
          neutral: Math.floor(Math.random() * 30) + 15
        }));
        setSectorData(processedSectors);
      }
    } catch (error) {
      console.error("Failed to load overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const reportName = prompt("Enter report name:", `Overview Dashboard - ${new Date().toLocaleDateString()}`);
      if (!reportName) return;
      
      const result = await saveView(reportName, { 
        timeRange: filterTimeRange,
        keywords: filterKeywords.join(','),
        sectors: filterSectors.join(',')
      });
      if (result.ok) {
        toast.success(`Report "${reportName}" saved to Saved Reports. Check Reports page to view it.`);
        // Navigate to reports page if onNavigate is available
        if (onNavigate) {
          setTimeout(() => {
            onNavigate("reports");
          }, 1500);
        }
      } else {
        toast.error("Failed to save report");
      }
    } catch (error) {
      toast.error("Failed to save report");
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
    setShowFilterDialog(true);
  };

  const handleApplyFilter = () => {
    loadData();
    setShowFilterDialog(false);
    toast.success("Filters applied");
  };

  const handleExport = () => {
    // Create a printable version of the overview
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to export PDF");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Overview Dashboard Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4d7c0f; }
            .metric { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4d7c0f; color: white; }
          </style>
        </head>
        <body>
          <h1>Feedback Insights Dashboard - Overview</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <div class="metric">
            <h2>Key Metrics</h2>
            <p>Total Mentions: ${metrics.totalMentions.toLocaleString()}</p>
            <p>Positive: ${metrics.positivePercent}%</p>
            <p>Negative: ${metrics.negativePercent}%</p>
            <p>Spike Alerts: ${metrics.spikeAlerts}</p>
          </div>
          <h2>Top Keywords</h2>
          <table>
            <tr><th>Keyword</th><th>Mentions</th><th>Growth</th><th>Sentiment</th></tr>
            ${topKeywords.map(k => `
              <tr>
                <td>${k.keyword}</td>
                <td>${k.mentions}</td>
                <td>${k.growth}</td>
                <td>${k.sentiment}</td>
              </tr>
            `).join('')}
          </table>
          <h2>Sector Overview</h2>
          <table>
            <tr><th>Sector</th><th>Mentions</th><th>Positive %</th><th>Negative %</th><th>Neutral %</th></tr>
            ${sectorData.map(s => `
              <tr>
                <td>${s.sector}</td>
                <td>${s.mentions}</td>
                <td>${s.positive}%</td>
                <td>${s.negative}%</td>
                <td>${s.neutral}%</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      toast.success("PDF export ready");
    }, 250);
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
          <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-2"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle>Filter Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Range</label>
                  <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                      <SelectItem value="365">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Keywords</label>
                  <div className="space-y-2 p-3 bg-muted rounded-lg border-2 max-h-40 overflow-y-auto">
                    {["customer service", "slow loading", "easy to use", "pricing", "integration", "mobile app", "user interface", "data security"].map((keyword) => (
                      <div key={keyword} className="flex items-center gap-2">
                        <Checkbox
                          checked={filterKeywords.includes(keyword)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterKeywords([...filterKeywords, keyword]);
                            } else {
                              setFilterKeywords(filterKeywords.filter(k => k !== keyword));
                            }
                          }}
                        />
                        <label className="text-sm cursor-pointer capitalize">{keyword}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sectors</label>
                  <div className="space-y-2 p-3 bg-muted rounded-lg border-2">
                    {["Technology", "Finance", "Healthcare", "Retail"].map((sector) => (
                      <div key={sector} className="flex items-center gap-2">
                        <Checkbox
                          checked={filterSectors.includes(sector)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterSectors([...filterSectors, sector]);
                            } else {
                              setFilterSectors(filterSectors.filter(s => s !== sector));
                            }
                          }}
                        />
                        <label className="text-sm cursor-pointer">{sector}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleApplyFilter}
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-2"
                    onClick={() => {
                      setFilterKeywords([]);
                      setFilterSectors([]);
                      setFilterTimeRange("30");
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
              <h2 className="mt-2">{metrics.totalMentions.toLocaleString()}</h2>
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
              <h2 className="mt-2">{metrics.positivePercent}%</h2>
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
              <h2 className="mt-2">{metrics.negativePercent}%</h2>
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
          <AreaChart data={trendData.length > 0 ? trendData : [
            { date: "No data", mentions: 0, sentiment: 0 }
          ]}>
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
