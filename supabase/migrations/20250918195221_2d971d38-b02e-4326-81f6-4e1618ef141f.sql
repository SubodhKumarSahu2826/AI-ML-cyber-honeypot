-- Enable RLS on all tables that are missing it and add appropriate policies

-- Enable RLS on tables that are missing it
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attack_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deception_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forensic_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.honeypot_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_traffic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxy_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_intel_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_intel_iocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Add admin access policies for missing tables
CREATE POLICY "Admin access to alerts" ON public.alerts
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to attack_events" ON public.attack_events
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to audit_logs" ON public.audit_logs
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to automated_reports" ON public.automated_reports
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to deception_environments" ON public.deception_environments
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to forensic_analysis" ON public.forensic_analysis
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to honeypot_services" ON public.honeypot_services
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to ml_models" ON public.ml_models
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to ml_predictions" ON public.ml_predictions
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to network_traffic" ON public.network_traffic
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to proxy_configurations" ON public.proxy_configurations
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to session_recordings" ON public.session_recordings
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to system_configurations" ON public.system_configurations
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to threat_intel_exports" ON public.threat_intel_exports
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin access to threat_intel_iocs" ON public.threat_intel_iocs
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

-- User profiles should allow users to access their own profile
CREATE POLICY "Users can access their own profile" ON public.user_profiles
FOR ALL TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admin can access all profiles" ON public.user_profiles
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));