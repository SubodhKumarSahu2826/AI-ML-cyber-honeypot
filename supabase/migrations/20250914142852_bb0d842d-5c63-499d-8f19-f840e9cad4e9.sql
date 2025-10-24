-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'analyst', 'researcher');

-- Create protocol types enum
CREATE TYPE public.protocol_type AS ENUM ('ssh', 'http', 'https', 'ftp', 'telnet', 'rdp', 'snmp', 'mqtt', 'modbus', 'other');

-- Create attack severity enum
CREATE TYPE public.attack_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Create classification types enum
CREATE TYPE public.attack_classification AS ENUM ('malware', 'bruteforce', 'scan', 'exploit', 'ddos', 'bot', 'reconnaissance', 'other');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'analyst',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create honeypot services table
CREATE TABLE public.honeypot_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  protocol protocol_type NOT NULL,
  port INTEGER NOT NULL,
  host TEXT NOT NULL DEFAULT '0.0.0.0',
  is_active BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}',
  personality JSONB DEFAULT '{}',
  connection_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attack events table
CREATE TABLE public.attack_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  service_id UUID REFERENCES public.honeypot_services(id),
  source_ip INET NOT NULL,
  source_port INTEGER,
  source_country TEXT,
  source_city TEXT,
  protocol protocol_type NOT NULL,
  severity attack_severity NOT NULL DEFAULT 'low',
  classification attack_classification NOT NULL DEFAULT 'other',
  confidence DECIMAL(3,2) DEFAULT 0.50,
  is_bot BOOLEAN DEFAULT false,
  sophistication_score DECIMAL(3,2) DEFAULT 0.50,
  payload TEXT,
  user_agent TEXT,
  headers JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  geo_data JSONB DEFAULT '{}'
);

-- Create session recordings table
CREATE TABLE public.session_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE,
  service_id UUID REFERENCES public.honeypot_services(id),
  source_ip INET NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  command_count INTEGER DEFAULT 0,
  commands JSONB DEFAULT '[]',
  raw_data TEXT,
  forensic_data JSONB DEFAULT '{}',
  exported_formats TEXT[] DEFAULT '{}'
);

-- Create ML models table
CREATE TABLE public.ml_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  model_type TEXT NOT NULL,
  accuracy DECIMAL(5,4),
  status TEXT NOT NULL DEFAULT 'training',
  training_data_size INTEGER,
  features JSONB DEFAULT '{}',
  hyperparameters JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_trained TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT false
);

-- Create threat intelligence IOCs table
CREATE TABLE public.threat_iocs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ioc_type TEXT NOT NULL, -- ip, domain, hash, etc
  ioc_value TEXT NOT NULL,
  threat_type TEXT,
  confidence INTEGER DEFAULT 50,
  source TEXT,
  campaign_name TEXT,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  UNIQUE(ioc_type, ioc_value)
);

-- Create system configuration table
CREATE TABLE public.system_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB DEFAULT '{}',
  new_values JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  severity attack_severity NOT NULL DEFAULT 'medium',
  alert_type TEXT NOT NULL,
  source_data JSONB DEFAULT '{}',
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.honeypot_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attack_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_iocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for honeypot services (analysts+ can view, admins can modify)
CREATE POLICY "Authenticated users can view services" ON public.honeypot_services
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage services" ON public.honeypot_services
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for attack events (analysts+ can view)
CREATE POLICY "Analysts can view attack events" ON public.attack_events
  FOR SELECT TO authenticated USING (
    public.get_current_user_role() IN ('admin', 'analyst', 'researcher')
  );

CREATE POLICY "Admins can manage attack events" ON public.attack_events
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for session recordings (analysts+ can view)
CREATE POLICY "Analysts can view session recordings" ON public.session_recordings
  FOR SELECT TO authenticated USING (
    public.get_current_user_role() IN ('admin', 'analyst', 'researcher')
  );

CREATE POLICY "Admins can manage session recordings" ON public.session_recordings
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for ML models (analysts+ can view, admins can modify)
CREATE POLICY "Analysts can view ML models" ON public.ml_models
  FOR SELECT TO authenticated USING (
    public.get_current_user_role() IN ('admin', 'analyst', 'researcher')
  );

