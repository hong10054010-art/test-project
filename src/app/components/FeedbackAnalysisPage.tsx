import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Search, Filter, Download, ThumbsUp, ThumbsDown, Minus, Tag, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { queryFeedback, processFeedback, getFeedbackList } from "../../lib/api";
import { toast } from "sonner";

// Interface for feedback data
interface FeedbackItem {
  id: string;
  date: string;
  user: string;
  source: string;
  sentiment: string;
  rating: number;
  category: string;
  tags: string[];
  text: string;
  verified: boolean;
}

// Mock data as fallback
const mockFeedbackData: FeedbackItem[] = [
  {
    id: "FB-8234",
    date: "2026-02-09 14:23",
    user: "Sarah Johnson",
    source: "Email",
    sentiment: "positive",
    rating: 5,
    category: "Product Feature",
    tags: ["UI", "Dashboard"],
    text: "The new dashboard is incredibly intuitive! The AI insights have helped us identify trends.",
    verified: true
  },
  {
    id: "FB-8233",
    date: "2026-02-09 13:15",
    user: "Michael Chen",
    source: "Support Ticket",
    sentiment: "neutral",
    rating: 3,
    category: "Performance",
    tags: ["Speed", "Loading"],
    text: "Analytics load a bit slowly when handling large datasets. Features are comprehensive though.",
    verified: true
  },
  {
    id: "FB-8232",
    date: "2026-02-09 11:45",
    user: "Emily Rodriguez",
    source: "Social Media",
    sentiment: "positive",
    rating: 5,
    category: "Customer Support",
    tags: ["Support", "Response Time"],
    text: "Support team was extremely helpful in setting up custom reports. Response under 10 minutes!",
    verified: true
  },
  {
    id: "FB-8231",
    date: "2026-02-09 10:20",
    user: "David Kim",
    source: "Review",
    sentiment: "negative",
    rating: 2,
    category: "Integration",
    tags: ["CRM", "Documentation"],
    text: "Having trouble integrating with our existing CRM. Documentation could be more detailed.",
    verified: false
  },
  {
    id: "FB-8230",
    date: "2026-02-09 09:30",
    user: "Jessica Taylor",
    source: "Survey",
    sentiment: "positive",
    rating: 4,
    category: "UI/UX",
    tags: ["Design", "Colors"],
    text: "Love the clean interface and the color scheme. Makes working with data enjoyable!",
    verified: true
  },
  {
    id: "FB-8229",
    date: "2026-02-08 18:50",
    user: "Robert Martinez",
    source: "Email",
    sentiment: "neutral",
    rating: 3,
    category: "Pricing",
    tags: ["Cost", "Small Business"],
    text: "The features are great, but pricing could be more competitive for small businesses.",
    verified: true
  },
  {
    id: "FB-8228",
    date: "2026-02-08 16:12",
    user: "Amanda Lee",
    source: "Support Ticket",
    sentiment: "negative",
    rating: 2,
    category: "Performance",
    tags: ["Speed", "Mobile"],
    text: "Mobile app is very slow. Takes forever to load the analytics dashboard.",
    verified: true
  },
  {
    id: "FB-8227",
    date: "2026-02-08 14:38",
    user: "James Wilson",
    source: "Social Media",
    sentiment: "positive",
    rating: 5,
    category: "Product Feature",
    tags: ["AI", "Insights"],
    text: "The AI-powered insights are game-changing! Discovered patterns we never knew existed.",
    verified: true
  },
  {
    id: "FB-8226",
    date: "2026-02-08 12:05",
    user: "Lisa Anderson",
    source: "Review",
    sentiment: "positive",
    rating: 4,
    category: "Integration",
    tags: ["Slack", "Easy Setup"],
    text: "Slack integration works perfectly. Setup was straightforward and notifications are timely.",
    verified: true
  },
];

