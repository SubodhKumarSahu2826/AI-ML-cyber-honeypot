import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface DeploymentRequest {
  honeypot_id: string;
  action: 'deploy' | 'stop' | 'restart' | 'scale';
  config?: any;
}

interface ContainerConfig {
  image: string;
  ports: number[];
  environment: Record<string, string>;
  resources: {
    cpu: string;
    memory: string;
    maxSessions: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { honeypot_id, action, config }: DeploymentRequest = await req.json();

    console.log(`Honeypot orchestrator: ${action} for honeypot ${honeypot_id}`);

    // Fetch honeypot service details
    const { data: honeypot, error: honeypotError } = await supabase
      .from('honeypot_services')
      .select('*')
      .eq('id', honeypot_id)
      .single();

    if (honeypotError) {
      throw new Error(`Failed to fetch honeypot: ${honeypotError.message}`);
    }

    switch (action) {
      case 'deploy':
        return await deployHoneypot(honeypot);
      case 'stop':
        return await stopHoneypot(honeypot);
      case 'restart':
        return await restartHoneypot(honeypot);
      case 'scale':
        return await scaleHoneypot(honeypot, config);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error: any) {
    console.error('Error in honeypot orchestrator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function deployHoneypot(honeypot: any) {
  console.log(`Deploying honeypot: ${honeypot.name}`);

  // Update status to starting
  await supabase
    .from('honeypot_services')
    .update({ deployment_status: 'starting' })
    .eq('id', honeypot.id);

  // Generate container configuration
  const containerConfig = generateContainerConfig(honeypot);
  
  // Simulate container deployment (in real implementation, this would call Docker/Kubernetes API)
  const containerId = `honeypot_${honeypot.id}_${Date.now()}`;
  
  // Create deployment record
  const { data: deployment, error: deploymentError } = await supabase
    .from('honeypot_deployments')
    .insert([{
      honeypot_service_id: honeypot.id,
      deployment_type: 'container',
      container_image: containerConfig.image,
      deployment_config: containerConfig,
      health_status: 'healthy',
      deployed_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (deploymentError) {
    console.error('Failed to create deployment record:', deploymentError);
    throw deploymentError;
  }

  // Update honeypot with container ID and running status
  await supabase
    .from('honeypot_services')
    .update({ 
      deployment_status: 'running',
      container_id: containerId,
      is_active: true
    })
    .eq('id', honeypot.id);

  // Log deployment action
  await logActivity(null, 'honeypot_deployed', 'honeypot_services', honeypot.id, {
    honeypot_name: honeypot.name,
    protocol: honeypot.protocol,
    port: honeypot.port,
    container_id: containerId
  });

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Honeypot deployed successfully',
      container_id: containerId,
      deployment_id: deployment.id
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function stopHoneypot(honeypot: any) {
  console.log(`Stopping honeypot: ${honeypot.name}`);

  // Update status to stopped
  await supabase
    .from('honeypot_services')
    .update({ 
      deployment_status: 'stopped',
      is_active: false,
      container_id: null
    })
    .eq('id', honeypot.id);

  // Update deployment record
  if (honeypot.container_id) {
    await supabase
      .from('honeypot_deployments')
      .update({ 
        terminated_at: new Date().toISOString(),
        health_status: 'unhealthy'
      })
      .eq('honeypot_service_id', honeypot.id)
      .is('terminated_at', null);
  }

  // Log stop action
  await logActivity(null, 'honeypot_stopped', 'honeypot_services', honeypot.id, {
    honeypot_name: honeypot.name,
    container_id: honeypot.container_id
  });

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Honeypot stopped successfully' 
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function restartHoneypot(honeypot: any) {
  console.log(`Restarting honeypot: ${honeypot.name}`);

  // First stop, then deploy
  await stopHoneypot(honeypot);
  
  // Wait a moment before redeploying
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return await deployHoneypot(honeypot);
}

async function scaleHoneypot(honeypot: any, config: any) {
  console.log(`Scaling honeypot: ${honeypot.name}`);

  // Update resource limits
  const newResourceLimits = {
    ...honeypot.resource_limits,
    ...config.resource_limits
  };

  await supabase
    .from('honeypot_services')
    .update({ resource_limits: newResourceLimits })
    .eq('id', honeypot.id);

  // Log scaling action
  await logActivity(null, 'honeypot_scaled', 'honeypot_services', honeypot.id, {
    honeypot_name: honeypot.name,
    old_limits: honeypot.resource_limits,
    new_limits: newResourceLimits
  });

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Honeypot scaled successfully',
      new_limits: newResourceLimits
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

function generateContainerConfig(honeypot: any): ContainerConfig {
  const baseImages: Record<string, string> = {
    ssh: 'cowrie/cowrie:latest',
    http: 'nginx:alpine',
    ftp: 'stilliard/pure-ftpd',
    telnet: 'honeytrap/honeytrap',
    rdp: 'microsoft/rdesktop',
    iot: 'conpot/conpot'
  };

  const image = baseImages[honeypot.protocol] || 'alpine:latest';
  
  return {
    image,
    ports: [honeypot.port],
    environment: {
      HONEYPOT_NAME: honeypot.name,
      HONEYPOT_PROTOCOL: honeypot.protocol,
      HONEYPOT_PORT: honeypot.port.toString(),
      INTERACTION_LEVEL: honeypot.interaction_level,
      ...honeypot.configuration
    },
    resources: {
      cpu: honeypot.resource_limits?.cpu_limit || '1',
      memory: honeypot.resource_limits?.memory_limit || '512Mi',
      maxSessions: honeypot.resource_limits?.max_sessions || 10
    }
  };
}

async function logActivity(userId: string | null, action: string, resourceType: string, resourceId: string, details: any) {
  try {
    await supabase
      .from('user_activity_logs')
      .insert([{
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: '127.0.0.1', // In real implementation, get from request
        user_agent: 'Honeypot Orchestrator'
      }]);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}