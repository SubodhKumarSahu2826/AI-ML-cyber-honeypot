-- Create all enums first
CREATE TYPE public.user_role AS ENUM ('admin', 'analyst', 'researcher', 'user');
CREATE TYPE public.protocol_type AS ENUM ('ssh', 'http', 'https', 'ftp', 'telnet', 'rdp', 'snmp', 'iot', 'smtp', 'pop3', 'imap');
CREATE TYPE public.attack_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.attack_classification AS ENUM ('reconnaissance', 'exploitation', 'persistence', 'privilege_escalation', 'defense_evasion', 'credential_access', 'discovery', 'lateral_movement', 'collection', 'exfiltration', 'command_control', 'impact');

-- Create update function (doesn't reference any tables)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create user profiles table first
CREATE TABLE public.user_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table (after user_profiles)
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role user_role NOT NULL,
    assigned_by UUID REFERENCES public.user_profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Now create the has_role function (after user_roles table exists)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create honeypot services table
CREATE TABLE public.honeypot_services (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    protocol protocol_type NOT NULL,
    port INTEGER NOT NULL,
    description TEXT,
    configuration JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attack events table
CREATE TABLE public.attack_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    source_ip INET NOT NULL,
    source_port INTEGER,
    destination_ip INET,
    destination_port INTEGER,
    protocol protocol_type NOT NULL,
    severity attack_severity NOT NULL DEFAULT 'medium',
    classification attack_classification,
    confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
    payload TEXT,
    headers JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    honeypot_service_id UUID REFERENCES public.honeypot_services(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session recordings table
CREATE TABLE public.session_recordings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    attack_event_id UUID REFERENCES public.attack_events(id),
    source_ip INET NOT NULL,
    protocol protocol_type NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    commands JSONB DEFAULT '[]',
    responses JSONB DEFAULT '[]',
    raw_data TEXT,
    classification attack_classification,
    confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ML models table
CREATE TABLE public.ml_models (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    model_type TEXT NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    file_path TEXT,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(name, version)
);

-- Create threat intelligence IOCs table
CREATE TABLE public.threat_intel_iocs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    indicator_type TEXT NOT NULL,
    indicator_value TEXT NOT NULL,
    threat_actor TEXT,
    campaign TEXT,
    confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
    first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    tags TEXT[] DEFAULT '{}',
    source TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system configurations table
CREATE TABLE public.system_configurations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity attack_severity NOT NULL DEFAULT 'medium',
    alert_type TEXT NOT NULL,
    source TEXT,
    metadata JSONB DEFAULT '{}',
    acknowledged_by UUID REFERENCES public.user_profiles(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES public.user_profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Proxy gateway specific tables
CREATE TABLE public.proxy_configurations (
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

CREATE TABLE public.network_traffic (
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

CREATE TABLE public.deception_environments (
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

CREATE TABLE public.ml_predictions (
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

CREATE TABLE public.forensic_analysis (
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

CREATE TABLE public.threat_intel_exports (
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

CREATE TABLE public.automated_reports (
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