import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Download, Eye, Calendar, Clock, BarChart3, FileBarChart, Plus, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { queryFeedback, getSavedViews, saveView, deleteView } from "../../lib/api";
import { toast } from "sonner";

const previewData = [
  { date: "Week 1", value: 245 },
  { date: "Week 2", value: 298 },
  { date: "Week 3", value: 356 },
  { date: "Week 4", value: 412 },
];

const savedReports = [
  {
    id: 1,
    name: "Weekly Executive Summary",
    description: "High-level overview for C-suite",
    schedule: "Every Monday 9:00 AM",
    lastRun: "2026-02-08",
    format: "PDF",
    recipients: ["exec@company.com"]
  },
  {
    id: 2,
    name: "Product Team Insights",
    description: "Feature feedback and sentiment analysis",
    schedule: "Every Wednesday 2:00 PM",
    lastRun: "2026-02-07",
    format: "PPT",
    recipients: ["product@company.com"]
  },
  {
    id: 3,
    name: "Customer Support Metrics",
    description: "Support-related feedback trends",
    schedule: "Daily 8:00 AM",
    lastRun: "2026-02-09",
    format: "CSV",
    recipients: ["support@company.com"]
  }
];

const reportHistory = [
  { id: 1, name: "January Monthly Report", generated: "2026-02-01 10:00", size: "2.4 MB", format: "PDF" },
  { id: 2, name: "Q4 2025 Analysis", generated: "2026-01-15 14:30", size: "5.1 MB", format: "PPT" },
  { id: 3, name: "Customer Sentiment Export", generated: "2026-01-10 09:15", size: "856 KB", format: "CSV" },
];

