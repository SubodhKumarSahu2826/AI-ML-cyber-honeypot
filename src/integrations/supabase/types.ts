export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["attack_severity"]
          source: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["attack_severity"]
          source?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["attack_severity"]
          source?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attack_events: {
        Row: {
          classification:
            | Database["public"]["Enums"]["attack_classification"]
            | null
          confidence: number | null
          created_at: string
          destination_ip: unknown | null
          destination_port: number | null
          headers: Json | null
          honeypot_service_id: string | null
          id: string
          metadata: Json | null
          payload: string | null
          protocol: Database["public"]["Enums"]["protocol_type"]
          severity: Database["public"]["Enums"]["attack_severity"]
          source_ip: unknown
          source_port: number | null
        }
        Insert: {
          classification?:
            | Database["public"]["Enums"]["attack_classification"]
            | null
          confidence?: number | null
          created_at?: string
          destination_ip?: unknown | null
          destination_port?: number | null
          headers?: Json | null
          honeypot_service_id?: string | null
          id?: string
          metadata?: Json | null
          payload?: string | null
          protocol: Database["public"]["Enums"]["protocol_type"]
          severity?: Database["public"]["Enums"]["attack_severity"]
          source_ip: unknown
          source_port?: number | null
        }
        Update: {
          classification?:
            | Database["public"]["Enums"]["attack_classification"]
            | null
          confidence?: number | null
          created_at?: string
          destination_ip?: unknown | null
          destination_port?: number | null
          headers?: Json | null
          honeypot_service_id?: string | null
          id?: string
          metadata?: Json | null
          payload?: string | null
          protocol?: Database["public"]["Enums"]["protocol_type"]
          severity?: Database["public"]["Enums"]["attack_severity"]
          source_ip?: unknown
          source_port?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attack_events_honeypot_service_id_fkey"
            columns: ["honeypot_service_id"]
            isOneToOne: false
            referencedRelation: "honeypot_services"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automated_reports: {
        Row: {
          created_at: string
          date_range: unknown
          file_path: string | null
          generated_at: string | null
          id: string
          metrics: Json
          recipients: string[] | null
          report_type: string | null
          title: string
          visualizations: Json | null
        }
        Insert: {
          created_at?: string
          date_range: unknown
          file_path?: string | null
          generated_at?: string | null
          id?: string
          metrics?: Json
          recipients?: string[] | null
          report_type?: string | null
          title: string
          visualizations?: Json | null
        }
        Update: {
          created_at?: string
          date_range?: unknown
          file_path?: string | null
          generated_at?: string | null
          id?: string
          metrics?: Json
          recipients?: string[] | null
          report_type?: string | null
          title?: string
          visualizations?: Json | null
        }
        Relationships: []
      }
      deception_environments: {
        Row: {
          command_responses: Json | null
          container_config: Json
          created_at: string
          environment_type: string
          fake_filesystem: Json | null
          id: string
          is_active: boolean
          last_rotated_at: string | null
          name: string
          personality_config: Json
          protocol_type: Database["public"]["Enums"]["protocol_type"]
          rotation_interval_hours: number | null
          updated_at: string
        }
        Insert: {
          command_responses?: Json | null
          container_config?: Json
          created_at?: string
          environment_type: string
          fake_filesystem?: Json | null
          id?: string
          is_active?: boolean
          last_rotated_at?: string | null
          name: string
          personality_config?: Json
          protocol_type: Database["public"]["Enums"]["protocol_type"]
          rotation_interval_hours?: number | null
          updated_at?: string
        }
        Update: {
          command_responses?: Json | null
          container_config?: Json
          created_at?: string
          environment_type?: string
          fake_filesystem?: Json | null
          id?: string
          is_active?: boolean
          last_rotated_at?: string | null
          name?: string
          personality_config?: Json
          protocol_type?: Database["public"]["Enums"]["protocol_type"]
          rotation_interval_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      decoy_websites: {
        Row: {
          category: string
          created_at: string
          honeypot_type: string | null
          id: string
          interaction_logging: boolean | null
          is_active: boolean | null
          name: string
          response_templates: Json | null
          updated_at: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          honeypot_type?: string | null
          id?: string
          interaction_logging?: boolean | null
          is_active?: boolean | null
          name: string
          response_templates?: Json | null
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          honeypot_type?: string | null
          id?: string
          interaction_logging?: boolean | null
          is_active?: boolean | null
          name?: string
          response_templates?: Json | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      forensic_analysis: {
        Row: {
          analysis_type: string | null
          analyst_id: string | null
          created_at: string
          findings: Json
          id: string
          iocs_extracted: Json | null
          notes: string | null
          session_id: string
          severity_assessment:
            | Database["public"]["Enums"]["attack_severity"]
            | null
          status: string | null
          threat_classification: string | null
          updated_at: string
        }
        Insert: {
          analysis_type?: string | null
          analyst_id?: string | null
          created_at?: string
          findings?: Json
          id?: string
          iocs_extracted?: Json | null
          notes?: string | null
          session_id: string
          severity_assessment?:
            | Database["public"]["Enums"]["attack_severity"]
            | null
          status?: string | null
          threat_classification?: string | null
          updated_at?: string
        }
        Update: {
          analysis_type?: string | null
          analyst_id?: string | null
          created_at?: string
          findings?: Json
          id?: string
          iocs_extracted?: Json | null
          notes?: string | null
          session_id?: string
          severity_assessment?:
            | Database["public"]["Enums"]["attack_severity"]
            | null
          status?: string | null
          threat_classification?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forensic_analysis_analyst_id_fkey"
            columns: ["analyst_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forensic_analysis_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      honeypot_deployments: {
        Row: {
          container_image: string | null
          created_at: string | null
          deployed_at: string | null
          deployment_config: Json | null
          deployment_type: string | null
          health_status: string | null
          honeypot_service_id: string | null
          id: string
          last_health_check: string | null
          resource_usage: Json | null
          terminated_at: string | null
          updated_at: string | null
        }
        Insert: {
          container_image?: string | null
          created_at?: string | null
          deployed_at?: string | null
          deployment_config?: Json | null
          deployment_type?: string | null
          health_status?: string | null
          honeypot_service_id?: string | null
          id?: string
          last_health_check?: string | null
          resource_usage?: Json | null
          terminated_at?: string | null
          updated_at?: string | null
        }
        Update: {
          container_image?: string | null
          created_at?: string | null
          deployed_at?: string | null
          deployment_config?: Json | null
          deployment_type?: string | null
          health_status?: string | null
          honeypot_service_id?: string | null
          id?: string
          last_health_check?: string | null
          resource_usage?: Json | null
          terminated_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "honeypot_deployments_honeypot_service_id_fkey"
            columns: ["honeypot_service_id"]
            isOneToOne: false
            referencedRelation: "honeypot_services"
            referencedColumns: ["id"]
          },
        ]
      }
      honeypot_services: {
        Row: {
          adaptive_response_config: Json | null
          bind_ip: unknown | null
          configuration: Json | null
          container_id: string | null
          created_at: string
          deployment_status: string | null
          description: string | null
          emulation_settings: Json | null
          id: string
          interaction_level: string | null
          is_active: boolean
          name: string
          network_interface: string | null
          port: number
          protocol: Database["public"]["Enums"]["protocol_type"]
          resource_limits: Json | null
          updated_at: string
        }
        Insert: {
          adaptive_response_config?: Json | null
          bind_ip?: unknown | null
          configuration?: Json | null
          container_id?: string | null
          created_at?: string
          deployment_status?: string | null
          description?: string | null
          emulation_settings?: Json | null
          id?: string
          interaction_level?: string | null
          is_active?: boolean
          name: string
          network_interface?: string | null
          port: number
          protocol: Database["public"]["Enums"]["protocol_type"]
          resource_limits?: Json | null
          updated_at?: string
        }
        Update: {
          adaptive_response_config?: Json | null
          bind_ip?: unknown | null
          configuration?: Json | null
          container_id?: string | null
          created_at?: string
          deployment_status?: string | null
          description?: string | null
          emulation_settings?: Json | null
          id?: string
          interaction_level?: string | null
          is_active?: boolean
          name?: string
          network_interface?: string | null
          port?: number
          protocol?: Database["public"]["Enums"]["protocol_type"]
          resource_limits?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      honeypot_templates: {
        Row: {
          created_at: string | null
          default_config: Json | null
          default_port: number
          description: string | null
          emulation_defaults: Json | null
          id: string
          name: string
          protocol: Database["public"]["Enums"]["protocol_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_config?: Json | null
          default_port: number
          description?: string | null
          emulation_defaults?: Json | null
          id?: string
          name: string
          protocol: Database["public"]["Enums"]["protocol_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_config?: Json | null
          default_port?: number
          description?: string | null
          emulation_defaults?: Json | null
          id?: string
          name?: string
          protocol?: Database["public"]["Enums"]["protocol_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      ml_models: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          is_active: boolean
          metrics: Json | null
          model_type: string
          name: string
          updated_at: string
          version: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean
          metrics?: Json | null
          model_type: string
          name: string
          updated_at?: string
          version: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean
          metrics?: Json | null
          model_type?: string
          name?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      ml_predictions: {
        Row: {
          confidence_score: number | null
          created_at: string
          features: Json
          id: string
          model_name: string
          model_version: string
          prediction: Json
          prediction_type: string | null
          processing_time_ms: number | null
          session_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          features: Json
          id?: string
          model_name: string
          model_version: string
          prediction: Json
          prediction_type?: string | null
          processing_time_ms?: number | null
          session_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          features?: Json
          id?: string
          model_name?: string
          model_version?: string
          prediction?: Json
          prediction_type?: string | null
          processing_time_ms?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_predictions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      network_traffic: {
        Row: {
          created_at: string
          destination_ip: unknown | null
          destination_port: number | null
          direction: string | null
          headers: Json | null
          id: string
          ml_classification: Json | null
          payload_size: number | null
          protocol: string
          risk_score: number | null
          session_id: string | null
          source_ip: unknown
          source_port: number | null
        }
        Insert: {
          created_at?: string
          destination_ip?: unknown | null
          destination_port?: number | null
          direction?: string | null
          headers?: Json | null
          id?: string
          ml_classification?: Json | null
          payload_size?: number | null
          protocol: string
          risk_score?: number | null
          session_id?: string | null
          source_ip: unknown
          source_port?: number | null
        }
        Update: {
          created_at?: string
          destination_ip?: unknown | null
          destination_port?: number | null
          direction?: string | null
          headers?: Json | null
          id?: string
          ml_classification?: Json | null
          payload_size?: number | null
          protocol?: string
          risk_score?: number | null
          session_id?: string | null
          source_ip?: unknown
          source_port?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "network_traffic_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      proxy_configurations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          ml_model_config: Json
          name: string
          risk_thresholds: Json
          routing_rules: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          ml_model_config?: Json
          name: string
          risk_thresholds?: Json
          routing_rules?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          ml_model_config?: Json
          name?: string
          risk_thresholds?: Json
          routing_rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      real_time_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string
          time_window: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string
          time_window?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string
          time_window?: string | null
        }
        Relationships: []
      }
      routing_rules: {
        Row: {
          action: string
          conditions: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          rule_name: string
          rule_type: string | null
          target_url: string | null
          updated_at: string
        }
        Insert: {
          action: string
          conditions: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name: string
          rule_type?: string | null
          target_url?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          conditions?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name?: string
          rule_type?: string | null
          target_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      session_recordings: {
        Row: {
          attack_event_id: string | null
          classification:
            | Database["public"]["Enums"]["attack_classification"]
            | null
          commands: Json | null
          confidence: number | null
          created_at: string
          duration_seconds: number | null
          end_time: string | null
          id: string
          protocol: Database["public"]["Enums"]["protocol_type"]
          raw_data: string | null
          responses: Json | null
          source_ip: unknown
          start_time: string
        }
        Insert: {
          attack_event_id?: string | null
          classification?:
            | Database["public"]["Enums"]["attack_classification"]
            | null
          commands?: Json | null
          confidence?: number | null
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          protocol: Database["public"]["Enums"]["protocol_type"]
          raw_data?: string | null
          responses?: Json | null
          source_ip: unknown
          start_time?: string
        }
        Update: {
          attack_event_id?: string | null
          classification?:
            | Database["public"]["Enums"]["attack_classification"]
            | null
          commands?: Json | null
          confidence?: number | null
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          protocol?: Database["public"]["Enums"]["protocol_type"]
          raw_data?: string | null
          responses?: Json | null
          source_ip?: unknown
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_recordings_attack_event_id_fkey"
            columns: ["attack_event_id"]
            isOneToOne: false
            referencedRelation: "attack_events"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configurations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_configurations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_intel_exports: {
        Row: {
          created_at: string
          data_payload: Json
          error_message: string | null
          export_status: string | null
          export_type: string | null
          exported_at: string | null
          id: string
          ioc_count: number | null
          platform_name: string
          session_ids: string[] | null
        }
        Insert: {
          created_at?: string
          data_payload: Json
          error_message?: string | null
          export_status?: string | null
          export_type?: string | null
          exported_at?: string | null
          id?: string
          ioc_count?: number | null
          platform_name: string
          session_ids?: string[] | null
        }
        Update: {
          created_at?: string
          data_payload?: Json
          error_message?: string | null
          export_status?: string | null
          export_type?: string | null
          exported_at?: string | null
          id?: string
          ioc_count?: number | null
          platform_name?: string
          session_ids?: string[] | null
        }
        Relationships: []
      }
      threat_intel_iocs: {
        Row: {
          campaign: string | null
          confidence: number | null
          created_at: string
          first_seen: string
          id: string
          indicator_type: string
          indicator_value: string
          last_seen: string
          metadata: Json | null
          source: string | null
          tags: string[] | null
          threat_actor: string | null
        }
        Insert: {
          campaign?: string | null
          confidence?: number | null
          created_at?: string
          first_seen?: string
          id?: string
          indicator_type: string
          indicator_value: string
          last_seen?: string
          metadata?: Json | null
          source?: string | null
          tags?: string[] | null
          threat_actor?: string | null
        }
        Update: {
          campaign?: string | null
          confidence?: number | null
          created_at?: string
          first_seen?: string
          id?: string
          indicator_type?: string
          indicator_value?: string
          last_seen?: string
          metadata?: Json | null
          source?: string | null
          tags?: string[] | null
          threat_actor?: string | null
        }
        Relationships: []
      }
      traffic_routing: {
        Row: {
          confidence_score: number | null
          created_at: string
          destination_url: string
          geo_location: Json | null
          id: string
          ml_prediction_id: string | null
          processed_at: string | null
          processing_time_ms: number | null
          redirect_url: string | null
          request_headers: Json | null
          routing_decision: string
          source_ip: unknown
          user_agent: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          destination_url: string
          geo_location?: Json | null
          id?: string
          ml_prediction_id?: string | null
          processed_at?: string | null
          processing_time_ms?: number | null
          redirect_url?: string | null
          request_headers?: Json | null
          routing_decision: string
          source_ip: unknown
          user_agent?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          destination_url?: string
          geo_location?: Json | null
          id?: string
          ml_prediction_id?: string | null
          processed_at?: string | null
          processing_time_ms?: number | null
          redirect_url?: string | null
          request_headers?: Json | null
          routing_decision?: string
          source_ip?: unknown
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traffic_routing_ml_prediction_id_fkey"
            columns: ["ml_prediction_id"]
            isOneToOne: false
            referencedRelation: "ml_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_behavior_analysis: {
        Row: {
          analysis_timestamp: string
          behavior_patterns: Json
          behavioral_score: number | null
          classification: string | null
          features_extracted: Json | null
          id: string
          risk_indicators: Json | null
          session_id: string | null
          source_ip: unknown
        }
        Insert: {
          analysis_timestamp?: string
          behavior_patterns: Json
          behavioral_score?: number | null
          classification?: string | null
          features_extracted?: Json | null
          id?: string
          risk_indicators?: Json | null
          session_id?: string | null
          source_ip: unknown
        }
        Update: {
          analysis_timestamp?: string
          behavior_patterns?: Json
          behavioral_score?: number | null
          classification?: string | null
          features_extracted?: Json | null
          id?: string
          risk_indicators?: Json | null
          session_id?: string | null
          source_ip?: unknown
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invitation_token: string
          invited_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invitation_token: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["user_role"]
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          preferences: Json | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          location: Json | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          location?: Json | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          location?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      attack_classification:
        | "reconnaissance"
        | "exploitation"
        | "persistence"
        | "privilege_escalation"
        | "defense_evasion"
        | "credential_access"
        | "discovery"
        | "lateral_movement"
        | "collection"
        | "exfiltration"
        | "command_control"
        | "impact"
      attack_severity: "low" | "medium" | "high" | "critical"
      protocol_type:
        | "ssh"
        | "http"
        | "https"
        | "ftp"
        | "telnet"
        | "rdp"
        | "snmp"
        | "iot"
        | "smtp"
        | "pop3"
        | "imap"
      user_role: "admin" | "analyst" | "researcher" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attack_classification: [
        "reconnaissance",
        "exploitation",
        "persistence",
        "privilege_escalation",
        "defense_evasion",
        "credential_access",
        "discovery",
        "lateral_movement",
        "collection",
        "exfiltration",
        "command_control",
        "impact",
      ],
      attack_severity: ["low", "medium", "high", "critical"],
      protocol_type: [
        "ssh",
        "http",
        "https",
        "ftp",
        "telnet",
        "rdp",
        "snmp",
        "iot",
        "smtp",
        "pop3",
        "imap",
      ],
      user_role: ["admin", "analyst", "researcher", "user"],
    },
  },
} as const
