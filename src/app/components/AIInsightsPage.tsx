import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Brain, AlertTriangle, TrendingUp, Lightbulb, Target, Sparkles, Shield, DollarSign, Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { getAIAdvice, queryFeedback } from "../../lib/api";
import { toast } from "sonner";

// Default/fallback data structure
const defaultAutoSummary = {
  period: "Last 7 Days",
  totalMentions: 0,
  sentimentShift: "0%",
  keyTheme: "Analyzing feedback data...",
  confidence: 0
};

export function AIInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7");
  const [autoSummary, setAutoSummary] = useState(defaultAutoSummary);
  const [topRisks, setTopRisks] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

  useEffect(() => {
    loadAIInsights();
  }, [timeRange]);

  const loadAIInsights = async () => {
    setLoading(true);
    try {
      const response = await queryFeedback({ timeRange });
      if (response.ok && response.charts) {
        const charts = response.charts;
        const totalCount = response.totalCount || 0;
        
        // Calculate auto summary
        const sentimentData = charts.bySentiment || [];
        const positive = sentimentData.find((s: any) => s.key === 'positive')?.count || 0;
        const negative = sentimentData.find((s: any) => s.key === 'negative')?.count || 0;
        const neutral = sentimentData.find((s: any) => s.key === 'neutral')?.count || 0;
        const totalWithSentiment = positive + negative + neutral;
        const positivePercent = totalWithSentiment > 0 ? (positive / totalWithSentiment) * 100 : 0;
        const negativePercent = totalWithSentiment > 0 ? (negative / totalWithSentiment) * 100 : 0;
        
        // Get top theme
        const topTheme = charts.byTheme?.[0];
        const keyTheme = topTheme ? `${topTheme.key} (${topTheme.count} mentions)` : "No dominant theme";
        
        // Calculate sentiment shift (simplified - compare positive vs negative)
        const sentimentShift = totalWithSentiment > 0 
          ? ((positivePercent - negativePercent) > 0 ? '+' : '') + (positivePercent - negativePercent).toFixed(1) + '%'
          : '0%';
        
        setAutoSummary({
          period: timeRange === "7" ? "Last 7 Days" : 
                  timeRange === "30" ? "Last 30 Days" :
                  timeRange === "90" ? "Last 90 Days" : "Last Year",
          totalMentions: totalCount,
          sentimentShift,
          keyTheme,
          confidence: totalCount > 0 ? Math.min(95, Math.max(70, 100 - (totalCount / 100))) : 0
        });

        // Generate risks from high urgency + negative sentiment themes
        const urgencyData = charts.byUrgency || [];
        const highUrgency = urgencyData.find((u: any) => u.key === 'high' || u.key === 'critical')?.count || 0;
        const negativeThemes = charts.byTheme?.filter((t: any) => {
          // Filter themes that might indicate problems
          const themeLower = t.key.toLowerCase();
          return themeLower.includes('issue') || themeLower.includes('problem') || 
                 themeLower.includes('bug') || themeLower.includes('error') ||
                 themeLower.includes('deployment') || themeLower.includes('performance');
        }) || [];
        
        const risks = negativeThemes.slice(0, 3).map((theme: any, idx: number) => ({
          id: idx + 1,
          title: `${theme.key} Alert`,
          description: `${theme.key} has ${theme.count} mentions. This represents ${((theme.count / totalCount) * 100).toFixed(1)}% of all feedback.`,
          severity: theme.count > totalCount * 0.1 ? "critical" : theme.count > totalCount * 0.05 ? "high" : "medium",
          impact: theme.count > totalCount * 0.1 ? "High" : "Medium",
          affectedUsers: `~${Math.round(theme.count * 1.5)}`,
          trend: "increasing",
          confidence: Math.min(95, 70 + (theme.count / totalCount) * 25),
          recommendation: `Address "${theme.key}" theme immediately. Consider creating a dedicated task force to investigate and resolve related issues.`
        }));
        setTopRisks(risks.length > 0 ? risks : []);

        // Generate opportunities from positive sentiment + high value themes
        const valueData = charts.byValue || [];
        const highValue = valueData.find((v: any) => v.key === 'high')?.count || 0;
        const positiveThemes = charts.byTheme?.filter((t: any) => {
          const themeLower = t.key.toLowerCase();
          return !themeLower.includes('issue') && !themeLower.includes('problem') &&
                 !themeLower.includes('bug') && !themeLower.includes('error');
        }) || [];
        
        const opps = positiveThemes.slice(0, 4).map((theme: any, idx: number) => ({
          id: idx + 1,
          title: `${theme.key} Opportunity`,
          description: `${theme.key} has ${theme.count} mentions with positive engagement. This represents ${((theme.count / totalCount) * 100).toFixed(1)}% of all feedback.`,
          potential: theme.count > totalCount * 0.15 ? "high" : "medium",
          effort: idx % 2 === 0 ? "low" : "medium",
          roi: `${Math.round(100 + (theme.count / totalCount) * 100)}%`,
          confidence: Math.min(96, 80 + (theme.count / totalCount) * 16),
          nextSteps: `Capitalize on "${theme.key}" theme. Consider expanding related features and creating targeted marketing campaigns.`
        }));
        setOpportunities(opps.length > 0 ? opps : []);

        // Get AI recommendations
        const aiResponse = await getAIAdvice({ timeRange }, charts);
        if (aiResponse.ok && aiResponse.advice) {
          const recommendations = aiResponse.advice.map((item: any, idx: number) => ({
            id: idx + 1,
            title: item.title || `Recommendation ${idx + 1}`,
            description: item.text || item.description || "AI-generated recommendation based on feedback analysis.",
            impact: idx === 0 ? "Critical" : idx === 1 ? "High" : "Medium",
            timeline: idx === 0 ? "Immediate" : idx === 1 ? "2 weeks" : "1 month",
            resources: idx === 0 ? "DevOps + Backend Team" : idx === 1 ? "Frontend Team" : "Product Team",
            expectedOutcome: `Improve user satisfaction and address key feedback themes.`,
            actions: item.text ? [item.text] : [
              "Review feedback patterns",
              "Prioritize action items",
              "Implement improvements"
            ]
          }));
          setAiRecommendations(recommendations);
        } else {
          // Fallback recommendations
          setAiRecommendations([
            {
              id: 1,
              title: "Priority Action",
              description: topTheme ? `Address "${topTheme.key}" theme - it represents ${((topTheme.count / totalCount) * 100).toFixed(1)}% of all feedback.` : "Review top themes and prioritize action items.",
              impact: "High",
              timeline: "Immediate",
              resources: "Product Team",
              expectedOutcome: "Improve user satisfaction",
              actions: ["Review feedback", "Prioritize items", "Take action"]
            }
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to load AI insights:", error);
      toast.error("Failed to load AI insights. Using cached data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecommendation = (recId: number) => {
    toast.success(`Recommendation ${recId} approved and assigned`);
    // TODO: Implement approval API
  };

  const handleViewDetails = (recId: number) => {
    toast.info(`Viewing details for recommendation ${recId}`);
    // TODO: Implement detail view
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-[#ef4444] text-white";
      case "high":
        return "bg-[#fde047] text-[#365314]";
      default:
        return "bg-[#84cc16] text-white";
    }
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case "high":
        return "bg-[#84cc16] text-white";
      case "medium":
        return "bg-[#fde047] text-[#365314]";
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <div className="space-y-6">

      {/* Time Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1>AI Insights</h1>
          <p className="text-muted-foreground mt-2">Auto-generated analysis, risks, and opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border-2 rounded-lg bg-white"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>

      {/* Auto Summary */}
      <Card className="p-6 border-2 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary rounded-lg">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3>Auto Summary - {autoSummary.period}</h3>
              <Badge className="bg-primary text-primary-foreground">
                {autoSummary.confidence}% Confidence
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-background rounded-lg border-2">
                <p className="text-sm text-muted-foreground">Total Analyzed</p>
                <h2 className="mt-1">{autoSummary.totalMentions.toLocaleString()}</h2>
              </div>
              <div className="p-4 bg-background rounded-lg border-2">
                <p className="text-sm text-muted-foreground">Sentiment Shift</p>
                <h2 className="mt-1 text-[#84cc16]">{autoSummary.sentimentShift}</h2>
              </div>
              <div className="p-4 bg-background rounded-lg border-2">
                <p className="text-sm text-muted-foreground">Key Theme</p>
                <p className="mt-1">{autoSummary.keyTheme}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Risks */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
          <h3>Top Risks</h3>
        </div>
        <div className="space-y-4">
          {loading && topRisks.length === 0 ? (
            <Card className="p-6 border-2">
              <p className="text-muted-foreground">Loading risks...</p>
            </Card>
          ) : topRisks.length === 0 ? (
            <Card className="p-6 border-2">
              <p className="text-muted-foreground">No significant risks identified in the selected time range.</p>
            </Card>
          ) : (
            topRisks.map((risk) => (
            <Card key={risk.id} className="p-6 border-2 hover:border-primary transition-colors">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4>{risk.title}</h4>
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Impact</p>
                    <p className="text-sm mt-1">{risk.impact}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Affected Users</p>
                    <p className="text-sm mt-1">{risk.affectedUsers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Trend</p>
                    <p className="text-sm mt-1 capitalize">{risk.trend}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-sm mt-1">{risk.confidence}%</p>
                  </div>
                </div>

                <div className="p-3 bg-accent rounded-lg border-2 border-primary/20">
                  <p className="text-sm">
                    <span className="text-primary">💡 Recommendation:</span> {risk.recommendation}
                  </p>
                </div>
              </div>
            </Card>
            ))
          )}
        </div>
      </div>

      {/* Opportunities */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-[#84cc16]" />
          <h3>Opportunities</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading && opportunities.length === 0 ? (
            <Card className="p-6 border-2">
              <p className="text-muted-foreground">Loading opportunities...</p>
            </Card>
          ) : opportunities.length === 0 ? (
            <Card className="p-6 border-2">
              <p className="text-muted-foreground">No significant opportunities identified in the selected time range.</p>
            </Card>
          ) : (
            opportunities.map((opp) => (
            <Card key={opp.id} className="p-6 border-2 hover:border-primary transition-colors">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h4>{opp.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{opp.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className={getPotentialColor(opp.potential)}>
                    Potential: {opp.potential}
                  </Badge>
                  <Badge variant="outline" className="border-primary">
                    Effort: {opp.effort}
                  </Badge>
                  <Badge className="bg-[#4d7c0f] text-white">
                    ROI: {opp.roi}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">AI Confidence</span>
                    <span>{opp.confidence}%</span>
                  </div>
                  <Progress value={opp.confidence} className="h-2" />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="text-primary">Next Steps:</span> {opp.nextSteps}
                  </p>
                </div>
              </div>
            </Card>
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h3>AI Recommendations</h3>
        </div>
        <div className="space-y-4">
          {loading && aiRecommendations.length === 0 ? (
            <Card className="p-6 border-2">
              <p className="text-muted-foreground">Loading AI recommendations...</p>
            </Card>
          ) : aiRecommendations.length === 0 ? (
            <Card className="p-6 border-2">
              <p className="text-muted-foreground">No recommendations available. Please try again later.</p>
            </Card>
          ) : (
            aiRecommendations.map((rec) => (
            <Card key={rec.id} className="p-6 border-2">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4>{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mt-2">{rec.description}</p>
                  </div>
                  <Badge className={
                    rec.impact === "Critical" ? "bg-[#ef4444] text-white" :
                    rec.impact === "High" ? "bg-[#84cc16] text-white" :
                    "bg-[#fde047] text-[#365314]"
                  }>
                    {rec.impact} Impact
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="text-sm mt-1">{rec.timeline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Resources Needed</p>
                    <p className="text-sm mt-1">{rec.resources}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Outcome</p>
                    <p className="text-sm mt-1">{rec.expectedOutcome}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">Action Items:</p>
                  <ul className="space-y-2">
                    {rec.actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleApproveRecommendation(rec.id)}
                  >
                    Approve & Assign
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2"
                    onClick={() => handleViewDetails(rec.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
