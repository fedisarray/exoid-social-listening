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
          current_version: number;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          current_version?: number;
          id?: string;
          name: string;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_version?: number;
          id?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analysis_versions: {
        Row: {
          analysis_id: string;
          config: NonNullable<Json>;
          created_at: string;
          id: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          analysis_id: string;
          config: NonNullable<Json>;
          created_at?: string;
          id?: string;
          version: number;
        };
        Update: {
          analysis_id?: string;
          config?: NonNullable<Json>;
          created_at?: string;
          id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_versions_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id"];
          },
        ];
      };
      discovery_runs: {
        Row: {
          created_at: string;
          error: string | null;
          id: string;
          input: NonNullable<Json>;
          owner_id: string;
          provider_run_id: string | null;
          results: NonNullable<Json>;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          error?: string | null;
          id?: string;
          input: NonNullable<Json>;
          owner_id: string;
          provider_run_id?: string | null;
          results?: NonNullable<Json>;
          status: string;
        };
        Update: {
          created_at?: string;
          error?: string | null;
          id?: string;
          input?: NonNullable<Json>;
          owner_id?: string;
          provider_run_id?: string | null;
          results?: NonNullable<Json>;
          status?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          listing: NonNullable<Json>;
          owner_id: string;
          source_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          listing: NonNullable<Json>;
          owner_id: string;
          source_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          listing?: NonNullable<Json>;
          owner_id?: string;
          source_id?: string;
        };
        Relationships: [];
      };
      review_collection_runs: {
        Row: {
          analysis_id: string | null;
          analysis_version: number;
          config: NonNullable<Json>;
          created_at: string;
          finished_at: string | null;
          id: string;
          lease_token: string | null;
          lease_until: string | null;
          max_reviews: number;
          next_attempt_at: string;
          owner_id: string;
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
          finished_at?: string | null;
          id?: string;
          lease_token?: string | null;
          lease_until?: string | null;
          max_reviews: number;
          next_attempt_at?: string;
          owner_id: string;
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
          finished_at?: string | null;
          id?: string;
          lease_token?: string | null;
          lease_until?: string | null;
          max_reviews?: number;
          next_attempt_at?: string;
          owner_id?: string;
          property_id?: string | null;
          requested_end?: string;
          requested_start?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_collection_runs_analysis_id_analysis_version_fkey";
            columns: ["analysis_id", "analysis_version"];
            isOneToOne: false;
            referencedRelation: "analysis_versions";
            referencedColumns: ["analysis_id", "version"];
          },
          {
            foreignKeyName: "review_collection_runs_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      review_collection_sources: {
        Row: {
          accepted_count: number;
          attempts: number;
          capped: boolean;
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
          owner_id: string;
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
          owner_id: string;
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
          owner_id?: string;
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
            foreignKeyName: "review_collection_sources_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "review_collection_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      review_revisions: {
        Row: {
          collection_source_id: string;
          content_hash: string;
          id: string;
          observed_at: string;
          original_language: string | null;
          original_text: string;
          owner_id: string;
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
          id?: string;
          observed_at?: string;
          original_language?: string | null;
          original_text?: string;
          owner_id: string;
          published_at: string;
          rating?: number | null;
          review_id: string;
          review_url?: string | null;
          reviewer_id?: string | null;
        };
        Update: {
          collection_source_id?: string;
          content_hash?: string;
          id?: string;
          observed_at?: string;
          original_language?: string | null;
          original_text?: string;
          owner_id?: string;
          published_at?: string;
          rating?: number | null;
          review_id?: string;
          review_url?: string | null;
          reviewer_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "review_revisions_collection_source_id_fkey";
            columns: ["collection_source_id"];
            isOneToOne: false;
            referencedRelation: "review_collection_sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_revisions_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "source_reviews";
            referencedColumns: ["id"];
          },
        ];
      };
      review_snapshot_items: {
        Row: {
          owner_id: string;
          review_id: string;
          revision_id: string;
          snapshot_id: string;
        };
        ComputedFields: never;
        Insert: {
          owner_id: string;
          review_id: string;
          revision_id: string;
          snapshot_id: string;
        };
        Update: {
          owner_id?: string;
          review_id?: string;
          revision_id?: string;
          snapshot_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_snapshot_items_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "source_reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_snapshot_items_revision_id_fkey";
            columns: ["revision_id"];
            isOneToOne: false;
            referencedRelation: "review_revisions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_snapshot_items_snapshot_id_fkey";
            columns: ["snapshot_id"];
            isOneToOne: false;
            referencedRelation: "review_snapshots";
            referencedColumns: ["id"];
          },
        ];
      };
      review_snapshots: {
        Row: {
          analysis_id: string | null;
          analysis_version: number;
          created_at: string;
          id: string;
          owner_id: string;
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
          id?: string;
          owner_id: string;
          property_id?: string | null;
          requested_end: string;
          requested_start: string;
          run_id: string;
        };
        Update: {
          analysis_id?: string | null;
          analysis_version?: number;
          created_at?: string;
          id?: string;
          owner_id?: string;
          property_id?: string | null;
          requested_end?: string;
          requested_start?: string;
          run_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_snapshots_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_snapshots_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_snapshots_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: true;
            referencedRelation: "review_collection_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      source_reviews: {
        Row: {
          current_revision_id: string | null;
          first_collected_at: string;
          id: string;
          last_collected_at: string;
          listing_id: string;
          owner_id: string;
          source: string;
          source_review_id: string;
        };
        ComputedFields: never;
        Insert: {
          current_revision_id?: string | null;
          first_collected_at?: string;
          id?: string;
          last_collected_at?: string;
          listing_id: string;
          owner_id: string;
          source?: string;
          source_review_id: string;
        };
        Update: {
          current_revision_id?: string | null;
          first_collected_at?: string;
          id?: string;
          last_collected_at?: string;
          listing_id?: string;
          owner_id?: string;
          source?: string;
          source_review_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_reviews_current_revision_id_fkey";
            columns: ["current_revision_id"];
            isOneToOne: false;
            referencedRelation: "review_revisions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_review_collection: {
        Args: Record<PropertyKey, never>;
        Returns: {
          analysis_id: string | null;
          analysis_version: number;
          config: NonNullable<Json>;
          created_at: string;
          finished_at: string | null;
          id: string;
          lease_token: string | null;
          lease_until: string | null;
          max_reviews: number;
          next_attempt_at: string;
          owner_id: string;
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
      save_analysis: {
        Args: {
          p_config: Json;
          p_expected: number;
          p_id: string;
          p_name: string;
        };
        Returns: string;
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
