-- Create tables for proxy control real-time data

-- Table for storing traffic routing decisions
CREATE TABLE public.traffic_routing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_ip INET NOT NULL,
  destination_url TEXT NOT NULL,
  routing_decision TEXT NOT NULL CHECK (routing_decision IN ('legitimate', 'malicious', 'suspicious')),
  redirect_url TEXT,
  confidence_score DOUBLE PRECISION DEFAULT 0.0,
  ml_prediction_id UUID REFERENCES public.ml_predictions(id),
  user_agent TEXT,
  request_headers JSONB DEFAULT '{}',
  geo_location JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_time_ms INTEGER
);

-- Table for decoy website configurations
CREATE TABLE public.decoy_websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  response_templates JSONB DEFAULT '{}',
  interaction_logging BOOLEAN DEFAULT true,
  honeypot_type TEXT DEFAULT 'web',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for real-time metrics aggregation
CREATE TABLE public.real_time_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DOUBLE PRECISION NOT NULL,
  metadata JSONB DEFAULT '{}',
  time_window TEXT DEFAULT '1m',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for user behavior analysis
CREATE TABLE public.user_behavior_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID,
  source_ip INET NOT NULL,
  behavior_patterns JSONB NOT NULL,
  risk_indicators JSONB DEFAULT '[]',
  behavioral_score DOUBLE PRECISION DEFAULT 0.0,
  classification TEXT CHECK (classification IN ('human', 'bot', 'suspicious', 'unknown')),
  analysis_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  features_extracted JSONB DEFAULT '{}'
);

-- Table for routing rules configuration
CREATE TABLE public.routing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  conditions JSONB NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('allow', 'redirect', 'block', 'analyze')),
  target_url TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  rule_type TEXT DEFAULT 'manual',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.traffic_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decoy_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin access to traffic_routing" ON public.traffic_routing
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin access to decoy_websites" ON public.decoy_websites
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin access to real_time_metrics" ON public.real_time_metrics
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin access to user_behavior_analysis" ON public.user_behavior_analysis
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin access to routing_rules" ON public.routing_rules
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_traffic_routing_source_ip ON public.traffic_routing(source_ip);
CREATE INDEX idx_traffic_routing_created_at ON public.traffic_routing(created_at DESC);
CREATE INDEX idx_traffic_routing_decision ON public.traffic_routing(routing_decision);

CREATE INDEX idx_real_time_metrics_type_time ON public.real_time_metrics(metric_type, recorded_at DESC);
CREATE INDEX idx_user_behavior_analysis_ip ON public.user_behavior_analysis(source_ip);
CREATE INDEX idx_routing_rules_active ON public.routing_rules(is_active, priority DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_decoy_websites_updated_at
BEFORE UPDATE ON public.decoy_websites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routing_rules_updated_at
BEFORE UPDATE ON public.routing_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample decoy websites
INSERT INTO public.decoy_websites (name, url, category, response_templates) VALUES
('Fake Banking Portal', 'https://decoy-bank.example.com', 'financial', '{"login_page": "fake_bank_login.html", "dashboard": "fake_dashboard.html"}'),
('Honeypot Admin Panel', 'https://admin-decoy.example.com', 'admin', '{"login": "admin_login.html", "dashboard": "admin_panel.html"}'),
('Fake E-commerce', 'https://shop-decoy.example.com', 'ecommerce', '{"products": "fake_products.html", "checkout": "fake_checkout.html"}');

-- Insert sample routing rules
INSERT INTO public.routing_rules (rule_name, conditions, action, target_url, priority) VALUES
('Block Known Malicious IPs', '{"ip_reputation": "malicious"}', 'redirect', 'https://decoy-bank.example.com', 100),
('Analyze Suspicious Patterns', '{"risk_score": {"gt": 0.7}}', 'analyze', null, 50),
('Allow Legitimate Traffic', '{"classification": "legitimate"}', 'allow', null, 10);

-- Insert sample real-time metrics
INSERT INTO public.real_time_metrics (metric_type, metric_name, metric_value, metadata) VALUES
('traffic', 'requests_per_minute', 145.0, '{"source": "proxy_analyzer"}'),
('security', 'threat_detection_rate', 0.85, '{"model": "ml_classifier_v2"}'),
('performance', 'response_time_ms', 250.0, '{"endpoint": "routing_engine"}'),
('classification', 'legitimate_percentage', 68.5, '{"time_window": "1h"}');

-- Enable realtime for new tables
ALTER TABLE public.traffic_routing REPLICA IDENTITY FULL;
ALTER TABLE public.real_time_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.user_behavior_analysis REPLICA IDENTITY FULL;