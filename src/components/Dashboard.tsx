import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  AlertTriangle, 
  Globe, 
  Terminal, 
  Activity,
  Users,
  Server,
  Zap,
  TrendingUp,
  MapPin,
  Clock,
  Filter,
  Moon,
  Sun
} from 'lucide-react';
import { AttackMap } from './AttackMap';
import { SessionMonitor } from './SessionMonitor';
import { ThreatAnalytics } from './ThreatAnalytics';
import { AdminPanel } from './AdminPanel';
import { ProxyControl } from './ProxyControl';

interface AttackEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  country: string;
  protocol: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  classification: string;
  confidence: number;
}

interface SystemStats {
  activeSessions: number;
  totalAttacks: number;
  honeypots: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState<AttackEvent[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [stats, setStats] = useState<SystemStats>({
    activeSessions: 12,
    totalAttacks: 1247,
    honeypots: 8,
    threatLevel: 'medium'
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Simulate real-time events
  useEffect(() => {
    const mockEvents: AttackEvent[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        sourceIp: '192.168.1.100',
        country: 'China',
        protocol: 'SSH',
        severity: 'high',
        classification: 'Credential Brute Force',
        confidence: 0.94
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        sourceIp: '10.0.0.50',
        country: 'Russia',
        protocol: 'HTTP',
        severity: 'medium',
        classification: 'Web Reconnaissance',
        confidence: 0.78
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        sourceIp: '172.16.0.25',
        country: 'USA',
        protocol: 'SSH',
        severity: 'critical',
        classification: 'Advanced Persistent Threat',
        confidence: 0.97
      }
    ];
    setEvents(mockEvents);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeSessions: prev.activeSessions + Math.floor(Math.random() * 3) - 1,
        totalAttacks: prev.totalAttacks + Math.floor(Math.random() * 5)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-gradient-threat';
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary cyber-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              CyberHoneypot
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              System Online
            </Badge>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-6 mr-2" />
              Alerts (2)
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="proxy" className="gap-2">
              <Filter className="h-4 w-4" />
              Proxy
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Terminal className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Server className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-effect border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary cyber-pulse">{stats.activeSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    +3 from last hour
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-secondary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Attacks</CardTitle>
                  <Zap className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{stats.totalAttacks.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Decoy Sites</CardTitle>
                  <Globe className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.honeypots}</div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-destructive/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive threat-blink" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive capitalize">{stats.threatLevel}</div>
                  <p className="text-xs text-muted-foreground">
                    Elevated activity detected
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Attack Map */}
              <Card className="glass-effect lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Global Threat Map
                  </CardTitle>
                  <CardDescription>Real-time attack source visualization</CardDescription>
                </CardHeader>
                <CardContent>
                  <AttackMap />
                </CardContent>
              </Card>

              {/* Recent Events */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-secondary" />
                    Recent Events
                  </CardTitle>
                  <CardDescription>Live attack event stream</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${getSeverityColor(event.severity)}`} />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-mono">{event.sourceIp}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {event.protocol}
                                </Badge>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {event.country}
                                </span>
                              </div>
                              <div className="text-xs text-foreground">{event.classification}</div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div>Confidence: {(event.confidence * 100).toFixed(0)}%</div>
                            <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="proxy">
            <ProxyControl />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionMonitor />
          </TabsContent>

          <TabsContent value="analytics">
            <ThreatAnalytics />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}