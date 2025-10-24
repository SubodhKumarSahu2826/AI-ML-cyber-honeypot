import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function useProxyControl() {
  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);
  const [stats, setStats] = useState<ProxyStats>({
    totalRequests: 869,
    legitimateTraffic: 208,
    maliciousTraffic: 377,
    suspiciousTraffic: 120,
    successfulRedirects: 50,
    mlAccuracy: 0.88,
    activeDecoys: 5
  });
  const [decoyConfigs, setDecoyConfigs] = useState<DecoyConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch traffic routing data
      const { data: trafficData } = await supabase
        .from('traffic_routing')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch decoy websites
      const { data: decoyData } = await supabase
        .from('decoy_websites')
        .select('*');

      // Fetch ML models for accuracy
      const { data: mlData } = await supabase
        .from('ml_models')
        .select('*')
        .eq('is_active', true);

      // Get traffic routing statistics
      const { data: routingStats } = await supabase
        .from('traffic_routing')
        .select('routing_decision')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (trafficData) {
        // Convert database data to component format
        const events: TrafficEvent[] = trafficData.map(traffic => ({
          id: traffic.id,
          timestamp: traffic.created_at,
          sourceIp: String(traffic.source_ip),
          userAgent: traffic.user_agent || 'Unknown',
          requestPath: extractPath(traffic.destination_url || 'http://localhost/'),
          classification: traffic.routing_decision as 'legitimate' | 'suspicious' | 'malicious',
          confidence: traffic.confidence_score || 0,
          redirected: !!traffic.redirect_url,
          redirectTarget: traffic.redirect_url || traffic.destination_url,
          riskScore: Math.round((traffic.confidence_score || 0) * 100),
          country: (traffic.geo_location as any)?.country || 'Unknown'
        }));
        setTrafficEvents(events);
      }

      if (routingStats) {
        // Calculate stats from real data
        const totalRequests = routingStats.length;
        const legitimateTraffic = routingStats.filter(t => t.routing_decision === 'legitimate').length;
        const maliciousTraffic = routingStats.filter(t => t.routing_decision === 'malicious').length;
        const suspiciousTraffic = routingStats.filter(t => t.routing_decision === 'suspicious').length;
        const successfulRedirects = trafficData?.filter(t => t.redirect_url).length || 0;

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
        // Calculate hits for each decoy from traffic data
        const decoyHits = await Promise.all(
          decoyData.map(async (decoy) => {
            const { count } = await supabase
              .from('traffic_routing')
              .select('*', { count: 'exact', head: true })
              .eq('redirect_url', decoy.url)
              .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            
            return {
              id: decoy.id,
              name: decoy.name,
              url: decoy.url,
              isActive: decoy.is_active,
              category: decoy.category,
              hits: count || 0
            };
          })
        );
        
        setDecoyConfigs(decoyHits);
      }

    } catch (error) {
      console.error('Error fetching proxy control data:', error);
    } finally {
      setLoading(false);
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
          return false;
        } else {
          setDecoyConfigs(prev => prev.map(decoy => 
            decoy.id === id ? { ...decoy, isActive: !decoy.isActive } : decoy
          ));
          return true;
        }
      }
    } catch (error) {
      console.error('Error toggling decoy:', error);
      return false;
    }
  };

  const addRoutingRule = async (rule: {
    rule_name: string;
    conditions: any;
    action: string;
    target_url?: string;
    priority: number;
  }) => {
    try {
      const { error } = await supabase
        .from('routing_rules')
        .insert([rule]);

      if (error) {
        console.error('Error adding routing rule:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error adding routing rule:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('proxy-control-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'traffic_routing'
      }, (payload) => {
        console.log('Traffic routing update:', payload);
        fetchData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'decoy_websites'
      }, (payload) => {
        console.log('Decoy websites update:', payload);
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    trafficEvents,
    stats,
    decoyConfigs,
    loading,
    toggleDecoy,
    addRoutingRule,
    refreshData: fetchData
  };
}

function extractPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}