export function ReportsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("last30");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(["line", "bar"]);
  const [reportName, setReportName] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previousReportData, setPreviousReportData] = useState<any>(null); // For growth calculation
  const [availableSectors, setAvailableSectors] = useState<string[]>([]); // Available sectors from data
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([]); // Available keywords from data
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("builder");

  useEffect(() => {
    loadReportData();
    loadSavedReports();
  }, [selectedTimeRange, selectedSectors, selectedKeywords]);

  const loadSavedReports = async () => {
    try {
      const response = await getSavedViews();
      if (response.ok && response.views) {
        const reports = response.views.map((view: any, index: number) => ({
          id: view.id || `report_${index + 1}`,
          name: view.name || `Saved Report ${index + 1}`,
          description: `Time range: ${view.filters?.timeRange || 'N/A'} days${view.filters?.keywords ? `, Keywords: ${view.filters.keywords}` : ''}${view.filters?.sectors ? `, Sectors: ${view.filters.sectors}` : ''}`,
          schedule: "Manual",
          lastRun: view.createdAt ? new Date(view.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          format: "PDF",
          recipients: [],
          filters: view.filters
        }));
        setSavedReports(reports);
      } else if (response.ok && !response.views) {
        // No views yet
        setSavedReports([]);
      }
    } catch (error) {
      console.error("Failed to load saved reports:", error);
      setSavedReports([]);
    }
  };

  const loadReportData = async () => {
    try {
      const timeRangeValue = selectedTimeRange.replace("last", "").replace("ytd", "365");
      
      // Store previous data for growth calculation before loading new data
      if (reportData) {
        setPreviousReportData({ ...reportData });
      }
      
      // Load current period data with filters
      const filters: any = { timeRange: timeRangeValue };
      
      // Apply sector filter if any selected
      if (selectedSectors.length > 0) {
        filters.product = selectedSectors.join(',');
      }
      
      // Apply keyword/theme filter if any selected
      if (selectedKeywords.length > 0) {
        filters.theme = selectedKeywords.join(',');
      }
      
      const response = await queryFeedback(filters);
      if (response.ok && response.charts) {
        setReportData(response);
        
        // Extract available sectors from byProduct data
        const productData = response.charts.byProduct || [];
        const sectors = productData.map((p: any) => p.key).filter((s: string) => s);
        setAvailableSectors(sectors);
        
        // Extract available keywords from byTheme data
        const themeData = response.charts.byTheme || [];
        const keywords = themeData.map((t: any) => t.key).filter((k: string) => k);
        setAvailableKeywords(keywords);
        
        // Process time data for preview charts
        const timeData = response.charts.byTime || [];
        if (timeData.length > 0) {
          // Sort by date to ensure correct order
          const sortedData = [...timeData].sort((a: any, b: any) => 
            new Date(a.key).getTime() - new Date(b.key).getTime()
          );
          
          // Determine how many data points to show based on time range
          let dataPointsToShow = 4; // Default for 7 days
          if (timeRangeValue === "30") {
            dataPointsToShow = 7; // Show weekly data for 30 days
          } else if (timeRangeValue === "90") {
            dataPointsToShow = 12; // Show weekly data for 90 days
          } else if (timeRangeValue === "365") {
            dataPointsToShow = 12; // Show monthly data for year
          }
          
          // Take last N data points or all if less than N
          const dataToShow = sortedData.length > dataPointsToShow 
            ? sortedData.slice(-dataPointsToShow)
            : sortedData;
          
          const processedData = dataToShow.map((item: any, index: number) => {
            const date = new Date(item.key);
            // Format date as "MM/DD" or use simple labels
            const month = date.getMonth() + 1;
            const day = date.getDate();
            // Use date format for better clarity
            return {
              date: `${month}/${day}`,
              value: item.count
            };
          });
          setPreviewData(processedData);
        } else {
          // Use simple sequential labels when no data
          setPreviewData([
            { date: "Day 1", value: 0 },
            { date: "Day 2", value: 0 },
            { date: "Day 3", value: 0 },
            { date: "Day 4", value: 0 }
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to load report data:", error);
    }
  };


  const handlePreview = async () => {
    try {
      const response = await queryFeedback({ timeRange: selectedTimeRange.replace("last", "") });
      if (response.ok) {
        toast.success("Report preview generated");
      }
    } catch (error) {
      toast.error("Failed to generate preview");
    }
  };

  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      toast.error("Please enter a report name");
      return;
    }
    try {
      const result = await saveView(reportName, {
        timeRange: selectedTimeRange.replace("last", ""),
        keywords: selectedKeywords,
        sectors: selectedSectors
      });
      if (result.ok) {
        toast.success(`Report "${reportName}" saved to Saved Reports`);
        setReportName("");
        loadSavedReports();
      } else {
        toast.error("Failed to save report");
      }
    } catch (error) {
      toast.error("Failed to save report");
    }
  };

  const handleExportPDF = () => {
    toast.info("PDF export coming soon");
    // TODO: Implement PDF export
  };

  const handleExportPPT = () => {
    toast.info("PPT export coming soon");
    // TODO: Implement PPT export
  };

  const handleExportCSV = () => {
    const csv = [
      ["Metric", "Value"].join(","),
      ["Total Mentions", "8,234"].join(","),
      ["Positive %", "68%"].join(","),
      ["Growth", "+12.5%"].join(",")
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportName || "report"}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported as CSV");
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        const result = await deleteView(id);
        if (result.ok) {
          toast.success("Report deleted successfully");
          loadSavedReports();
        } else {
          toast.error("Failed to delete report");
        }
      } catch (error) {
        toast.error("Failed to delete report");
      }
    }
  };

  const handleViewReport = async (report: any) => {
    // Switch to Report Builder tab
    setActiveTab("builder");
    
    // Load report filters
    if (report.filters) {
      if (report.filters.timeRange) {
        const timeRange = report.filters.timeRange;
        if (timeRange === "7") setSelectedTimeRange("last7");
        else if (timeRange === "30") setSelectedTimeRange("last30");
        else if (timeRange === "90") setSelectedTimeRange("last90");
        else if (timeRange === "365") setSelectedTimeRange("ytd");
      }
      if (report.filters.sectors) {
        setSelectedSectors(Array.isArray(report.filters.sectors) ? report.filters.sectors : []);
      }
      if (report.filters.keywords) {
        setSelectedKeywords(Array.isArray(report.filters.keywords) ? report.filters.keywords : []);
      }
    }
    
    // Set report name
    setReportName(report.name || "");
    
    toast.success(`Loaded report: ${report.name}`);
  };

  const handleDownloadReport = async (report: any) => {
    try {
      // Load report data based on filters
      const timeRangeValue = report.filters?.timeRange || "30";
      const response = await queryFeedback({ 
        timeRange: timeRangeValue,
        product: report.filters?.sectors?.[0] || undefined
      });
      
      if (!response.ok) {
        toast.error("Failed to load report data");
        return;
      }

      // Generate PDF similar to Overview page
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to export PDF");
        return;
      }

      const metrics = {
        totalMentions: response.totalCount || 0,
        positivePercent: 0,
        negativePercent: 0
      };

      const sentimentData = response.charts?.bySentiment || [];
      const positive = sentimentData.find((s: any) => s.key === 'positive')?.count || 0;
      const negative = sentimentData.find((s: any) => s.key === 'negative')?.count || 0;
      const neutral = sentimentData.find((s: any) => s.key === 'neutral')?.count || 0;
      const totalWithSentiment = positive + negative + neutral;
      
      if (totalWithSentiment > 0) {
        metrics.positivePercent = Math.round((positive / totalWithSentiment) * 100);
        metrics.negativePercent = Math.round((negative / totalWithSentiment) * 100);
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${report.name || 'Report'} Export</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1a2e05; }
              h2 { color: #4d7c0f; margin-top: 20px; }
              .metric { background: #f7fee7; padding: 15px; border-radius: 8px; margin: 10px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #d1e7b8; padding: 8px; text-align: left; }
              th { background: #d1e7b8; color: #1a2e05; }
            </style>
          </head>
          <body>
            <h1>${report.name || 'Report'}</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <div class="metric">
              <h2>Key Metrics</h2>
              <p>Total Mentions: ${metrics.totalMentions.toLocaleString()}</p>
              <p>Positive: ${metrics.positivePercent}%</p>
              <p>Negative: ${metrics.negativePercent}%</p>
            </div>
            ${response.charts?.byTheme ? `
              <h2>Top Themes</h2>
              <table>
                <tr><th>Theme</th><th>Count</th></tr>
                ${response.charts.byTheme.slice(0, 10).map((t: any) => `
                  <tr>
                    <td>${t.key}</td>
                    <td>${t.count}</td>
                  </tr>
                `).join('')}
              </table>
            ` : ''}
            ${response.charts?.byPlatform ? `
              <h2>By Platform</h2>
              <table>
                <tr><th>Platform</th><th>Count</th></tr>
                ${response.charts.byPlatform.map((p: any) => `
                  <tr>
                    <td>${p.key}</td>
                    <td>${p.count}</td>
                  </tr>
                `).join('')}
              </table>
            ` : ''}
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        toast.success("PDF export ready");
      }, 250);
    } catch (error) {
      console.error("Failed to download report:", error);
      toast.error("Failed to download report");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Reports</h1>
        <p className="text-muted-foreground mt-2">Build custom reports and manage scheduled exports</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted p-1">
          <TabsTrigger 
            value="builder"
            className="tab-green-active"
          >
            Report Builder
          </TabsTrigger>
          <TabsTrigger 
            value="saved"
            className="tab-green-active"
          >
            Saved Reports
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="tab-green-active"
          >
            History
          </TabsTrigger>
        </TabsList>

        {/* Report Builder */}
        <TabsContent value="builder" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-6 border-2">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3>Report Configuration</h3>
                </div>

                <div className="space-y-4">
                  {/* Report Name */}
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      placeholder="My Custom Report"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      className="border-2 bg-[#4d7c0f]/10"
                    />
                  </div>

                  {/* Time Range */}
                  <div className="space-y-2">
                    <Label>Time Range</Label>
                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                      <SelectTrigger className="border-2 !bg-[#4d7c0f]/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last7">Last 7 Days</SelectItem>
                        <SelectItem value="last30">Last 30 Days</SelectItem>
                        <SelectItem value="last90">Last 90 Days</SelectItem>
                        <SelectItem value="ytd">Year to Date</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sectors */}
                  <div className="space-y-2">
                    <Label>Sectors</Label>
                    <div className="space-y-2 p-3 bg-muted rounded-lg border-2">
                      {availableSectors.length > 0 ? (
                        availableSectors.map((sector) => (
                          <div key={sector} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedSectors.includes(sector)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedSectors([...selectedSectors, sector]);
                                } else {
                                  setSelectedSectors(selectedSectors.filter(s => s !== sector));
                                }
                              }}
                            />
                            <label 
                              className="text-sm cursor-pointer"
                              onClick={() => {
                                if (selectedSectors.includes(sector)) {
                                  setSelectedSectors(selectedSectors.filter(s => s !== sector));
                                } else {
                                  setSelectedSectors([...selectedSectors, sector]);
                                }
                              }}
                            >
                              {sector}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Loading sectors...</p>
                      )}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="space-y-2">
                    <Label>Keywords</Label>
                    <div className="space-y-2 p-3 bg-muted rounded-lg border-2 max-h-48 overflow-y-auto">
                      {availableKeywords.length > 0 ? (
                        availableKeywords.slice(0, 20).map((keyword) => (
                          <div key={keyword} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedKeywords.includes(keyword)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedKeywords([...selectedKeywords, keyword]);
                                } else {
                                  setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
                                }
                              }}
                            />
                            <label 
                              className="text-sm cursor-pointer capitalize"
                              onClick={() => {
                                if (selectedKeywords.includes(keyword)) {
                                  setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
                                } else {
                                  setSelectedKeywords([...selectedKeywords, keyword]);
                                }
                              }}
                            >
                              {keyword}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Loading keywords...</p>
                      )}
                    </div>
                  </div>

                  {/* Chart Types */}
                  <div className="space-y-2">
                    <Label>Chart Types</Label>
                    <div className="space-y-2 p-3 bg-muted rounded-lg border-2">
                      {[
                        { id: "line", name: "Line Chart" },
                        { id: "bar", name: "Bar Chart" },
                        { id: "pie", name: "Pie Chart" },
                        { id: "area", name: "Area Chart" }
                      ].map((chart) => (
                        <div key={chart.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedCharts.includes(chart.id)}
                            onCheckedChange={() => toggleSelection(chart.id, selectedCharts, setSelectedCharts)}
                          />
                          <label className="text-sm cursor-pointer">{chart.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-6 border-t">
                  <Button 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handlePreview}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-2"
                    onClick={handleSaveReport}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              <Card className="p-6 border-2">
                <div className="flex items-center justify-between mb-6">
                  <h3>Live Preview</h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleExportPDF}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-2"
                      onClick={handleExportPPT}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export PPT
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-2"
                      onClick={handleExportCSV}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 p-6 bg-muted/30 rounded-lg border-2">
                  {/* Report Header */}
                  <div className="pb-4 border-b-2">
                    <h2>{reportName || "Untitled Report"}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Key Metrics Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-background rounded-lg border-2">
                      <p className="text-sm text-muted-foreground">Total Mentions</p>
                      <h3 className="mt-1">{reportData?.totalCount?.toLocaleString() || "0"}</h3>
                    </div>
                    <div className="p-4 bg-background rounded-lg border-2">
                      <p className="text-sm text-muted-foreground">Positive %</p>
                      <h3 className="mt-1 text-[#84cc16]">
                        {reportData?.charts?.bySentiment ? (
                          (() => {
                            const sentimentData = reportData.charts.bySentiment;
                            const positive = sentimentData.find((s: any) => s.key === 'positive')?.count || 0;
                            const total = sentimentData.reduce((sum: number, s: any) => sum + s.count, 0);
                            return total > 0 ? Math.round((positive / total) * 100) : 0;
                          })()
                        ) : 0}%
                      </h3>
                    </div>
                    <div className="p-4 bg-background rounded-lg border-2">
                      <p className="text-sm text-muted-foreground">Growth</p>
                      <h3 className="mt-1 text-[#84cc16]">+12.5%</h3>
                    </div>
                  </div>

                  {/* Selected Charts */}
                  {selectedCharts.includes("line") && (
                    <div className="bg-background p-4 rounded-lg border-2">
                      <h4 className="mb-4">Trend Analysis</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={previewData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(132, 204, 22, 0.2)" />
                          <XAxis dataKey="date" stroke="#65a30d" />
                          <YAxis stroke="#65a30d" />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#84cc16" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {selectedCharts.includes("bar") && (
                    <div className="bg-background p-4 rounded-lg border-2">
                      <h4 className="mb-4">Volume Comparison</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={previewData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(132, 204, 22, 0.2)" />
                          <XAxis dataKey="date" stroke="#65a30d" />
                          <YAxis stroke="#65a30d" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#84cc16" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {selectedCharts.includes("area") && (
                    <div className="bg-background p-4 rounded-lg border-2">
                      <h4 className="mb-4">Growth Over Time</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={previewData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(132, 204, 22, 0.2)" />
                          <XAxis dataKey="date" stroke="#65a30d" />
                          <YAxis stroke="#65a30d" />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke="#84cc16" fill="#84cc16" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Selected Keywords */}
                  <div className="bg-background p-4 rounded-lg border-2">
                    <h4 className="mb-3">Selected Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedKeywords.map((keyword) => (
                        <Badge key={keyword} className="bg-primary text-primary-foreground capitalize">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Selected Sectors */}
                  <div className="bg-background p-4 rounded-lg border-2">
                    <h4 className="mb-3">Selected Sectors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSectors.map((sector) => (
                        <Badge key={sector} variant="outline" className="border-primary">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Saved Reports */}
        <TabsContent value="saved" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{savedReports.length} saved reports</p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>

          <div className="space-y-4">
            {savedReports.length === 0 ? (
              <Card className="p-6 border-2 text-center">
                <p className="text-muted-foreground">No saved reports yet. Save a report from the Report Builder to see it here.</p>
              </Card>
            ) : (
              savedReports.map((report) => (
              <Card key={report.id} className="p-6 border-2 hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4>{report.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{report.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Last run: {report.lastRun}</span>
                        </div>
                        <Badge variant="outline" className="border-primary">
                          {report.format}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-2"
                      onClick={() => handleViewReport(report)}
                      title="View Report"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-2"
                      onClick={() => handleDownloadReport(report)}
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-2 text-[#ef4444] hover:text-[#ef4444]"
                      onClick={() => handleDeleteReport(report.id)}
                      title="Delete Report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{reportHistory.length} reports in history</p>
            <Button variant="outline" className="border-2">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Old Reports
            </Button>
          </div>

          <Card className="border-2 overflow-hidden">
            <div className="divide-y">
              {reportHistory.map((item) => (
                <div key={item.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileBarChart className="h-5 w-5 text-primary" />
                      <div>
                        <h4>{item.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{item.generated}</span>
                          <span>•</span>
                          <span>{item.size}</span>
                          <Badge variant="outline" className="border-primary text-xs">
                            {item.format}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-2">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
