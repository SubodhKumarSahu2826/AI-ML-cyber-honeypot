import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrafficAnalysisRequest {
  source_ip: string;
  user_agent?: string;
  destination_url: string;
  request_headers?: Record<string, string>;
  request_method?: string;
}

interface RoutingDecision {
  routing_decision: 'legitimate' | 'suspicious' | 'malicious';
  confidence_score: number;
  redirect_url?: string;
  risk_indicators: string[];
  ml_prediction?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { source_ip, user_agent, destination_url, request_headers, request_method } = await req.json() as TrafficAnalysisRequest;

    console.log(`Analyzing traffic from ${source_ip} to ${destination_url}`);

    // Step 1: Analyze traffic using ML models and rules
    const routingDecision = await analyzeTraffic({
      source_ip,
      user_agent,
      destination_url,
      request_headers,
      request_method
    }, supabaseClient);

    // Step 2: Get appropriate redirect URL if needed
    let redirectUrl = null;
    if (routingDecision.routing_decision === 'malicious' || routingDecision.routing_decision === 'suspicious') {
      redirectUrl = await getDecoyUrl(routingDecision.routing_decision, supabaseClient);
      routingDecision.redirect_url = redirectUrl;
    }

    // Step 3: Log the traffic routing decision
    const { error: logError } = await supabaseClient
      .from('traffic_routing')
      .insert([{
        source_ip,
        destination_url,
        routing_decision: routingDecision.routing_decision,
        redirect_url: redirectUrl,
        confidence_score: routingDecision.confidence_score,
        user_agent,
        request_headers: request_headers || {},
        geo_location: {}, // Would be populated from IP geolocation service
        processing_time_ms: Date.now() // Would calculate actual processing time
      }]);

    if (logError) {
      console.error('Error logging traffic routing:', logError);
    }

    // Step 4: Update real-time metrics
    await updateMetrics(routingDecision, supabaseClient);

    return new Response(
      JSON.stringify({
        success: true,
        routing_decision: routingDecision.routing_decision,
        redirect_url: redirectUrl,
        confidence_score: routingDecision.confidence_score,
        risk_indicators: routingDecision.risk_indicators
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in traffic router:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function analyzeTraffic(
  request: TrafficAnalysisRequest, 
  supabase: any
): Promise<RoutingDecision> {
  const riskIndicators: string[] = [];
  let riskScore = 0;
  let confidence = 0.5;

  // Basic heuristic analysis
  
  // Check for suspicious patterns in user agent
  if (request.user_agent) {
    if (request.user_agent.includes('curl') || 
        request.user_agent.includes('wget') || 
        request.user_agent.includes('python') ||
        request.user_agent.includes('bot')) {
      riskScore += 30;
      riskIndicators.push('Automated tool detected');
    }
  }

  // Check for admin/sensitive paths
  const suspiciousPaths = ['/admin', '/wp-admin', '/phpmyadmin', '/cpanel', '/.env', '/config'];
  const urlPath = new URL(request.destination_url).pathname.toLowerCase();
  
  if (suspiciousPaths.some(path => urlPath.includes(path))) {
    riskScore += 40;
    riskIndicators.push('Sensitive path access');
  }

  // Check against known malicious IPs (would integrate with threat intel)
  const { data: threatIntel } = await supabase
    .from('threat_intel_iocs')
    .select('*')
    .eq('indicator_type', 'ip')
    .eq('indicator_value', request.source_ip)
    .single();

  if (threatIntel) {
    riskScore += 50;
    riskIndicators.push('Known malicious IP');
  }

  // Check routing rules
  const { data: routingRules } = await supabase
    .from('routing_rules')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (routingRules) {
    for (const rule of routingRules) {
      if (evaluateRule(rule.conditions, request, riskScore)) {
        if (rule.action === 'block' || rule.action === 'redirect') {
          riskScore += 30;
          riskIndicators.push(`Matched rule: ${rule.rule_name}`);
        }
        break; // Use highest priority rule
      }
    }
  }

  // Determine classification based on risk score
  let classification: 'legitimate' | 'suspicious' | 'malicious';
  if (riskScore >= 70) {
    classification = 'malicious';
    confidence = Math.min(0.95, 0.7 + (riskScore - 70) / 100);
  } else if (riskScore >= 30) {
    classification = 'suspicious';
    confidence = 0.6 + (riskScore - 30) / 100;
  } else {
    classification = 'legitimate';
    confidence = Math.max(0.5, 1 - riskScore / 100);
  }

  // Log ML prediction for training
  const { error: mlError } = await supabase
    .from('ml_predictions')
    .insert([{
      model_name: 'heuristic_analyzer',
      model_version: '1.0',
      features: {
        user_agent: request.user_agent,
        destination_path: urlPath,
        source_ip: request.source_ip,
        risk_indicators: riskIndicators
      },
      prediction: {
        classification,
        risk_score: riskScore
      },
      confidence_score: confidence,
      prediction_type: 'traffic_classification'
    }]);

  if (mlError) {
    console.error('Error logging ML prediction:', mlError);
  }

  return {
    routing_decision: classification,
    confidence_score: confidence,
    risk_indicators: riskIndicators
  };
}

function evaluateRule(conditions: any, request: TrafficAnalysisRequest, currentRiskScore: number): boolean {
  // Simple rule evaluation - in production this would be more sophisticated
  if (conditions.ip_reputation === 'malicious') {
    // Would check against threat intel databases
    return false;
  }
  
  if (conditions.risk_score && conditions.risk_score.gt && currentRiskScore > conditions.risk_score.gt) {
    return true;
  }

  if (conditions.user_agent_pattern) {
    return request.user_agent?.includes(conditions.user_agent_pattern) || false;
  }

  return false;
}

async function getDecoyUrl(classification: string, supabase: any): Promise<string | null> {
  const { data: decoys } = await supabase
    .from('decoy_websites')
    .select('*')
    .eq('is_active', true);

  if (!decoys || decoys.length === 0) {
    return null;
  }

  // Select appropriate decoy based on classification
  let suitableDecoys = decoys;
  
  if (classification === 'malicious') {
    // Prefer high-interaction honeypots for malicious traffic
    suitableDecoys = decoys.filter(d => d.category === 'admin' || d.category === 'financial');
  }

  // Return random decoy from suitable options
  const selectedDecoy = suitableDecoys[Math.floor(Math.random() * suitableDecoys.length)];
  return selectedDecoy.url;
}

async function updateMetrics(decision: RoutingDecision, supabase: any) {
  const now = new Date().toISOString();
  
  // Update classification metrics
  await supabase
    .from('real_time_metrics')
    .insert([{
      metric_type: 'classification',
      metric_name: `${decision.routing_decision}_count`,
      metric_value: 1,
      metadata: { timestamp: now }
    }]);

  // Update confidence metrics
  await supabase
    .from('real_time_metrics')
    .insert([{
      metric_type: 'performance',
      metric_name: 'avg_confidence_score',
      metric_value: decision.confidence_score,
      metadata: { timestamp: now }
    }]);
}