export function FeedbackAnalysisPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>(mockFeedbackData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load feedback data from API
  useEffect(() => {
    loadFeedbackData();
  }, [filterSentiment, filterSource, filterCategory, currentPage, searchQuery]);

  const loadFeedbackData = async () => {
    setLoading(true);
    try {
      // Map filterSource display names to API format
      let apiSource = undefined;
      if (filterSource !== "all") {
        if (filterSource === "Email") apiSource = "email_feedback";
        else if (filterSource === "Support Ticket") apiSource = "support_ticket";
        else if (filterSource === "Social Media") apiSource = "twitter";
        else if (filterSource === "Review") apiSource = "github_issue";
        else if (filterSource === "Survey") apiSource = "community_discord";
        // If it's already in API format, use it as is
        else if (["support_ticket", "github_issue", "community_discord", "email_feedback", "twitter"].includes(filterSource)) {
          apiSource = filterSource;
        }
      }

      const response = await getFeedbackList({
        source: apiSource,
        sentiment: filterSentiment !== "all" ? filterSentiment : undefined,
        category: filterCategory !== "all" ? filterCategory : undefined,
        timeRange: "365", // Changed from "30" to "365" to show more data
        page: currentPage,
        pageSize: 10,
        search: searchQuery || undefined
      });
      
      if (response.ok && response.items) {
        setFeedbackData(response.items);
        setTotalPages(response.totalPages || 1);
      } else {
        // Fallback to mock data
        console.warn("Failed to load feedback list, using mock data:", response.error);
        setFeedbackData(mockFeedbackData);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load feedback:", error);
      // Fallback to mock data
      setFeedbackData(mockFeedbackData);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Data is already filtered by API, but we can do client-side filtering for search if needed
  const filteredFeedback = feedbackData.filter(item => {
    // If search query is provided, filter client-side (API also filters, but this is a backup)
    if (searchQuery) {
      const matchesSearch = 
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }
    // Additional client-side filters as backup
    const matchesSentiment = filterSentiment === "all" || item.sentiment === filterSentiment;
    const matchesSource = filterSource === "all" || item.source === filterSource;
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSentiment && matchesSource && matchesCategory;
  });

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-[#84cc16] text-white"><ThumbsUp className="h-3 w-3 mr-1" />Positive</Badge>;
      case "negative":
        return <Badge className="bg-[#ef4444] text-white"><ThumbsDown className="h-3 w-3 mr-1" />Negative</Badge>;
      default:
        return <Badge className="bg-[#fde047] text-[#365314]"><Minus className="h-3 w-3 mr-1" />Neutral</Badge>;
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredFeedback.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredFeedback.map(f => f.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleExport = () => {
    // Export selected items if any, otherwise export all filtered feedback
    const itemsToExport = selectedRows.length > 0 
      ? filteredFeedback.filter(item => selectedRows.includes(item.id))
      : filteredFeedback;
    
    if (itemsToExport.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const csv = [
      ["ID", "Date", "User", "Source", "Sentiment", "Rating", "Category", "Tags", "Text"].join(","),
      ...itemsToExport.map(item => [
        item.id,
        item.date,
        item.user,
        item.source,
        item.sentiment,
        item.rating,
        item.category,
        item.tags.join(";"),
        `"${item.text.replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${itemsToExport.length} feedback item(s) successfully`);
  };

  const handleTagSelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select feedback items to tag");
      return;
    }
    toast.info(`Tagging ${selectedRows.length} items...`);
    // TODO: Implement tagging API
  };

  const handleProcessSelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select feedback items to process");
      return;
    }
    toast.info(`Processing ${selectedRows.length} items with AI...`);
    try {
      for (const id of selectedRows) {
        await processFeedback(id);
      }
      toast.success("Feedback processed successfully");
      loadFeedbackData();
    } catch (error) {
      toast.error("Failed to process feedback");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Feedback / Mentions (Raw Data)</h1>
        <p className="text-muted-foreground mt-2">Complete feedback database with advanced filtering capabilities</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by ID, user, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            className="border-2"
            disabled={selectedRows.length === 0}
            onClick={handleTagSelected}
          >
            <Tag className="h-4 w-4 mr-2" />
            Tag ({selectedRows.length})
          </Button>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4 border-2 bg-muted/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block">Sentiment</label>
              <Select value={filterSentiment} onValueChange={setFilterSentiment}>
                <SelectTrigger className="border-2 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm mb-2 block">Source</label>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="border-2 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Support Ticket">Support Ticket</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Survey">Survey</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm mb-2 block">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="border-2 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Product Feature">Product Feature</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Customer Support">Customer Support</SelectItem>
                  <SelectItem value="Integration">Integration</SelectItem>
                  <SelectItem value="UI/UX">UI/UX</SelectItem>
                  <SelectItem value="Pricing">Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredFeedback.length} of {feedbackData.length} feedback items
          {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
        </p>
        {selectedRows.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRows([])}
          >
            Clear Selection
          </Button>
        )}
      </div>

      {/* Data Table */}
      <Card className="border-2 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedRows.length === filteredFeedback.length && filteredFeedback.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-24">ID</TableHead>
                <TableHead className="w-40">Date/Time</TableHead>
                <TableHead className="w-36">User</TableHead>
                <TableHead className="w-32">Source</TableHead>
                <TableHead className="w-28">Sentiment</TableHead>
                <TableHead className="w-20">Rating</TableHead>
                <TableHead className="w-36">Category</TableHead>
                <TableHead className="w-48">Tags</TableHead>
                <TableHead className="min-w-[300px]">Feedback</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.map((item) => (
                <TableRow 
                  key={item.id}
                  className={`${selectedRows.includes(item.id) ? 'bg-primary/5' : ''} hover:bg-muted/50`}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={() => toggleSelectRow(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{item.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.user}</span>
                      {item.verified && (
                        <div className="w-2 h-2 bg-[#84cc16] rounded-full" title="Verified" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {item.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getSentimentBadge(item.sentiment)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {"★".repeat(item.rating)}
                      <span className="text-muted-foreground">{"☆".repeat(5 - item.rating)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.category}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-primary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2">{item.text}</p>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="View Details"
                      onClick={() => {
                        toast.info(`Viewing details for ${item.id}`);
                        // TODO: Implement detail view modal
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({filteredFeedback.length} items)
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-2" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-2"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
