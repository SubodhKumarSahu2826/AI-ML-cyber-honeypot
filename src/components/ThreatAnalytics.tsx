import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Brain, 
  BarChart3, 
  PieChart, 
  Target,
  Shield,
  AlertTriangle,
  Zap,
  Download
} from 'lucide-react';

export function ThreatAnalytics() {
  const { toast } = useToast();
  
  const threatData = {
    categories: [
      { name: 'Brute Force', count: 425, percentage: 34, trend: '+12%' },
      { name: 'Web Reconnaissance', count: 298, percentage: 24, trend: '+8%' },
      { name: 'Malware C&C', count: 186, percentage: 15, trend: '-5%' },
      { name: 'Data Exfiltration', count: 124, percentage: 10, trend: '+15%' },
      { name: 'Privilege Escalation', count: 98, percentage: 8, trend: '+3%' },
      { name: 'Other', count: 119, percentage: 9, trend: '+2%' }
    ],
    topCountries: [
      { name: 'China', attacks: 247, percentage: 32 },
      { name: 'Russia', attacks: 189, percentage: 25 },
      { name: 'United States', attacks: 156, percentage: 20 },
      { name: 'Germany', attacks: 89, percentage: 12 },
      { name: 'Others', attacks: 84, percentage: 11 }
    ],
    mlModels: [
      { name: 'Behavioral Analysis', accuracy: 94.2, status: 'active', lastTrained: '2024-01-14' },
      { name: 'Command Classification', accuracy: 91.8, status: 'active', lastTrained: '2024-01-13' },
      { name: 'Network Anomaly', accuracy: 89.5, status: 'training', lastTrained: '2024-01-12' },
      { name: 'Credential Pattern', accuracy: 96.1, status: 'active', lastTrained: '2024-01-14' }
    ]
  };

  const exportAnalyticsReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      threatCategories: threatData.categories,
      geographicDistribution: threatData.topCountries,
      mlModels: threatData.mlModels,
      summary: {
        totalAttacks: threatData.categories.reduce((sum, cat) => sum + cat.count, 0),
        averageMLAccuracy: (threatData.mlModels.reduce((sum, model) => sum + model.accuracy, 0) / threatData.mlModels.length).toFixed(2),
        topThreat: threatData.categories[0].name,
        topCountry: threatData.topCountries[0].name
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Analytics report exported successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-secondary';
      case 'training': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Threat Analytics</h2>
          <p className="text-muted-foreground">ML-powered threat intelligence and analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAnalyticsReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Update Models
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Attack Patterns</TabsTrigger>
          <TabsTrigger value="models">ML Models</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Threat Category Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Threat Categories
                </CardTitle>
                <CardDescription>Distribution of attack types (last 24h)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatData.categories.map((category, index) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {category.count}
                          </Badge>
                          <span className="text-xs text-secondary">{category.trend}</span>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>Top attack source country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatData.topCountries.map((country, index) => (
                    <div key={country.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{country.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {country.attacks} attacks
                        </Badge>
                      </div>
                      <Progress value={country.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-effect border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
                <Shield className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">98.7%</div>
                <p className="text-xs text-muted-foreground">
                  +0.3% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-secondary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">False Positives</CardTitle>
                <AlertTriangle className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">1.3%</div>
                <p className="text-xs text-muted-foreground">
                  -0.1% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Zap className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">127ms</div>
                <p className="text-xs text-muted-foreground">
                  -12ms from yesterday
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-warning/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Threats</CardTitle>
                <TrendingUp className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +15% from yesterday
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Attack Pattern Analysis
              </CardTitle>
              <CardDescription>AI-identified behavioral patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <h4 className="font-medium mb-2 text-destructive">Critical Pattern Detected</h4>
                    <p className="text-sm text-foreground/80 mb-3">
                      Coordinated brute force attempts from multiple IPs targeting SSH services
                    </p>
                    <div className="space-y-2 text-xs">
                      <div>• 15 unique source IPs</div>
                      <div>• Common credential patterns</div>
                      <div>• Synchronized timing intervals</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <h4 className="font-medium mb-2 text-warning">Emerging Threat</h4>
                    <p className="text-sm text-foreground/80 mb-3">
                      New malware family attempting to establish C&C connections
                    </p>
                    <div className="space-y-2 text-xs">
                      <div>• Novel payload signatures</div>
                      <div>• Encrypted communication</div>
                      <div>• Persistence mechanisms</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Command Frequency Analysis</h4>
                  <div className="space-y-3">
                    {[
                      { command: 'whoami', count: 89, risk: 'low' },
                      { command: 'cat /etc/passwd', count: 67, risk: 'high' },
                      { command: 'ls -la', count: 45, risk: 'medium' },
                      { command: 'wget http://*.sh', count: 34, risk: 'critical' },
                      { command: 'sudo su -', count: 28, risk: 'high' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3">
                          <code className="text-sm bg-background/50 px-2 py-1 rounded">{item.command}</code>
                          <Badge variant={item.risk === 'critical' ? 'destructive' : 'outline'}>
                            {item.risk}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.count} times</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Machine Learning Models
              </CardTitle>
              <CardDescription>Model performance and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatData.mlModels.map((model, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border/50 bg-card/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{model.name}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(model.status)} text-background`}>
                          {model.status}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {model.accuracy}% accuracy
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress value={model.accuracy} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Last trained: {model.lastTrained}</span>
                        <span>Accuracy: {model.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">Model Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Auto-training enabled for continuous improvement
                    </p>
                  </div>
                  <Button variant="outline">
                    Upload New Model
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}