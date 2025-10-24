-- Enhance honeypot_services table with comprehensive configuration
ALTER TABLE public.honeypot_services ADD COLUMN IF NOT EXISTS interaction_level TEXT DEFAULT 'medium' CHECK (interaction_level IN ('low', 'medium', 'high'));
ALTER TABLE public.honeypot_services ADD COLUMN IF NOT EXISTS emulation_settings JSONB DEFAULT '{}';
ALTER TABLE public.honeypot_services ADD COLUMN IF NOT EXISTS adaptive_response_config JSONB DEFAULT '{}';
ALTER TABLE public.honeypot_services ADD COLUMN IF NOT EXISTS resource_limits JSONB DEFAULT '{"cpu_limit": "1", "memory_limit": "512Mi", "max_sessions": 10}';
ALTER TABLE public.honeypot_services ADD COLUMN IF NOT EXISTS deployment_status TEXT DEFAULT 'stopped' CHECK (deployment_status IN ('stopped', 'starting', 'running', 'paused', 'error'));
ALTER TABLE public.honeypot_services ADD COLUMN IF NOT EXISTS container_id TEXT;
ALTER TABLE public.honeypot_services ADD COLUMN IF NOT EXISTS bind_ip INET DEFAULT '0.0.0.0';
ALTER TABLE public.honeypot_services ADD COLUMN IF NOT EXISTS network_interface TEXT DEFAULT 'eth0';

-- Create honeypot_templates table for protocol templates
CREATE TABLE IF NOT EXISTS public.honeypot_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  protocol protocol_type NOT NULL,
  default_port INTEGER NOT NULL,
  description TEXT,
  default_config JSONB DEFAULT '{}',
  emulation_defaults JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on honeypot_templates
ALTER TABLE public.honeypot_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for honeypot_templates (admin access only)
CREATE POLICY "Admin access to honeypot_templates" ON public.honeypot_templates
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create honeypot_deployments table for tracking deployments
CREATE TABLE IF NOT EXISTS public.honeypot_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  honeypot_service_id UUID REFERENCES public.honeypot_services(id) ON DELETE CASCADE,
  deployment_type TEXT DEFAULT 'container' CHECK (deployment_type IN ('container', 'vm', 'process')),
  container_image TEXT,
  deployment_config JSONB DEFAULT '{}',
  resource_usage JSONB DEFAULT '{}',
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy')),
  last_health_check TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deployed_at TIMESTAMP WITH TIME ZONE,
  terminated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on honeypot_deployments
ALTER TABLE public.honeypot_deployments ENABLE ROW LEVEL SECURITY;

-- Create policy for honeypot_deployments (admin access only)
CREATE POLICY "Admin access to honeypot_deployments" ON public.honeypot_deployments
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

-- Enhanced user management tables

-- Create user_sessions table for session monitoring
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location JSONB DEFAULT '{}',
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all sessions" ON public.user_sessions
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role user_role NOT NULL,
  invited_by UUID,
  invitation_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policy for user_invitations (admin access only)
CREATE POLICY "Admin access to user_invitations" ON public.user_invitations
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create user_activity_logs table for audit trails
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_activity_logs
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_activity_logs
CREATE POLICY "Users can view their own activity" ON public.user_activity_logs
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all activity" ON public.user_activity_logs
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

-- Insert default honeypot templates (using correct lowercase enum values)
INSERT INTO public.honeypot_templates (name, protocol, default_port, description, default_config, emulation_defaults) VALUES
('SSH Server', 'ssh', 22, 'Secure Shell protocol honeypot', 
 '{"banner": "SSH-2.0-OpenSSH_8.0", "host_key_algorithms": ["rsa-sha2-512", "rsa-sha2-256"]}',
 '{"fake_users": ["root", "admin", "user"], "fake_commands": {"ls": "/bin/ls", "pwd": "/usr/bin/pwd"}, "filesystem": {"home": ["root", "admin"], "etc": ["passwd", "shadow"]}}'),
('HTTP Server', 'http', 80, 'Web server honeypot', 
 '{"server_header": "Apache/2.4.41", "default_pages": ["/", "/login", "/admin"]}',
 '{"fake_directories": ["/admin", "/wp-admin", "/login"], "error_pages": {"404": "Not Found", "403": "Forbidden"}}'),
('FTP Server', 'ftp', 21, 'File Transfer Protocol honeypot', 
 '{"welcome_banner": "220 FTP Server ready", "anonymous_login": true}',
 '{"fake_files": ["readme.txt", "config.ini"], "fake_directories": ["uploads", "downloads"]}'),
('Telnet Server', 'telnet', 23, 'Telnet protocol honeypot', 
 '{"login_prompt": "Login: ", "password_prompt": "Password: "}',
 '{"fake_system": "Linux", "fake_users": ["admin", "guest"], "fake_commands": {"help": "Available commands: ls, pwd, exit"}}'),
('RDP Server', 'rdp', 3389, 'Remote Desktop Protocol honeypot', 
 '{"rdp_version": "10.0", "encryption_level": "high"}',
 '{"fake_domain": "WORKGROUP", "fake_computer_name": "WIN-SERVER01"}'),
('IoT Device', 'iot', 8080, 'IoT device simulation', 
 '{"device_type": "camera", "manufacturer": "Generic", "model": "IP-CAM-001"}',
 '{"fake_interface": "web", "fake_credentials": {"admin": "123456"}, "fake_endpoints": ["/", "/config", "/stream"]}}');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_honeypot_deployments_service_id ON public.honeypot_deployments(honeypot_service_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active, last_activity);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);

-- Create triggers for updated_at columns
CREATE OR REPLACE TRIGGER update_honeypot_templates_updated_at
BEFORE UPDATE ON public.honeypot_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_honeypot_deployments_updated_at
BEFORE UPDATE ON public.honeypot_deployments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_honeypot_services_updated_at
BEFORE UPDATE ON public.honeypot_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();