CREATE POLICY "Admins can manage ML models" ON public.ml_models
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for threat IOCs (analysts+ can view)
CREATE POLICY "Analysts can view threat IOCs" ON public.threat_iocs
  FOR SELECT TO authenticated USING (
    public.get_current_user_role() IN ('admin', 'analyst', 'researcher')
  );

CREATE POLICY "Admins can manage threat IOCs" ON public.threat_iocs
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for system config (admin only)
CREATE POLICY "Admins can manage system config" ON public.system_config
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for audit logs (admin only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for alerts (analysts+ can view, admins can manage)
CREATE POLICY "Analysts can view alerts" ON public.alerts
  FOR SELECT TO authenticated USING (
    public.get_current_user_role() IN ('admin', 'analyst', 'researcher')
  );

CREATE POLICY "Analysts can acknowledge alerts" ON public.alerts
  FOR UPDATE TO authenticated USING (
    public.get_current_user_role() IN ('admin', 'analyst', 'researcher')
  ) WITH CHECK (
    public.get_current_user_role() IN ('admin', 'analyst', 'researcher')
  );

CREATE POLICY "System can create alerts" ON public.alerts
  FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_honeypot_services_updated_at
  BEFORE UPDATE ON public.honeypot_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'analyst'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_attack_events_source_ip ON public.attack_events(source_ip);
CREATE INDEX idx_attack_events_created_at ON public.attack_events(created_at);
CREATE INDEX idx_attack_events_severity ON public.attack_events(severity);
CREATE INDEX idx_attack_events_classification ON public.attack_events(classification);
CREATE INDEX idx_session_recordings_session_id ON public.session_recordings(session_id);
CREATE INDEX idx_session_recordings_source_ip ON public.session_recordings(source_ip);
CREATE INDEX idx_threat_iocs_type_value ON public.threat_iocs(ioc_type, ioc_value);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_alerts_severity_created ON public.alerts(severity, created_at);

-- Enable realtime for real-time dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.attack_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_recordings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.honeypot_services;

-- Set replica identity for realtime updates
ALTER TABLE public.attack_events REPLICA IDENTITY FULL;
ALTER TABLE public.session_recordings REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.honeypot_services REPLICA IDENTITY FULL;

-- Insert default system configuration
INSERT INTO public.system_config (key, value, description) VALUES
  ('auto_blocking_enabled', 'true', 'Enable automatic IP blocking for high-risk attacks'),
  ('alert_thresholds', '{"high": 10, "critical": 50}', 'Thresholds for alert generation'),
  ('log_retention_days', '90', 'Number of days to retain log data'),
  ('max_connections_per_service', '100', 'Maximum concurrent connections per honeypot service'),
  ('ml_confidence_threshold', '0.75', 'Minimum confidence for ML classifications'),
  ('notification_channels', '{"slack": false, "email": true, "sms": false}', 'Enabled notification channels');

-- Insert default honeypot services
INSERT INTO public.honeypot_services (name, protocol, port, host, is_active, config, personality) VALUES
  ('SSH Honeypot', 'ssh', 2222, '0.0.0.0', true, '{"banner": "OpenSSH_8.9p1 Ubuntu-3ubuntu0.1", "auth_delay": 2}', '{"os": "ubuntu", "version": "20.04"}'),
  ('HTTP Honeypot', 'http', 8080, '0.0.0.0', true, '{"server_header": "Apache/2.4.41", "fake_pages": ["login", "admin", "api"]}', '{"server_type": "apache", "cms": "wordpress"}'),
  ('FTP Honeypot', 'ftp', 2121, '0.0.0.0', true, '{"banner": "220 ProFTPD 1.3.6 Server ready", "allow_anonymous": false}', '{"software": "proftpd", "version": "1.3.6"}'),
  ('Telnet Honeypot', 'telnet', 2323, '0.0.0.0', false, '{"banner": "Welcome to Cisco Router", "prompt": "Router>"}', '{"device": "cisco_router", "model": "2811"});