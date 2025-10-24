-- Enhanced schema for reverse proxy gateway features

-- Add proxy configurations table
CREATE TABLE IF NOT EXISTS public.proxy_configurations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    routing_rules JSONB NOT NULL DEFAULT '[]',
    risk_thresholds JSONB NOT NULL DEFAULT '{"low": 0.3, "medium": 0.6, "high": 0.8}',
    ml_model_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add network traffic table for detailed logging
CREATE TABLE IF NOT EXISTS public.network_traffic (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.session_recordings(id),
    source_ip INET NOT NULL,
    destination_ip INET,
    source_port INTEGER,
    destination_port INTEGER,
    protocol TEXT NOT NULL,
    headers JSONB DEFAULT '{}',
    payload_size INTEGER DEFAULT 0,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    risk_score FLOAT CHECK (risk_score >= 0 AND risk_score <= 1),
    ml_classification JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add deception environments table
CREATE TABLE IF NOT EXISTS public.deception_environments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    environment_type TEXT NOT NULL,
    protocol_type protocol_type NOT NULL,
    container_config JSONB NOT NULL DEFAULT '{}',
    personality_config JSONB NOT NULL DEFAULT '{}',
    fake_filesystem JSONB DEFAULT '{}',
    command_responses JSONB DEFAULT '{}',
    rotation_interval_hours INTEGER DEFAULT 24,
    last_rotated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add ML model predictions table
CREATE TABLE IF NOT EXISTS public.ml_predictions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.session_recordings(id),
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    features JSONB NOT NULL,
    prediction JSONB NOT NULL,
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
    prediction_type TEXT CHECK (prediction_type IN ('bot_detection', 'sophistication', 'intent', 'anomaly')),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add forensic analysis table
CREATE TABLE IF NOT EXISTS public.forensic_analysis (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.session_recordings(id) NOT NULL,
    analyst_id UUID REFERENCES public.user_profiles(id),
    analysis_type TEXT CHECK (analysis_type IN ('automated', 'manual', 'hybrid')),
    findings JSONB NOT NULL DEFAULT '{}',
    iocs_extracted JSONB DEFAULT '[]',
    threat_classification TEXT,
    severity_assessment attack_severity,
    notes TEXT,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add threat intelligence exports table
CREATE TABLE IF NOT EXISTS public.threat_intel_exports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    export_type TEXT CHECK (export_type IN ('stix', 'taxii', 'misp', 'csv', 'json')),
    platform_name TEXT NOT NULL,
    data_payload JSONB NOT NULL,
    export_status TEXT CHECK (export_status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
    session_ids UUID[] DEFAULT '{}',
    ioc_count INTEGER DEFAULT 0,
    error_message TEXT,
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add automated reports table
CREATE TABLE IF NOT EXISTS public.automated_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_type TEXT CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
    title TEXT NOT NULL,
    date_range TSTZRANGE NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}',
    visualizations JSONB DEFAULT '{}',
    file_path TEXT,
    recipients TEXT[] DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_network_traffic_session_id ON public.network_traffic(session_id);
CREATE INDEX IF NOT EXISTS idx_network_traffic_source_ip ON public.network_traffic(source_ip);
CREATE INDEX IF NOT EXISTS idx_network_traffic_created_at ON public.network_traffic(created_at);
CREATE INDEX IF NOT EXISTS idx_network_traffic_risk_score ON public.network_traffic(risk_score);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_session_id ON public.ml_predictions(session_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_model_name ON public.ml_predictions(model_name);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_created_at ON public.ml_predictions(created_at);

CREATE INDEX IF NOT EXISTS idx_forensic_analysis_session_id ON public.forensic_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_forensic_analysis_status ON public.forensic_analysis(status);
CREATE INDEX IF NOT EXISTS idx_forensic_analysis_created_at ON public.forensic_analysis(created_at);

-- Enable RLS
ALTER TABLE public.proxy_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_traffic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deception_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forensic_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_intel_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage proxy configurations" ON public.proxy_configurations
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Analysts can view proxy configurations" ON public.proxy_configurations
    FOR SELECT USING (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view network traffic" ON public.network_traffic
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage deception environments" ON public.deception_environments
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Analysts can view deception environments" ON public.deception_environments
    FOR SELECT USING (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view ML predictions" ON public.ml_predictions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Analysts can manage forensic analysis" ON public.forensic_analysis
    FOR ALL USING (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage threat intel exports" ON public.threat_intel_exports
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view automated reports" ON public.automated_reports
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create triggers for updated_at
CREATE TRIGGER update_proxy_configurations_updated_at
    BEFORE UPDATE ON public.proxy_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deception_environments_updated_at
    BEFORE UPDATE ON public.deception_environments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forensic_analysis_updated_at
    BEFORE UPDATE ON public.forensic_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime for live monitoring
ALTER publication supabase_realtime ADD TABLE public.network_traffic;
ALTER publication supabase_realtime ADD TABLE public.ml_predictions;
ALTER publication supabase_realtime ADD TABLE public.forensic_analysis;

-- Insert default proxy configuration
INSERT INTO public.proxy_configurations (name, description, routing_rules, risk_thresholds) VALUES
('Default Gateway', 'Main reverse proxy configuration', 
 '[{"condition": "risk_score > 0.8", "action": "honeypot", "environment": "high-interaction"}, {"condition": "risk_score < 0.3", "action": "legitimate", "backend": "production"}]',
 '{"low": 0.3, "medium": 0.6, "high": 0.8, "critical": 0.9}');

-- Insert default deception environments
INSERT INTO public.deception_environments (name, environment_type, protocol_type, container_config, personality_config) VALUES
('SSH Honeypot', 'high-interaction', 'ssh', 
 '{"image": "ssh-honeypot:latest", "ports": [22], "resources": {"cpu": "100m", "memory": "128Mi"}}',
 '{"os": "Ubuntu 20.04", "hostname": "web-server-01", "users": ["admin", "root", "www-data"]}'),
 
('HTTP Decoy Site', 'medium-interaction', 'http',
 '{"image": "nginx:alpine", "ports": [80, 443], "resources": {"cpu": "200m", "memory": "256Mi"}}',
 '{"server": "Apache/2.4.41", "framework": "PHP 7.4", "cms": "WordPress 5.8"}'),
 
('FTP Server Trap', 'low-interaction', 'ftp',
 '{"image": "ftp-honeypot:latest", "ports": [21], "resources": {"cpu": "50m", "memory": "64Mi"}}',
 '{"banner": "ProFTPD 1.3.6", "anonymous": true, "fake_files": ["README.txt", "config.ini"]}')