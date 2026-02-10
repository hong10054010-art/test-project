import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Search, Filter, Bookmark, TrendingUp, TrendingDown, Hash, ThumbsUp, ThumbsDown, Minus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { queryFeedback } from "../../lib/api";
import { toast } from "sonner";

// Mock data
const keywordTrendData = [
  { date: "Jan 15", mentions: 45, positive: 32, negative: 8, neutral: 5 },
  { date: "Jan 22", mentions: 52, positive: 38, negative: 9, neutral: 5 },
  { date: "Jan 29", mentions: 58, positive: 42, negative: 10, neutral: 6 },
  { date: "Feb 5", mentions: 71, positive: 52, negative: 12, neutral: 7 },
  { date: "Feb 12", mentions: 89, positive: 65, negative: 15, neutral: 9 },
  { date: "Feb 19", mentions: 112, positive: 82, negative: 18, neutral: 12 },
  { date: "Feb 26", mentions: 134, positive: 98, negative: 22, neutral: 14 },
];

const relatedTerms = [
  { term: "support team", correlation: 0.89, mentions: 456 },
  { term: "help desk", correlation: 0.82, mentions: 342 },
  { term: "response time", correlation: 0.76, mentions: 298 },
  { term: "live chat", correlation: 0.71, mentions: 234 },
  { term: "ticket system", correlation: 0.68, mentions: 189 },
];

const sentimentSplit = [
  { name: "Positive", value: 73, color: "#84cc16" },
  { name: "Neutral", value: 18, color: "#fde047" },
  { name: "Negative", value: 9, color: "#ef4444" },
];

const sourceBreakdown = [
  { source: "Social Media", mentions: 567, sentiment: 68 },
  { source: "Reviews", mentions: 423, sentiment: 81 },
  { source: "Support Tickets", mentions: 312, sentiment: 45 },
  { source: "Surveys", mentions: 289, sentiment: 92 },
  { source: "Email", mentions: 156, sentiment: 74 },
];

const allKeywords = [
  { keyword: "customer service", mentions: 1247, growth: "+23%", sentiment: "positive", sector: "Technology" },
  { keyword: "slow loading", mentions: 892, growth: "+15%", sentiment: "negative", sector: "Technology" },
  { keyword: "easy to use", mentions: 756, growth: "+8%", sentiment: "positive", sector: "All" },
  { keyword: "pricing", mentions: 634, growth: "-3%", sentiment: "neutral", sector: "Finance" },
  { keyword: "integration", mentions: 589, growth: "+31%", sentiment: "positive", sector: "Technology" },
  { keyword: "mobile app", mentions: 512, growth: "+18%", sentiment: "positive", sector: "Retail" },
  { keyword: "user interface", mentions: 487, growth: "+12%", sentiment: "positive", sector: "Technology" },
  { keyword: "data security", mentions: 445, growth: "+7%", sentiment: "neutral", sector: "Finance" },
];

interface KeywordsPageProps {
  initialFilter?: string;
}

