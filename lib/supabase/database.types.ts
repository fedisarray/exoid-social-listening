export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      analyses: {
        Row: {
          created_at: string;
          created_by: string | null;
          current_version: number;
          id: string;
          name: string;
          organization_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          current_version?: number;
          id?: string;
          name: string;
          organization_id?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          current_version?: number;
          id?: string;
          name?: string;
          organization_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analyses_organization_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      analysis_versions: {
        Row: {
          analysis_id: string;
          config: NonNullable<Json>;
          created_at: string;
          id: string;
          organization_id: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          analysis_id: string;
          config: NonNullable<Json>;
          created_at?: string;
          id?: string;
          organization_id: string;
          version: number;
        };
        Update: {
          analysis_id?: string;
          config?: NonNullable<Json>;
          created_at?: string;
          id?: string;
          organization_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_versions_analysis_id_fkey";
            columns: ["analysis_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "analysis_versions_organization_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      comparison_ai_annotations: {
        Row: {
          created_at: string;
          id: string;
          import_id: string;
          model_version: string;
          organization_id: string;
          review_id: string;
          sentiment: string;
          themes: string[];
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          import_id: string;
          model_version: string;
          organization_id: string;
          review_id: string;
          sentiment: string;
          themes?: string[];
        };
        Update: {
          created_at?: string;
          id?: string;
          import_id?: string;
          model_version?: string;
          organization_id?: string;
          review_id?: string;
          sentiment?: string;
          themes?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "comparison_ai_annotations_import_id_organization_id_fkey";
            columns: ["import_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "comparison_ai_imports";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "comparison_ai_annotations_review_id_import_id_organization_fkey";
            columns: ["review_id", "import_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "comparison_ai_reviews";
            referencedColumns: ["id", "import_id", "organization_id"];
          },
        ];
      };
      comparison_ai_imports: {
        Row: {
          aggregate_content: Json | null;
          analysis_id: string;
          analysis_version: number;
          created_at: string;
          created_by: string | null;
          file_name: string;
          id: string;
          import_kind: string;
          organization_id: string;
          row_count: number;
          source_snapshot_ids: string[];
        };
        ComputedFields: never;
        Insert: {
          aggregate_content?: Json | null;
          analysis_id: string;
          analysis_version: number;
          created_at?: string;
          created_by?: string | null;
          file_name: string;
          id?: string;
          import_kind: string;
          organization_id?: string;
          row_count?: number;
          source_snapshot_ids?: string[];
        };
        Update: {
          aggregate_content?: Json | null;
          analysis_id?: string;
          analysis_version?: number;
          created_at?: string;
          created_by?: string | null;
          file_name?: string;
          id?: string;
          import_kind?: string;
          organization_id?: string;
          row_count?: number;
          source_snapshot_ids?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "comparison_ai_imports_analysis_id_analysis_version_organiz_fkey";
            columns: ["analysis_id", "analysis_version", "organization_id"];
            isOneToOne: false;
            referencedRelation: "analysis_versions";
            referencedColumns: ["analysis_id", "version", "organization_id"];
          },
        ];
      };
      comparison_ai_jobs: {
        Row: {
          analysis_id: string;
          created_at: string;
          error_code: string | null;
          finished_at: string | null;
          id: string;
          import_id: string;
          lease_token: string | null;
          lease_until: string | null;
          message_id: string;
          next_attempt_at: string;
          organization_id: string;
          period_end: string;
          period_start: string;
          processed_count: number;
          status: string;
          total_count: number;
          visualization_type: string;
        };
        ComputedFields: never;
        Insert: {
          analysis_id: string;
          created_at?: string;
          error_code?: string | null;
          finished_at?: string | null;
          id?: string;
          import_id: string;
          lease_token?: string | null;
          lease_until?: string | null;
          message_id: string;
          next_attempt_at?: string;
          organization_id: string;
          period_end: string;
          period_start: string;
          processed_count?: number;
          status?: string;
          total_count?: number;
          visualization_type: string;
        };
        Update: {
          analysis_id?: string;
          created_at?: string;
          error_code?: string | null;
          finished_at?: string | null;
          id?: string;
          import_id?: string;
          lease_token?: string | null;
          lease_until?: string | null;
          message_id?: string;
          next_attempt_at?: string;
          organization_id?: string;
          period_end?: string;
          period_start?: string;
          processed_count?: number;
          status?: string;
          total_count?: number;
          visualization_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comparison_ai_jobs_analysis_id_organization_id_fkey";
            columns: ["analysis_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "comparison_ai_jobs_import_id_organization_id_fkey";
            columns: ["import_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "comparison_ai_imports";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "comparison_ai_jobs_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "comparison_ai_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      comparison_ai_messages: {
        Row: {
          analysis_id: string;
          citations: NonNullable<Json>;
          content: string;
          created_at: string;
          id: string;
          import_id: string;
          locale: string;
          organization_id: string;
          period_end: string;
          period_start: string;
          role: string;
          visualization: Json | null;
        };
        ComputedFields: never;
        Insert: {
          analysis_id: string;
          citations?: NonNullable<Json>;
          content: string;
          created_at?: string;
          id?: string;
          import_id: string;
          locale?: string;
          organization_id: string;
          period_end: string;
          period_start: string;
          role: string;
          visualization?: Json | null;
        };
        Update: {
          analysis_id?: string;
          citations?: NonNullable<Json>;
          content?: string;
          created_at?: string;
          id?: string;
          import_id?: string;
          locale?: string;
          organization_id?: string;
          period_end?: string;
          period_start?: string;
          role?: string;
          visualization?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "comparison_ai_messages_analysis_id_organization_id_fkey";
            columns: ["analysis_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "comparison_ai_messages_import_id_organization_id_fkey";
            columns: ["import_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "comparison_ai_imports";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      comparison_ai_reviews: {
        Row: {
          id: string;
          import_id: string;
          language: string | null;
          listing_id: string | null;
          listing_label: string | null;
          organization_id: string;
          published_at: string | null;
          rating: number | null;
          review_text: string;
          row_number: number;
          sheet_name: string;
          source_url: string | null;
        };
        ComputedFields: never;
        Insert: {
          id?: string;
          import_id: string;
          language?: string | null;
          listing_id?: string | null;
          listing_label?: string | null;
          organization_id: string;
          published_at?: string | null;
          rating?: number | null;
          review_text: string;
          row_number: number;
          sheet_name: string;
          source_url?: string | null;
        };
        Update: {
          id?: string;
          import_id?: string;
          language?: string | null;
          listing_id?: string | null;
          listing_label?: string | null;
          organization_id?: string;
          published_at?: string | null;
          rating?: number | null;
          review_text?: string;
          row_number?: number;
          sheet_name?: string;
          source_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comparison_ai_reviews_import_id_organization_id_fkey";
            columns: ["import_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "comparison_ai_imports";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      comparison_reports: {
        Row: {
          analysis_id: string;
          analysis_version: number;
          attempts: number;
          created_at: string;
          created_by: string | null;
          error_code: string | null;
          finished_at: string | null;
          frozen_data: NonNullable<Json>;
          id: string;
          lease_token: string | null;
          lease_until: string | null;
          locale: string;
          metric_definition_version: number;
          native_charts: boolean;
          next_attempt_at: string;
          organization_id: string;
          period: NonNullable<Json>;
          provider_export_url: string | null;
          provider_generation_id: string | null;
          snapshot_id: string;
          status: string;
          storage_path: string | null;
          template_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          analysis_id: string;
          analysis_version: number;
          attempts?: number;
          created_at?: string;
          created_by?: string | null;
          error_code?: string | null;
          finished_at?: string | null;
          frozen_data: NonNullable<Json>;
          id?: string;
          lease_token?: string | null;
          lease_until?: string | null;
          locale: string;
          metric_definition_version?: number;
          native_charts?: boolean;
          next_attempt_at?: string;
          organization_id: string;
          period: NonNullable<Json>;
          provider_export_url?: string | null;
          provider_generation_id?: string | null;
          snapshot_id: string;
          status?: string;
          storage_path?: string | null;
          template_id: string;
          updated_at?: string;
        };
        Update: {
          analysis_id?: string;
          analysis_version?: number;
          attempts?: number;
          created_at?: string;
          created_by?: string | null;
          error_code?: string | null;
          finished_at?: string | null;
          frozen_data?: NonNullable<Json>;
          id?: string;
          lease_token?: string | null;
          lease_until?: string | null;
          locale?: string;
          metric_definition_version?: number;
          native_charts?: boolean;
          next_attempt_at?: string;
          organization_id?: string;
          period?: NonNullable<Json>;
          provider_export_url?: string | null;
          provider_generation_id?: string | null;
          snapshot_id?: string;
          status?: string;
          storage_path?: string | null;
          template_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comparison_reports_analysis_id_analysis_version_organizati_fkey";
            columns: ["analysis_id", "analysis_version", "organization_id"];
            isOneToOne: false;
            referencedRelation: "analysis_versions";
            referencedColumns: ["analysis_id", "version", "organization_id"];
          },
          {
            foreignKeyName: "comparison_reports_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comparison_reports_snapshot_id_analysis_id_analysis_versio_fkey";
            columns: [
              "snapshot_id",
              "analysis_id",
              "analysis_version",
              "organization_id",
            ];
            isOneToOne: false;
            referencedRelation: "review_snapshots";
            referencedColumns: [
              "id",
              "analysis_id",
              "analysis_version",
              "organization_id",
            ];
          },
        ];
      };
      discovery_runs: {
        Row: {
          created_at: string;
          created_by: string | null;
          error: string | null;
          id: string;
          input: NonNullable<Json>;
          organization_id: string;
          provider_run_id: string | null;
          results: NonNullable<Json>;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          error?: string | null;
          id?: string;
          input: NonNullable<Json>;
          organization_id?: string;
          provider_run_id?: string | null;
          results?: NonNullable<Json>;
          status: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          error?: string | null;
          id?: string;
          input?: NonNullable<Json>;
          organization_id?: string;
          provider_run_id?: string | null;
          results?: NonNullable<Json>;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discovery_runs_organization_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_memberships: {
        Row: {
          created_at: string;
          organization_id: string;
          role: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          organization_id: string;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          organization_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          report_template_id: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          report_template_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          report_template_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          id: string;
          listing: NonNullable<Json>;
          organization_id: string;
          source_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          listing: NonNullable<Json>;
          organization_id?: string;
          source_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          listing?: NonNullable<Json>;
          organization_id?: string;
          source_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_organization_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      review_collection_runs: {
        Row: {
          analysis_id: string | null;
          analysis_version: number;
          config: NonNullable<Json>;
          created_at: string;
          created_by: string | null;
          finished_at: string | null;
          id: string;
          lease_token: string | null;
          lease_until: string | null;
          max_reviews: number;
          next_attempt_at: string;
          organization_id: string;
          property_id: string | null;
          requested_end: string;
          requested_start: string;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          analysis_id?: string | null;
          analysis_version: number;
          config: NonNullable<Json>;
          created_at?: string;
          created_by?: string | null;
          finished_at?: string | null;
          id?: string;
          lease_token?: string | null;
          lease_until?: string | null;
          max_reviews: number;
          next_attempt_at?: string;
          organization_id: string;
          property_id?: string | null;
          requested_end: string;
          requested_start: string;
          status?: string;
        };
        Update: {
          analysis_id?: string | null;
          analysis_version?: number;
          config?: NonNullable<Json>;
          created_at?: string;
          created_by?: string | null;
          finished_at?: string | null;
          id?: string;
          lease_token?: string | null;
          lease_until?: string | null;
          max_reviews?: number;
          next_attempt_at?: string;
          organization_id?: string;
          property_id?: string | null;
          requested_end?: string;
          requested_start?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_collection_runs_analysis_id_analysis_version_fkey";
            columns: ["analysis_id", "analysis_version", "organization_id"];
            isOneToOne: false;
            referencedRelation: "analysis_versions";
            referencedColumns: ["analysis_id", "version", "organization_id"];
          },
          {
            foreignKeyName: "review_collection_runs_organization_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_collection_runs_property_id_fkey";
            columns: ["property_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      review_collection_sources: {
        Row: {
          accepted_count: number;
          attempts: number;
          capped: boolean;
          created_by: string | null;
          dataset_id: string | null;
          dataset_total: number | null;
          duplicate_count: number;
          earliest_at: string | null;
          error: string | null;
          frozen_coverage: Json | null;
          id: string;
          label: string;
          latest_at: string | null;
          listing_id: string;
          listing_url: string;
          missing_id_count: number;
          missing_reviewer_count: number;
          next_offset: number;
          ordinal: number;
          organization_id: string;
          provider_build_id: string | null;
          provider_cost: number | null;
          provider_end: string | null;
          provider_run_id: string | null;
          provider_start: string | null;
          provider_status: string | null;
          returned_count: number;
          role: string;
          run_id: string;
          skipped_count: number;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          accepted_count?: number;
          attempts?: number;
          capped?: boolean;
          created_by?: string | null;
          dataset_id?: string | null;
          dataset_total?: number | null;
          duplicate_count?: number;
          earliest_at?: string | null;
          error?: string | null;
          frozen_coverage?: Json | null;
          id?: string;
          label: string;
          latest_at?: string | null;
          listing_id: string;
          listing_url: string;
          missing_id_count?: number;
          missing_reviewer_count?: number;
          next_offset?: number;
          ordinal: number;
          organization_id: string;
          provider_build_id?: string | null;
          provider_cost?: number | null;
          provider_end?: string | null;
          provider_run_id?: string | null;
          provider_start?: string | null;
          provider_status?: string | null;
          returned_count?: number;
          role: string;
          run_id: string;
          skipped_count?: number;
          status?: string;
        };
        Update: {
          accepted_count?: number;
          attempts?: number;
          capped?: boolean;
          created_by?: string | null;
          dataset_id?: string | null;
          dataset_total?: number | null;
          duplicate_count?: number;
          earliest_at?: string | null;
          error?: string | null;
          frozen_coverage?: Json | null;
          id?: string;
          label?: string;
          latest_at?: string | null;
          listing_id?: string;
          listing_url?: string;
          missing_id_count?: number;
          missing_reviewer_count?: number;
          next_offset?: number;
          ordinal?: number;
          organization_id?: string;
          provider_build_id?: string | null;
          provider_cost?: number | null;
          provider_end?: string | null;
          provider_run_id?: string | null;
          provider_start?: string | null;
          provider_status?: string | null;
          returned_count?: number;
          role?: string;
          run_id?: string;
          skipped_count?: number;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_collection_sources_organization_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_collection_sources_run_id_fkey";
            columns: ["run_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "review_collection_runs";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      review_revisions: {
        Row: {
          collection_source_id: string;
          content_hash: string;
          created_by: string | null;
          id: string;
          observed_at: string;
          organization_id: string;
          original_language: string | null;
          original_text: string;
          published_at: string;
          rating: number | null;
          review_id: string;
          review_url: string | null;
          reviewer_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          collection_source_id: string;
          content_hash: string;
          created_by?: string | null;
          id?: string;
          observed_at?: string;
          organization_id: string;
          original_language?: string | null;
          original_text?: string;
          published_at: string;
          rating?: number | null;
          review_id: string;
          review_url?: string | null;
          reviewer_id?: string | null;
        };
        Update: {
          collection_source_id?: string;
          content_hash?: string;
          created_by?: string | null;
          id?: string;
          observed_at?: string;
          organization_id?: string;
          original_language?: string | null;
          original_text?: string;
          published_at?: string;
          rating?: number | null;
          review_id?: string;
          review_url?: string | null;
          reviewer_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "review_revisions_collection_source_id_fkey";
            columns: ["collection_source_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "review_collection_sources";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "review_revisions_organization_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_revisions_review_id_fkey";
            columns: ["review_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "source_reviews";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      review_snapshot_items: {
        Row: {
          created_by: string | null;
          organization_id: string;
          review_id: string;
          revision_id: string;
          snapshot_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_by?: string | null;
          organization_id: string;
          review_id: string;
          revision_id: string;
          snapshot_id: string;
        };
        Update: {
          created_by?: string | null;
          organization_id?: string;
          review_id?: string;
          revision_id?: string;
          snapshot_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_snapshot_items_organization_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_snapshot_items_review_id_fkey";
            columns: ["review_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "source_reviews";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "review_snapshot_items_revision_id_fkey";
            columns: ["review_id", "revision_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "review_revisions";
            referencedColumns: ["review_id", "id", "organization_id"];
          },
          {
            foreignKeyName: "review_snapshot_items_snapshot_id_fkey";
            columns: ["snapshot_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "review_snapshots";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      review_snapshots: {
        Row: {
          analysis_id: string | null;
          analysis_version: number;
          created_at: string;
          created_by: string | null;
          id: string;
          organization_id: string;
          property_id: string | null;
          requested_end: string;
          requested_start: string;
          run_id: string;
        };
        ComputedFields: never;
        Insert: {
          analysis_id?: string | null;
          analysis_version: number;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          organization_id: string;
          property_id?: string | null;
          requested_end: string;
          requested_start: string;
          run_id: string;
        };
        Update: {
          analysis_id?: string | null;
          analysis_version?: number;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          organization_id?: string;
          property_id?: string | null;
          requested_end?: string;
          requested_start?: string;
          run_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_snapshots_analysis_id_fkey";
            columns: ["analysis_id", "analysis_version", "organization_id"];
            isOneToOne: false;
            referencedRelation: "analysis_versions";
            referencedColumns: ["analysis_id", "version", "organization_id"];
          },
          {
            foreignKeyName: "review_snapshots_organization_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_snapshots_property_id_fkey";
            columns: ["property_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "review_snapshots_run_id_fkey";
            columns: ["run_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "review_collection_runs";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      source_reviews: {
        Row: {
          created_by: string | null;
          current_revision_id: string | null;
          first_collected_at: string;
          id: string;
          last_collected_at: string;
          listing_id: string;
          organization_id: string;
          source: string;
          source_review_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_by?: string | null;
          current_revision_id?: string | null;
          first_collected_at?: string;
          id?: string;
          last_collected_at?: string;
          listing_id: string;
          organization_id?: string;
          source?: string;
          source_review_id: string;
        };
        Update: {
          created_by?: string | null;
          current_revision_id?: string | null;
          first_collected_at?: string;
          id?: string;
          last_collected_at?: string;
          listing_id?: string;
          organization_id?: string;
          source?: string;
          source_review_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_reviews_current_revision_id_fkey";
            columns: ["id", "current_revision_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "review_revisions";
            referencedColumns: ["review_id", "id", "organization_id"];
          },
          {
            foreignKeyName: "source_reviews_organization_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_organization_member: {
        Args: { p_role: string; p_user_id: string };
        Returns: undefined;
      };
      cancel_comparison_report: {
        Args: { p_report: string };
        Returns: boolean;
      };
      change_organization_member_role: {
        Args: { p_role: string; p_user_id: string };
        Returns: undefined;
      };
      claim_comparison_ai_job: {
        Args: Record<PropertyKey, never>;
        Returns: {
          analysis_id: string;
          created_at: string;
          error_code: string | null;
          finished_at: string | null;
          id: string;
          import_id: string;
          lease_token: string | null;
          lease_until: string | null;
          message_id: string;
          next_attempt_at: string;
          organization_id: string;
          period_end: string;
          period_start: string;
          processed_count: number;
          status: string;
          total_count: number;
          visualization_type: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "comparison_ai_jobs";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      claim_comparison_report: {
        Args: Record<PropertyKey, never>;
        Returns: {
          analysis_id: string;
          analysis_version: number;
          attempts: number;
          created_at: string;
          created_by: string | null;
          error_code: string | null;
          finished_at: string | null;
          frozen_data: NonNullable<Json>;
          id: string;
          lease_token: string | null;
          lease_until: string | null;
          locale: string;
          metric_definition_version: number;
          native_charts: boolean;
          next_attempt_at: string;
          organization_id: string;
          period: NonNullable<Json>;
          provider_export_url: string | null;
          provider_generation_id: string | null;
          snapshot_id: string;
          status: string;
          storage_path: string | null;
          template_id: string;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "comparison_reports";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      claim_review_collection: {
        Args: Record<PropertyKey, never>;
        Returns: {
          analysis_id: string | null;
          analysis_version: number;
          config: NonNullable<Json>;
          created_at: string;
          created_by: string | null;
          finished_at: string | null;
          id: string;
          lease_token: string | null;
          lease_until: string | null;
          max_reviews: number;
          next_attempt_at: string;
          organization_id: string;
          property_id: string | null;
          requested_end: string;
          requested_start: string;
          status: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "review_collection_runs";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      enqueue_comparison_ai_job: {
        Args: {
          p_analysis: string;
          p_end: string;
          p_import: string;
          p_message: string;
          p_start: string;
          p_total: number;
          p_type: string;
        };
        Returns: string;
      };
      enqueue_comparison_report: {
        Args: {
          p_analysis: string;
          p_expected: number;
          p_locale: string;
          p_options: Json;
          p_period: Json;
          p_snapshot?: string;
        };
        Returns: string;
      };
      ensure_comparison_coverage: {
        Args: {
          p_analysis: string;
          p_end: string;
          p_retry?: boolean;
          p_start: string;
        };
        Returns: undefined;
      };
      finish_review_collection: {
        Args: { p_lease: string; p_run_id: string };
        Returns: undefined;
      };
      get_frozen_review_coverage: {
        Args: { p_snapshot: string };
        Returns: Json;
      };
      get_review_dashboard_metrics: {
        Args: {
          p_end: string;
          p_kind: string;
          p_quarter: number;
          p_snapshot: string;
          p_start: string;
          p_year: number;
        };
        Returns: Json;
      };
      get_shared_reviewer_evidence: {
        Args: {
          p_analysis: string;
          p_competitor: string;
          p_end: string;
          p_offset: number;
          p_snapshot?: string;
          p_start: string;
        };
        Returns: Json;
      };
      get_stored_review_dashboard: {
        Args: {
          p_end: string;
          p_kind: string;
          p_property: boolean;
          p_quarter: number;
          p_scope: string;
          p_start: string;
          p_year: number;
        };
        Returns: Json;
      };
      ingest_review_page: {
        Args: {
          p_consumed: number;
          p_lease: string;
          p_missing_ids: number;
          p_offset: number;
          p_reviews: Json;
          p_skipped: number;
          p_source_id: string;
        };
        Returns: undefined;
      };
      list_property_metrics: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      prepare_comparison_ai_snapshots: {
        Args: { p_analysis: string; p_snapshot_ids: string[] };
        Returns: {
          import_id: string;
          row_count: number;
        }[];
      };
      provision_organization: {
        Args: { p_name: string; p_user_id: string };
        Returns: string;
      };
      queue_property_collection: {
        Args: {
          p_end: string;
          p_max_reviews: number;
          p_property_id: string;
          p_start: string;
        };
        Returns: string;
      };
      queue_review_collection: {
        Args: { p_analysis_id: string; p_max_reviews: number };
        Returns: string;
      };
      remove_organization_member: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      save_analysis: {
        Args: {
          p_config: Json;
          p_expected: number;
          p_id: string;
          p_name: string;
        };
        Returns: string;
      };
      transfer_organization_ownership: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      update_organization: {
        Args: { p_name: string; p_report_template_id?: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
