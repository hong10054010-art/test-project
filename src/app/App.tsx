import { useState } from "react";
import { OverviewPage } from "./components/OverviewPage";
import { KeywordsPage } from "./components/KeywordsPage";
import { FeedbackAnalysisPage } from "./components/FeedbackAnalysisPage";
import { AIInsightsPage } from "./components/AIInsightsPage";
import { ReportsPage } from "./components/ReportsPage";
import { SettingsPage } from "./components/SettingsPage";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { LayoutDashboard, Hash, MessageSquareText, Brain, FileBarChart, Settings, Menu, X, Github } from "lucide-react";

type PageType = "overview" | "keywords" | "feedback" | "insights" | "reports" | "settings";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("overview");
  const [keywordFilter, setKeywordFilter] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const navigation = [
    { id: "overview" as PageType, name: "Overview", icon: LayoutDashboard },
    { id: "keywords" as PageType, name: "Keywords", icon: Hash },
    { id: "feedback" as PageType, name: "Feedback / Mentions", icon: MessageSquareText },
    { id: "insights" as PageType, name: "AI Insights", icon: Brain },
    { id: "reports" as PageType, name: "Reports", icon: FileBarChart },
    { id: "settings" as PageType, name: "Settings", icon: Settings },
  ];

  const handleNavigate = (page: string, filter?: string) => {
    if (page === "keywords") {
      setCurrentPage("keywords");
      setKeywordFilter(filter);
    } else if (page === "reports") {
      setCurrentPage("reports");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "overview":
        return <OverviewPage onNavigate={handleNavigate} />;
      case "keywords":
        return <KeywordsPage initialFilter={keywordFilter} />;
      case "feedback":
        return <FeedbackAnalysisPage />;
      case "insights":
        return <AIInsightsPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <OverviewPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar for desktop */}
      <aside 
        className={`hidden lg:flex lg:flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          sidebarHovered ? 'w-64 p-6' : 'w-20 p-4'
        }`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className={`mb-8 transition-all duration-300 ${sidebarHovered ? '' : 'flex justify-center'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            {sidebarHovered && (
              <div className="transition-opacity duration-300">
                <h2 className="text-sidebar-foreground">FeedbackAI</h2>
                <p className="text-xs text-muted-foreground">Analytics Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full transition-all duration-300 ${
                  sidebarHovered ? 'justify-start' : 'justify-center px-0'
                } ${
                  isActive 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
                onClick={() => setCurrentPage(item.id)}
                title={!sidebarHovered ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${sidebarHovered ? 'mr-3' : 'mr-0'}`} />
                {sidebarHovered && <span>{item.name}</span>}
              </Button>
            );
          })}
        </nav>

        {sidebarHovered && (
          <div className="mt-auto pt-6 border-t border-sidebar-border transition-opacity duration-300">
            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm">
                <span className="text-primary">💡 Tip:</span> Check AI Insights daily for new recommendations!
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border p-6 z-50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-sidebar-foreground">FeedbackAI</h2>
                  <p className="text-xs text-muted-foreground">Analytics Dashboard</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar for mobile */}
        <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <h2>FeedbackAI</h2>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border p-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 FeedbackAI. Powered by advanced AI analytics.</p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/hong10054010-art/test-project" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Github className="h-4 w-4" />
                GitHub: test-project
              </a>
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            </div>
          </div>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
