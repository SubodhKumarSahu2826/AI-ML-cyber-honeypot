import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, 
  Server, 
  Shield, 
  Users,
  Database,
  Bell,
  Upload,
  Download,
  Trash2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HoneypotManager } from './HoneypotManager';
import { UserManager } from './UserManager';
import { DataManagement } from './DataManagement';

interface HoneypotService {
  id: string;
  name: string;
  protocol: string;
  port: number;
  status: 'running' | 'stopped' | 'error';
  connections: number;
}

export function AdminPanel() {
  const { toast } = useToast();
  const [honeypots, setHoneypots] = useState<HoneypotService[]>([
    { id: '1', name: 'SSH Honeypot', protocol: 'SSH', port: 22, status: 'running', connections: 45 },
    { id: '2', name: 'HTTP Server', protocol: 'HTTP', port: 80, status: 'running', connections: 23 },
    { id: '3', name: 'FTP Service', protocol: 'FTP', port: 21, status: 'stopped', connections: 0 },
    { id: '4', name: 'Telnet Trap', protocol: 'Telnet', port: 23, status: 'running', connections: 12 }
  ]);

  const [settings, setSettings] = useState({
    autoBlock: true,
    alertsEnabled: true,
    logRetention: 30,
    maxConnections: 100,
    geoBlocking: false
  });

  const toggleHoneypot = (id: string) => {
    setHoneypots(prev => prev.map(hp => 
      hp.id === id 
        ? { ...hp, status: hp.status === 'running' ? 'stopped' : 'running' }
        : hp
    ));
    
    toast({
      title: "Service Updated",
      description: "Honeypot service status changed successfully."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-secondary';
      case 'stopped': return 'bg-muted';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Administration</h2>
          <p className="text-muted-foreground">System configuration and management</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          Admin Access
        </Badge>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <HoneypotManager />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-block Threats</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically block detected threats
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoBlock}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, autoBlock: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Alerts</Label>
                    <div className="text-sm text-muted-foreground">
                      Send notifications for threats
                    </div>
                  </div>
                  <Switch
                    checked={settings.alertsEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, alertsEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Geographic Blocking</Label>
                    <div className="text-sm text-muted-foreground">
                      Block traffic from specific countries
                    </div>
                  </div>
                  <Switch
                    checked={settings.geoBlocking}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, geoBlocking: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention">Log Retention (days)</Label>
                  <Input
                    id="retention"
                    type="number"
                    value={settings.logRetention}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, logRetention: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxConnections">Max Concurrent Connections</Label>
                  <Input
                    id="maxConnections"
                    type="number"
                    value={settings.maxConnections}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, maxConnections: parseInt(e.target.value) }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent" />
                  Alert Configuration
                </CardTitle>
                <CardDescription>Configure notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Alert Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slack">Slack Webhook URL</Label>
                  <Input
                    id="slack"
                    placeholder="https://hooks.slack.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alert Thresholds</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Risk Events</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Failed Login Attempts</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Malware Detection</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManager />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <DataManagement />
            </div>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  System Status
                </CardTitle>
                <CardDescription>Current system health and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-mono">23%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-mono">1.2GB / 4GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Disk Space</span>
                    <span className="text-sm font-mono">450GB / 1TB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Network I/O</span>
                    <span className="text-sm font-mono">125 MB/s</span>
                  </div>
                  <div className="pt-4 border-t border-border/30">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Size</span>
                      <span className="text-sm font-mono">2.3 GB</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-mono">47 days 12h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}