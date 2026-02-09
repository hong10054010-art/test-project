import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Settings, Bell, Shield, Zap, Database, Mail, Github } from "lucide-react";
import { useState, useEffect } from "react";
import { connectGitHub, getGitHubConnection, disconnectGitHub } from "../../lib/api";

export function SettingsPage() {
  // Load GitHub connection from localStorage or default to hong10054010-art/test-project
  const savedConnection = getGitHubConnection();
  const [githubConnected, setGithubConnected] = useState(
    savedConnection?.connected ?? true
  );
  const [githubRepo, setGithubRepo] = useState(
    savedConnection?.repo ?? "hong10054010-art/test-project"
  );

  // Auto-connect to hong10054010-art/test-project on mount if no saved connection
  useEffect(() => {
    if (!savedConnection) {
      // Auto-connect to hong10054010-art/test-project
      connectGitHub("hong10054010-art/test-project").then((result) => {
        if (result.ok) {
          setGithubConnected(true);
          setGithubRepo("hong10054010-art/test-project");
        }
      });
    }
  }, []);

  const handleGithubConnect = async () => {
    if (!githubConnected) {
      // Allow user to change the repo
      const repo = prompt("Enter GitHub repository (e.g., username/test-project):", githubRepo);
      if (repo && repo.trim()) {
        const result = await connectGitHub(repo.trim());
        if (result.ok) {
          setGithubRepo(repo.trim());
          setGithubConnected(true);
        } else {
          alert(`Failed to connect: ${result.error}`);
        }
      }
    } else {
      const confirm = window.confirm(`Disconnect from ${githubRepo}?`);
      if (confirm) {
        disconnectGitHub();
        setGithubConnected(false);
        // Keep the repo name even when disconnected
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your dashboard preferences and configurations</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted p-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary rounded-lg">
                <Settings className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3>General Settings</h3>
                <p className="text-sm text-muted-foreground mt-1">Configure your dashboard preferences</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Acme Inc." className="border-2" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc-8">
                  <SelectTrigger id="timezone" className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc+0">GMT (UTC+0)</SelectItem>
                    <SelectItem value="utc+8">Singapore (UTC+8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language" className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark mode theme</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Compact View</Label>
                  <p className="text-sm text-muted-foreground">Use a more condensed layout</p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Changes
              </Button>
              <Button variant="outline" className="border-2">
                Cancel
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary rounded-lg">
                <Bell className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3>Notification Preferences</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose what updates you want to receive</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>New Feedback Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new feedback arrives</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>AI Insight Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts for new AI-generated insights</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">Get a weekly summary report</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Critical Issues</Label>
                  <p className="text-sm text-muted-foreground">Immediate alerts for critical feedback</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Notification Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  className="border-2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Preferences
              </Button>
              <Button variant="outline" className="border-2">
                Cancel
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-4 mt-6">
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary rounded-lg">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3>AI Configuration</h3>
                <p className="text-sm text-muted-foreground mt-1">Customize AI analysis and insights</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Automatic Analysis</Label>
                  <p className="text-sm text-muted-foreground">Analyze feedback automatically with AI</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sentiment Detection</Label>
                  <p className="text-sm text-muted-foreground">Enable AI-powered sentiment analysis</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Topic Extraction</Label>
                  <p className="text-sm text-muted-foreground">Automatically identify feedback topics</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Predictive Insights</Label>
                  <p className="text-sm text-muted-foreground">Generate trend predictions</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence">Minimum Confidence Level</Label>
                <Select defaultValue="85">
                  <SelectTrigger id="confidence" className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="70">70% - Show more insights</SelectItem>
                    <SelectItem value="85">85% - Balanced</SelectItem>
                    <SelectItem value="95">95% - High confidence only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update">Analysis Frequency</Label>
                <Select defaultValue="realtime">
                  <SelectTrigger id="update" className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Settings
              </Button>
              <Button variant="outline" className="border-2">
                Reset to Default
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-4 mt-6">
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary rounded-lg">
                <Database className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3>Integrations</h3>
                <p className="text-sm text-muted-foreground mt-1">Connect with your favorite tools</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* GitHub Integration */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border-2 border-transparent hover:border-primary transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-accent rounded-lg">
                    <Github className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4>GitHub</h4>
                    <p className="text-sm text-muted-foreground">
                      {githubConnected ? (
                        <>
                          Project code repository:{" "}
                          <a 
                            href={`https://github.com/${githubRepo}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                          >
                            {githubRepo}
                          </a>
                        </>
                      ) : (
                        `Connect to GitHub repository: ${githubRepo}`
                      )}
                    </p>
                    {githubConnected && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="text-[#84cc16]">✓</span> Project code is connected to GitHub repository
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  variant={githubConnected ? "outline" : "default"}
                  className={githubConnected ? "border-2" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                  onClick={handleGithubConnect}
                >
                  {githubConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>

              {[
                { name: "Slack", description: "Send feedback notifications to Slack", icon: Mail, connected: true },
                { name: "Salesforce", description: "Sync feedback with your CRM", icon: Database, connected: false },
                { name: "Zendesk", description: "Create support tickets from feedback", icon: Shield, connected: true },
                { name: "Google Analytics", description: "Link feedback to user analytics", icon: Zap, connected: false },
              ].map((integration) => {
                const Icon = integration.icon;
                return (
                  <div key={integration.name} className="flex items-center justify-between p-4 bg-muted rounded-lg border-2 border-transparent hover:border-primary transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-accent rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4>{integration.name}</h4>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Button 
                      variant={integration.connected ? "outline" : "default"}
                      className={integration.connected ? "border-2" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                    >
                      {integration.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}