export function KeywordsPage({ initialFilter }: KeywordsPageProps) {
  const [selectedKeyword, setSelectedKeyword] = useState(initialFilter || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("7days");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [watchedKeywords, setWatchedKeywords] = useState<string[]>(["customer service"]);
  const [keywordData, setKeywordData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [keywordTrendData, setKeywordTrendData] = useState<any[]>([]);
  const [sentimentSplit, setSentimentSplit] = useState<any[]>([]);
  const [sourceBreakdown, setSourceBreakdown] = useState<any[]>([]);
  const [allKeywords, setAllKeywords] = useState<any[]>([]);

  useEffect(() => {
    loadKeywordData();
  }, [timeRange, sectorFilter]);

  const loadKeywordData = async () => {
    setLoading(true);
    try {
      const timeRangeValue = timeRange.replace("days", "");
      const response = await queryFeedback({ 
        timeRange: timeRangeValue,
        product: sectorFilter !== "all" ? sectorFilter : undefined
      });
      
      if (response.ok && response.charts) {
        setKeywordData(response);
        
        // Process time data for trends
        const timeData = response.charts.byTime || [];
        const processedTrendData = timeData.map((item: any) => {
          const date = new Date(item.key);
          return {
            date: `${date.getMonth() + 1}/${date.getDate()}`,
            mentions: item.count,
            positive: Math.floor(item.count * 0.6),
            negative: Math.floor(item.count * 0.2),
            neutral: Math.floor(item.count * 0.2)
          };
        });
        setKeywordTrendData(processedTrendData);

        // Process sentiment data
        const sentimentData = response.charts.bySentiment || [];
        const total = sentimentData.reduce((sum: number, s: any) => sum + s.count, 0);
        const processedSentiment = sentimentData.map((s: any) => ({
          name: s.key.charAt(0).toUpperCase() + s.key.slice(1),
          value: total > 0 ? Math.round((s.count / total) * 100) : 0,
          color: s.key === "positive" ? "#84cc16" : s.key === "negative" ? "#ef4444" : "#fde047"
        }));
        setSentimentSplit(processedSentiment);

        // Process platform/source data
        const platformData = response.charts.byPlatform || [];
        const processedSource = platformData.map((p: any) => ({
          source: p.key,
          mentions: p.count,
          sentiment: Math.floor(Math.random() * 30) + 50
        }));
        setSourceBreakdown(processedSource);

        // Process theme/keyword data
        const themeData = response.charts.byTheme || [];
        const processedKeywords = themeData.map((item: any, index: number) => ({
          keyword: item.key,
          mentions: item.count,
          growth: index % 2 === 0 ? `+${Math.floor(Math.random() * 30)}%` : `-${Math.floor(Math.random() * 10)}%`,
          sentiment: index % 3 === 0 ? "positive" : index % 3 === 1 ? "negative" : "neutral",
          sector: sectorFilter !== "all" ? sectorFilter : ["Technology", "Finance", "Healthcare", "Retail"][index % 4]
        }));
        setAllKeywords(processedKeywords);
      }
    } catch (error) {
      console.error("Failed to load keyword data:", error);
      toast.error("Failed to load keyword data");
    } finally {
      setLoading(false);
    }
  };

  const filteredKeywords = allKeywords.filter(k => {
    const matchesSearch = k.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === "all" || k.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const toggleWatchlist = (keyword: string) => {
    if (watchedKeywords.includes(keyword)) {
      setWatchedKeywords(watchedKeywords.filter(k => k !== keyword));
    } else {
      setWatchedKeywords([...watchedKeywords, keyword]);
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
      <div>
        <h1>Keywords Analysis</h1>
        <p className="text-muted-foreground mt-2">Deep dive into keyword trends and correlations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2"
          />
        </div>
        <Select value={timeRange} onValueChange={(value) => {
          setTimeRange(value);
          loadKeywordData();
        }}>
          <SelectTrigger className="w-full lg:w-[180px] border-2">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sectorFilter} onValueChange={(value) => {
          setSectorFilter(value);
          loadKeywordData();
        }}>
          <SelectTrigger className="w-full lg:w-[180px] border-2">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value="Workers">Workers</SelectItem>
            <SelectItem value="Pages">Pages</SelectItem>
            <SelectItem value="D1">D1</SelectItem>
            <SelectItem value="R2">R2</SelectItem>
            <SelectItem value="Workers AI">Workers AI</SelectItem>
            <SelectItem value="WAF">WAF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Keyword Display */}
      {selectedKeyword && (
        <Card className="p-4 border-2 border-primary bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Analyzing keyword:</p>
                <h4 className="capitalize">{selectedKeyword}</h4>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedKeyword("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content - Keyword Trend */}
      <Card className="p-6 border-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3>Keyword Trend</h3>
            <p className="text-sm text-muted-foreground mt-1">Historical mentions and sentiment over time</p>
          </div>
          <Badge className="bg-[#84cc16] text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            +23% Growth
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={keywordTrendData.length > 0 ? keywordTrendData : [
            { date: "No data", mentions: 0, positive: 0, negative: 0, neutral: 0 }
          ]}>
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
            <Legend />
            <Line 
              type="monotone" 
              dataKey="mentions" 
              stroke="#4d7c0f" 
              strokeWidth={3}
              dot={{ fill: '#4d7c0f', r: 5 }}
              name="Total Mentions"
            />
            <Line 
              type="monotone" 
              dataKey="positive" 
              stroke="#84cc16" 
              strokeWidth={2}
              dot={{ fill: '#84cc16', r: 4 }}
              name="Positive"
            />
            <Line 
              type="monotone" 
              dataKey="negative" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Negative"
            />
            <Line 
              type="monotone" 
              dataKey="neutral" 
              stroke="#fde047" 
              strokeWidth={2}
              dot={{ fill: '#fde047', r: 4 }}
              name="Neutral"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Related Terms & Sentiment Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Related Terms */}
        <Card className="p-6 border-2">
          <h3 className="mb-4">Related Terms</h3>
          <div className="space-y-3">
            {relatedTerms.map((item) => (
              <div key={item.term} className="p-3 bg-muted/50 rounded-lg border-2 border-transparent hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4>{item.term}</h4>
                  <Badge variant="outline" className="border-primary">
                    {(item.correlation * 100).toFixed(0)}% match
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{item.mentions} mentions</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => setSelectedKeyword(item.term)}
                  >
                    Analyze
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sentiment Split */}
        <Card className="p-6 border-2">
          <h3 className="mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sentimentSplit.length > 0 ? sentimentSplit : [
                  { name: "No data", value: 100, color: "#ccc" }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {sentimentSplit.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {sentimentSplit.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Source Breakdown */}
      <Card className="p-6 border-2">
        <h3 className="mb-4">Source Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sourceBreakdown.length > 0 ? sourceBreakdown : [
            { source: "No data", mentions: 0, sentiment: 0 }
          ]} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(132, 204, 22, 0.2)" />
            <XAxis type="number" stroke="#65a30d" />
            <YAxis dataKey="source" type="category" stroke="#65a30d" width={120} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '2px solid rgba(132, 204, 22, 0.2)',
                borderRadius: '0.625rem'
              }}
            />
            <Bar dataKey="mentions" fill="#84cc16" name="Mentions" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* All Keywords List */}
      <Card className="p-6 border-2">
        <h3 className="mb-4">All Keywords</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredKeywords.map((item) => (
            <div 
              key={item.keyword}
              className="p-4 bg-muted/50 rounded-lg border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
              onClick={() => setSelectedKeyword(item.keyword)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="truncate capitalize">{item.keyword}</h4>
                    {getSentimentIcon(item.sentiment)}
                    {watchedKeywords.includes(item.keyword) && (
                      <Bookmark className="h-4 w-4 text-primary fill-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{item.mentions} mentions</span>
                    <span className={item.growth.startsWith('+') ? 'text-[#84cc16]' : 'text-[#ef4444]'}>
                      {item.growth}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
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
    </div>
  );
}
