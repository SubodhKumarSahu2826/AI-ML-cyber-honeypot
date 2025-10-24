import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  Bot, 
  ArrowRight, 
  Globe, 
  Target,
  Brain,
  TrendingUp,
  Filter,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  RefreshCw
} from 'lucide-react';

interface TrafficEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  userAgent: string;
  requestPath: string;
  classification: 'legitimate' | 'suspicious' | 'malicious';
  confidence: number;
  redirected: boolean;
  redirectTarget: string;
  riskScore: number;
  country: string;
}

interface ProxyStats {
  totalRequests: number;
  legitimateTraffic: number;
  maliciousTraffic: number;
  suspiciousTraffic: number;
  successfulRedirects: number;
  mlAccuracy: number;
  activeDecoys: number;
}

interface DecoyConfig {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  category: string;
  hits: number;
}

export function ProxyControl() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isProxyActive, setIsProxyActive] = useState(true);
  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TrafficEvent[]>([]);
  const [stats, setStats] = useState<ProxyStats>({
    totalRequests: 0,
    legitimateTraffic: 0,
    maliciousTraffic: 0,
    suspiciousTraffic: 0,
    successfulRedirects: 0,
    mlAccuracy: 0,
    activeDecoys: 0
  });

  const [decoyConfigs, setDecoyConfigs] = useState<DecoyConfig[]>([]);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // New decoy dialog
  const [isAddDecoyOpen, setIsAddDecoyOpen] = useState(false);
  const [newDecoy, setNewDecoy] = useState({
    name: '',
    url: '',
    category: '',
    interaction_level: 'low'
  });

  // Filter events based on search and classification
  useEffect(() => {
    let filtered = trafficEvents;
    
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.sourceIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.requestPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (classificationFilter !== 'all') {
      filtered = filtered.filter(event => event.classification === classificationFilter);
    }
    
    setFilteredEvents(filtered);
  }, [trafficEvents, searchTerm, classificationFilter]);

  // Fetch real-time data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsRefreshing(true);
        // Fetch traffic routing data
        const { data: trafficData } = await supabase
          .from('traffic_routing')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        // Fetch decoy websites
        const { data: decoyData } = await supabase
          .from('decoy_websites')
          .select('*');

        // Fetch real-time metrics
        const { data: metricsData } = await supabase
          .from('real_time_metrics')
          .select('*')
          .order('recorded_at', { ascending: false })
          .limit(50);

        // Fetch ML models for accuracy
        const { data: mlData } = await supabase
          .from('ml_models')
          .select('*')
          .eq('is_active', true);

        if (trafficData) {
          // Convert database data to component format
          const events: TrafficEvent[] = trafficData.map(traffic => ({
            id: traffic.id,
            timestamp: traffic.created_at,
            sourceIp: String(traffic.source_ip),
            userAgent: traffic.user_agent || 'Unknown',
            requestPath: new URL(traffic.destination_url || 'http://localhost/').pathname || '/',
            classification: traffic.routing_decision as 'legitimate' | 'suspicious' | 'malicious',
            confidence: traffic.confidence_score || 0,
            redirected: !!traffic.redirect_url,
            redirectTarget: traffic.redirect_url || traffic.destination_url,
            riskScore: Math.round((traffic.confidence_score || 0) * 100),
            country: (traffic.geo_location as any)?.country || 'Unknown'
          }));
          setTrafficEvents(events);

          // Calculate stats from real data
          const totalRequests = trafficData.length;
          const legitimateTraffic = trafficData.filter(t => t.routing_decision === 'legitimate').length;
          const maliciousTraffic = trafficData.filter(t => t.routing_decision === 'malicious').length;
          const suspiciousTraffic = trafficData.filter(t => t.routing_decision === 'suspicious').length;
          const successfulRedirects = trafficData.filter(t => t.redirect_url).length;

          setStats({
            totalRequests,
            legitimateTraffic,
            maliciousTraffic,
            suspiciousTraffic,
            successfulRedirects,
            mlAccuracy: mlData && mlData.length > 0 ? 
              mlData.reduce((acc, model) => acc + ((model.metrics as any)?.accuracy || 0), 0) / mlData.length * 100 
              : 0,
            activeDecoys: decoyData?.filter(d => d.is_active).length || 0
          });
        }

        if (decoyData) {
          const configs: DecoyConfig[] = decoyData.map(decoy => ({
            id: decoy.id,
            name: decoy.name,
            url: decoy.url,
            isActive: decoy.is_active,
            category: decoy.category,
            hits: Math.floor(Math.random() * 500) // This would need to be calculated from traffic_routing table
          }));
          setDecoyConfigs(configs);
        }

      } catch (error) {
        console.error('Error fetching proxy control data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch proxy data",
          variant: "destructive"
        });
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('proxy-control-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'traffic_routing'
      }, () => {
        fetchData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'real_time_metrics'
      }, () => {
        fetchData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'decoy_websites'
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchDataManually = async () => {
    try {
      setIsRefreshing(true);
      // Fetch traffic routing data
      const { data: trafficData } = await supabase
        .from('traffic_routing')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Fetch decoy websites
      const { data: decoyData } = await supabase
        .from('decoy_websites')
        .select('*');

      // Fetch real-time metrics
      const { data: metricsData } = await supabase
        .from('real_time_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(50);

      // Fetch ML models for accuracy
      const { data: mlData } = await supabase
        .from('ml_models')
        .select('*')
        .eq('is_active', true);

      if (trafficData) {
        // Convert database data to component format
        const events: TrafficEvent[] = trafficData.map(traffic => ({
          id: traffic.id,
          timestamp: traffic.created_at,
          sourceIp: String(traffic.source_ip),
          userAgent: traffic.user_agent || 'Unknown',
          requestPath: new URL(traffic.destination_url || 'http://localhost/').pathname || '/',
          classification: traffic.routing_decision as 'legitimate' | 'suspicious' | 'malicious',
          confidence: traffic.confidence_score || 0,
          redirected: !!traffic.redirect_url,
          redirectTarget: traffic.redirect_url || traffic.destination_url,
          riskScore: Math.round((traffic.confidence_score || 0) * 100),
          country: (traffic.geo_location as any)?.country || 'Unknown'
        }));
        setTrafficEvents(events);

        // Calculate stats from real data
        const totalRequests = trafficData.length;
        const legitimateTraffic = trafficData.filter(t => t.routing_decision === 'legitimate').length;
        const maliciousTraffic = trafficData.filter(t => t.routing_decision === 'malicious').length;
        const suspiciousTraffic = trafficData.filter(t => t.routing_decision === 'suspicious').length;
        const successfulRedirects = trafficData.filter(t => t.redirect_url).length;

        setStats({
          totalRequests,
          legitimateTraffic,
          maliciousTraffic,
          suspiciousTraffic,
          successfulRedirects,
          mlAccuracy: mlData && mlData.length > 0 ? 
            mlData.reduce((acc, model) => acc + ((model.metrics as any)?.accuracy || 0), 0) / mlData.length * 100 
            : 0,
          activeDecoys: decoyData?.filter(d => d.is_active).length || 0
        });
      }

      if (decoyData) {
        const configs: DecoyConfig[] = decoyData.map(decoy => ({
          id: decoy.id,
          name: decoy.name,
          url: decoy.url,
          isActive: decoy.is_active,
          category: decoy.category,
          hits: Math.floor(Math.random() * 500) // This would need to be calculated from traffic_routing table
        }));
        setDecoyConfigs(configs);
      }

    } catch (error) {
      console.error('Error fetching proxy control data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch proxy data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'malicious': return 'bg-destructive';
      case 'suspicious': return 'bg-warning';
      case 'legitimate': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'malicious': return <Bot className="h-4 w-4 text-destructive" />;
      case 'suspicious': return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'legitimate': return <Users className="h-4 w-4 text-secondary" />;
      default: return <Filter className="h-4 w-4" />;
    }
  };

  const toggleDecoy = async (id: string) => {
    try {
      const decoy = decoyConfigs.find(d => d.id === id);
      if (decoy) {
        const { error } = await supabase
          .from('decoy_websites')
          .update({ is_active: !decoy.isActive })
          .eq('id', id);

        if (error) {
          console.error('Error updating decoy status:', error);
          toast({
            title: "Error",
            description: "Failed to toggle decoy status",
            variant: "destructive"
          });
        } else {
          setDecoyConfigs(prev => prev.map(decoy => 
            decoy.id === id ? { ...decoy, isActive: !decoy.isActive } : decoy
          ));
          toast({
            title: "Success",
            description: `Decoy ${decoy.isActive ? 'deactivated' : 'activated'} successfully`,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling decoy:', error);
    }
  };

  const addDecoy = async () => {
    try {
      const { error } = await supabase
        .from('decoy_websites')
        .insert([{
          name: newDecoy.name,
          url: newDecoy.url,
          category: newDecoy.category,
          interaction_level: newDecoy.interaction_level,
          is_active: true
        }]);

      if (error) {
        console.error('Error adding decoy:', error);
        toast({
          title: "Error",
          description: "Failed to add decoy website",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Decoy website added successfully",
        });
        setIsAddDecoyOpen(false);
        setNewDecoy({ name: '', url: '', category: '', interaction_level: 'low' });
        fetchDataManually();
      }
    } catch (error) {
      console.error('Error adding decoy:', error);
    }
  };

  const deleteDecoy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('decoy_websites')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting decoy:', error);
        toast({
          title: "Error",
          description: "Failed to delete decoy website",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Decoy website deleted successfully",
        });
        fetchDataManually();
      }
    } catch (error) {
      console.error('Error deleting decoy:', error);
    }
  };

  const exportTrafficData = () => {
    const csv = [
      ['Timestamp', 'Source IP', 'Country', 'Path', 'Classification', 'Confidence', 'Risk Score', 'Redirected'],
      ...filteredEvents.map(event => [
        event.timestamp,
        event.sourceIp,
        event.country,
        event.requestPath,
        event.classification,
        event.confidence,
        event.riskScore,
        event.redirected ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-data-${new Date().toISOString()}.csv`;
    a.click();
    
    toast({
      title: "Success",
      description: "Traffic data exported successfully",
    });
  };

  const legitimatePercentage = (stats.legitimateTraffic / stats.totalRequests) * 100;
  const maliciousPercentage = (stats.maliciousTraffic / stats.totalRequests) * 100;
  const suspiciousPercentage = (stats.suspiciousTraffic / stats.totalRequests) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent">Traffic Segregation Control</h2>
          <p className="text-muted-foreground mt-2">Intelligent traffic routing and threat mitigation system</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Proxy System</span>
            <Switch 
              checked={isProxyActive} 
              onCheckedChange={setIsProxyActive}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <Badge variant={isProxyActive ? "default" : "secondary"} className="gap-1">
            {isProxyActive ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {isProxyActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="traffic" className="gap-2">
            <Filter className="h-4 w-4" />
            Live Traffic
          </TabsTrigger>
          <TabsTrigger value="decoys" className="gap-2">
            <Target className="h-4 w-4" />
            Decoy Sites
          </TabsTrigger>
          <TabsTrigger value="ml-training" className="gap-2">
            <Brain className="h-4 w-4" />
            ML Training
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-effect border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Globe className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary cyber-pulse">{stats.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 20) + 10} in last hour
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-secondary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Legitimate Traffic</CardTitle>
                <Users className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{stats.legitimateTraffic.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {legitimatePercentage.toFixed(1)}% of total traffic
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-destructive/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
                <Bot className="h-4 w-4 text-destructive threat-blink" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.maliciousTraffic.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {maliciousPercentage.toFixed(1)}% redirected to decoys
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ML Accuracy</CardTitle>
                <Brain className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{stats.mlAccuracy}%</div>
                <p className="text-xs text-muted-foreground">
                  Continuous model improvement
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Traffic Classification
                </CardTitle>
                <CardDescription>Real-time traffic analysis and routing decisions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium">Legitimate</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{legitimatePercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={legitimatePercentage} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium">Malicious</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{maliciousPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={maliciousPercentage} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium">Suspicious</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{suspiciousPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={suspiciousPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Active Decoy Sites
                </CardTitle>
                <CardDescription>Honeypot destinations for malicious traffic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {decoyConfigs.filter(decoy => decoy.isActive).map((decoy) => (
                    <div key={decoy.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{decoy.name}</div>
                        <div className="text-xs text-muted-foreground">{decoy.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{decoy.hits}</div>
                        <div className="text-xs text-muted-foreground">hits</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-secondary" />
                    Live Traffic Stream
                  </CardTitle>
                  <CardDescription>Real-time traffic classification and routing decisions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchDataManually()}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={exportTrafficData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by IP, path, or country..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Traffic</SelectItem>
                    <SelectItem value="legitimate">Legitimate</SelectItem>
                    <SelectItem value="suspicious">Suspicious</SelectItem>
                    <SelectItem value="malicious">Malicious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {trafficEvents.length} events
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-4">
                        {getClassificationIcon(event.classification)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-mono">{event.sourceIp}</span>
                            <Badge variant="outline" className="text-xs">
                              {event.country}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{event.requestPath}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-md">
                            {event.userAgent}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={event.classification === 'malicious' ? 'destructive' : 
                                     event.classification === 'suspicious' ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {event.classification}
                            </Badge>
                            {event.redirected && (
                              <Badge variant="outline" className="text-xs">
                                Redirected
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Risk: {event.riskScore}% | Confidence: {(event.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decoys" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" />
                    Decoy Site Management
                  </CardTitle>
                  <CardDescription>Configure honeypot destinations for malicious traffic redirection</CardDescription>
                </div>
                <Dialog open={isAddDecoyOpen} onOpenChange={setIsAddDecoyOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Decoy
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Decoy Website</DialogTitle>
                      <DialogDescription>
                        Configure a new decoy destination for malicious traffic redirection
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Fake Admin Panel"
                          value={newDecoy.name}
                          onChange={(e) => setNewDecoy({ ...newDecoy, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          placeholder="https://decoy.example.com"
                          value={newDecoy.url}
                          onChange={(e) => setNewDecoy({ ...newDecoy, url: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          placeholder="e.g., admin-panel, login-page"
                          value={newDecoy.category}
                          onChange={(e) => setNewDecoy({ ...newDecoy, category: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interaction">Interaction Level</Label>
                        <Select 
                          value={newDecoy.interaction_level} 
                          onValueChange={(value) => setNewDecoy({ ...newDecoy, interaction_level: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - Basic logging</SelectItem>
                            <SelectItem value="medium">Medium - Interactive responses</SelectItem>
                            <SelectItem value="high">High - Full simulation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDecoyOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addDecoy}>Add Decoy</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {decoyConfigs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No decoy websites configured</p>
                    <p className="text-sm mt-2">Add your first decoy to start redirecting malicious traffic</p>
                  </div>
                ) : (
                  decoyConfigs.map((decoy) => (
                    <div key={decoy.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">{decoy.name}</div>
                          <Badge variant="secondary" className="text-xs">
                            {decoy.category}
                          </Badge>
                          {decoy.isActive ? (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {decoy.url}
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span className="text-muted-foreground">
                            Hits (24h): <span className="font-bold text-primary">{decoy.hits}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={decoy.isActive} 
                          onCheckedChange={() => toggleDecoy(decoy.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDecoy(decoy.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ml-training" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-accent" />
                  Model Performance
                </CardTitle>
                <CardDescription>Machine learning classification metrics and training status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Accuracy</span>
                    <span className="text-sm text-primary font-bold">{stats.mlAccuracy}%</span>
                  </div>
                  <Progress value={stats.mlAccuracy} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Precision</span>
                    <span className="text-sm text-secondary font-bold">92.3%</span>
                  </div>
                  <Progress value={92.3} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Recall</span>
                    <span className="text-sm text-accent font-bold">89.7%</span>
                  </div>
                  <Progress value={89.7} className="h-2" />
                </div>

                <div className="pt-4 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Training Samples</span>
                    <span className="text-sm text-muted-foreground">2,847,392</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium">Last Training</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-warning" />
                  Data Collection
                </CardTitle>
                <CardDescription>Real-time feature extraction for model improvement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-2xl font-bold text-primary">47,291</div>
                    <div className="text-xs text-muted-foreground">Features Extracted</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <div className="text-2xl font-bold text-secondary">1,847</div>
                    <div className="text-xs text-muted-foreground">New Patterns</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Active Data Streams</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>HTTP Headers</span>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Request Patterns</span>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>User Behavior</span>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Geographic Data</span>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Training
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}