import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Brain, AlertTriangle, TrendingUp, Lightbulb, Target, Sparkles, Shield, DollarSign, Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { getAIAdvice, queryFeedback } from "../../lib/api";
import { toast } from "sonner";

const autoSummary = {
  period: "Last 7 Days",
  totalMentions: 8234,
  sentimentShift: "+5.2%",
  keyTheme: "Customer service excellence driving positive sentiment",
  confidence: 94
};

const topRisks = [
  {
    id: 1,
    title: "Performance Degradation Alert",
    description: "Loading time complaints increased 31% in the last 48 hours. Users reporting 5-10 second delays on dashboard load.",
    severity: "critical",
    impact: "High",
    affectedUsers: "~2,100",
    trend: "increasing",
    confidence: 92,
    recommendation: "Immediate performance audit recommended. Check server load and database query optimization."
  },
  {
    id: 2,
    title: "Mobile App Stability Issues",
    description: "Crash reports up 18% on iOS devices. Pattern detected in users running iOS 17.2+.",
    severity: "high",
    impact: "Medium",
    affectedUsers: "~450",
    trend: "stable",
    confidence: 87,
    recommendation: "QA team should prioritize iOS compatibility testing for next release."
  },
  {
    id: 3,
    title: "Integration Documentation Gap",
    description: "CRM integration queries increased 23%. Users struggle with Salesforce connector setup.",
    severity: "medium",
    impact: "Medium",
    affectedUsers: "~320",
    trend: "increasing",
    confidence: 89,
    recommendation: "Expand integration guide with video tutorials and step-by-step screenshots."
  }
];

const opportunities = [
  {
    id: 1,
    title: "Healthcare Sector Expansion",
    description: "Healthcare users show 72% positive sentiment, 15% higher than average. High engagement with compliance features.",
    potential: "high",
    effort: "medium",
    roi: "185%",
    confidence: 91,
    nextSteps: "Develop healthcare-specific feature package and compliance certifications."
  },
  {
    id: 2,
    title: "Dark Mode Feature Request",
    description: "Dark mode mentioned in 42 requests this week (3x increase). Users cite eye strain during long sessions.",
    potential: "medium",
    effort: "low",
    roi: "120%",
    confidence: 94,
    nextSteps: "Add to Q1 roadmap. Estimated 2 week development time."
  },
  {
    id: 3,
    title: "API Partnership Interest",
    description: "12 enterprise clients requested public API access. Average client value: $15k/year.",
    potential: "high",
    effort: "high",
    roi: "240%",
    confidence: 86,
    nextSteps: "Conduct technical feasibility study and develop API monetization strategy."
  },
  {
    id: 4,
    title: "Customer Service Excellence",
    description: "Support team net promoter score at 89. Opportunity to showcase as competitive advantage.",
    potential: "medium",
    effort: "low",
    roi: "95%",
    confidence: 96,
    nextSteps: "Create case studies and feature customer testimonials in marketing materials."
  }
];

const recommendations = [
  {
    id: 1,
    title: "Priority 1: Address Performance Issues",
    description: "Critical: Resolve loading time issues within 48 hours to prevent negative sentiment cascade.",
    impact: "Critical",
    timeline: "Immediate",
    resources: "DevOps + Backend Team",
    expectedOutcome: "Reduce complaints by 60%, improve retention by 8%",
    actions: [
      "Audit database queries and add necessary indexes",
      "Implement CDN for static assets",
      "Enable server-side caching for analytics data"
    ]
  },
  {
    id: 2,
    title: "Quick Win: Launch Dark Mode",
    description: "High demand, low effort feature that addresses user pain point and demonstrates responsiveness.",
    impact: "Medium",
    timeline: "2 weeks",
    resources: "Frontend Team",
    expectedOutcome: "Increase satisfaction by 12%, reduce eye strain complaints",
    actions: [
      "Design dark theme color palette",
      "Implement theme toggle in settings",
      "Test across all major components"
    ]
  },
  {
    id: 3,
    title: "Strategic: Healthcare Market Penetration",
    description: "Capitalize on strong healthcare sentiment with targeted feature development.",
    impact: "High",
    timeline: "3 months",
    resources: "Product + Marketing Teams",
    expectedOutcome: "20% increase in healthcare sector revenue",
    actions: [
      "Develop HIPAA compliance features",
      "Create healthcare-specific dashboards",
      "Launch targeted marketing campaign"
    ]
  }
];

export function AIInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(recommendations);

  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    setLoading(true);
    try {
      const response = await queryFeedback({ timeRange: "7" });
      if (response.ok && response.charts) {
        const aiResponse = await getAIAdvice({ timeRange: "7" }, response.charts);
        if (aiResponse.ok && aiResponse.advice) {
          // Update recommendations with AI-generated advice
          console.log("AI insights loaded:", aiResponse.advice);
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
      <div>
        <h1>AI Insights</h1>
        <p className="text-muted-foreground mt-2">Auto-generated analysis, risks, and opportunities</p>
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
          {topRisks.map((risk) => (
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
          ))}
        </div>
      </div>

      {/* Opportunities */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-[#84cc16]" />
          <h3>Opportunities</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
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
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h3>AI Recommendations</h3>
        </div>
        <div className="space-y-4">
          {recommendations.map((rec) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
