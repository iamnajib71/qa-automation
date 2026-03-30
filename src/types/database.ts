export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          metadata: Json;
          project_id: string | null;
          summary: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          metadata?: Json;
          project_id?: string | null;
          summary: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Insert"]>;
        Relationships: [];
      };
      attachments: {
        Row: {
          created_at: string;
          defect_id: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          id: string;
          project_id: string;
          test_run_case_id: string | null;
          test_run_id: string | null;
          uploaded_by: string;
        };
        Insert: {
          created_at?: string;
          defect_id?: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          id?: string;
          project_id: string;
          test_run_case_id?: string | null;
          test_run_id?: string | null;
          uploaded_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["attachments"]["Insert"]>;
        Relationships: [];
      };
      defects: {
        Row: {
          assigned_owner_id: string | null;
          created_at: string;
          defect_key: string;
          description: string;
          environment: string;
          id: string;
          priority: "low" | "medium" | "high" | "critical";
          project_id: string;
          release_id: string | null;
          reported_by: string;
          severity: "low" | "medium" | "high" | "critical";
          status: "open" | "in_progress" | "retest" | "closed";
          test_run_case_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          assigned_owner_id?: string | null;
          created_at?: string;
          defect_key: string;
          description: string;
          environment: string;
          id?: string;
          priority: "low" | "medium" | "high" | "critical";
          project_id: string;
          release_id?: string | null;
          reported_by: string;
          severity: "low" | "medium" | "high" | "critical";
          status?: "open" | "in_progress" | "retest" | "closed";
          test_run_case_id?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["defects"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          role: "admin" | "qa_analyst" | "viewer";
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          role?: "admin" | "qa_analyst" | "viewer";
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string;
          created_by: string;
          description: string;
          id: string;
          name: string;
          owner_id: string;
          project_key: string;
          status: "active" | "on_hold" | "completed" | "archived";
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description: string;
          id?: string;
          name: string;
          owner_id: string;
          project_key: string;
          status?: "active" | "on_hold" | "completed" | "archived";
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      releases: {
        Row: {
          build_number: string;
          created_at: string;
          created_by: string;
          environment: string;
          id: string;
          name: string;
          notes: string | null;
          planned_release_date: string | null;
          planned_start_date: string | null;
          project_id: string;
          status: "planning" | "in_testing" | "uat" | "ready" | "released" | "delayed";
          updated_at: string;
          version: string;
        };
        Insert: {
          build_number: string;
          created_at?: string;
          created_by: string;
          environment: string;
          id?: string;
          name: string;
          notes?: string | null;
          planned_release_date?: string | null;
          planned_start_date?: string | null;
          project_id: string;
          status?: "planning" | "in_testing" | "uat" | "ready" | "released" | "delayed";
          updated_at?: string;
          version: string;
        };
        Update: Partial<Database["public"]["Tables"]["releases"]["Insert"]>;
        Relationships: [];
      };
      test_cases: {
        Row: {
          case_id: string;
          created_at: string;
          created_by: string;
          expected_result: string;
          id: string;
          module: string;
          preconditions: string | null;
          priority: "low" | "medium" | "high" | "critical";
          project_id: string;
          status: "draft" | "ready" | "archived";
          steps: Json;
          title: string;
          type: "functional" | "regression" | "smoke" | "integration" | "uat" | "api";
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          case_id: string;
          created_at?: string;
          created_by: string;
          expected_result: string;
          id?: string;
          module: string;
          preconditions?: string | null;
          priority: "low" | "medium" | "high" | "critical";
          project_id: string;
          status?: "draft" | "ready" | "archived";
          steps: Json;
          title: string;
          type: "functional" | "regression" | "smoke" | "integration" | "uat" | "api";
          updated_at?: string;
          updated_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["test_cases"]["Insert"]>;
        Relationships: [];
      };
      test_run_cases: {
        Row: {
          created_at: string;
          executed_at: string | null;
          executed_by: string | null;
          execution_notes: string | null;
          id: string;
          linked_defect_id: string | null;
          result: "not_run" | "passed" | "failed" | "blocked";
          test_case_id: string;
          test_run_id: string;
        };
        Insert: {
          created_at?: string;
          executed_at?: string | null;
          executed_by?: string | null;
          execution_notes?: string | null;
          id?: string;
          linked_defect_id?: string | null;
          result?: "not_run" | "passed" | "failed" | "blocked";
          test_case_id: string;
          test_run_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["test_run_cases"]["Insert"]>;
        Relationships: [];
      };
      test_runs: {
        Row: {
          assigned_to: string | null;
          completed_at: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          name: string;
          project_id: string;
          release_id: string;
          started_at: string | null;
          status: "not_started" | "in_progress" | "completed" | "blocked";
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          id?: string;
          name: string;
          project_id: string;
          release_id: string;
          started_at?: string | null;
          status?: "not_started" | "in_progress" | "completed" | "blocked";
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["test_runs"]["Insert"]>;
        Relationships: [];
      };
    };
  };
};
