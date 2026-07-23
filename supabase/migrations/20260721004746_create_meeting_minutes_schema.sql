/*
# MeetMinGenerator - Core Schema (retry)

Fixes the DROP POLICY syntax error from the previous attempt (DROP POLICY
does not accept FOR <verb>). All CREATE statements use IF NOT EXISTS and
all policies are dropped first, so this is safe to re-run.
*/

CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Meeting',
  file_name text,
  file_type text,
  file_size bigint,
  raw_transcript text,
  clean_transcript text,
  language text,
  participants text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'uploaded',
  processing_error text,
  confidence_score numeric,
  sentiment text,
  meeting_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_meetings" ON meetings;
CREATE POLICY "select_own_meetings" ON meetings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_meetings" ON meetings;
CREATE POLICY "insert_own_meetings" ON meetings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_meetings" ON meetings;
CREATE POLICY "update_own_meetings" ON meetings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_meetings" ON meetings;
CREATE POLICY "delete_own_meetings" ON meetings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at DESC);

CREATE TABLE IF NOT EXISTS meeting_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  executive_summary text,
  detailed_summary text,
  bullet_summary text,
  timeline_summary text,
  highlights text[] DEFAULT '{}',
  agenda text[] DEFAULT '{}',
  discussion_points text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_summaries" ON meeting_summaries;
CREATE POLICY "select_own_summaries" ON meeting_summaries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_summaries" ON meeting_summaries;
CREATE POLICY "insert_own_summaries" ON meeting_summaries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_summaries" ON meeting_summaries;
CREATE POLICY "update_own_summaries" ON meeting_summaries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_summaries" ON meeting_summaries;
CREATE POLICY "delete_own_summaries" ON meeting_summaries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_summaries_meeting_id ON meeting_summaries(meeting_id);

CREATE TABLE IF NOT EXISTS action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  task text NOT NULL,
  owner text,
  department text,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  deadline date,
  estimated_effort text,
  dependencies text,
  confidence_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_action_items" ON action_items;
CREATE POLICY "select_own_action_items" ON action_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_action_items" ON action_items;
CREATE POLICY "insert_own_action_items" ON action_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_action_items" ON action_items;
CREATE POLICY "update_own_action_items" ON action_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_action_items" ON action_items;
CREATE POLICY "delete_own_action_items" ON action_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON action_items(user_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_priority ON action_items(priority);

CREATE TABLE IF NOT EXISTS risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  risk text NOT NULL,
  category text NOT NULL DEFAULT 'project',
  severity text NOT NULL DEFAULT 'medium',
  mitigation text,
  confidence_score numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_risks" ON risks;
CREATE POLICY "select_own_risks" ON risks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_risks" ON risks;
CREATE POLICY "insert_own_risks" ON risks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_risks" ON risks;
CREATE POLICY "update_own_risks" ON risks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_risks" ON risks;
CREATE POLICY "delete_own_risks" ON risks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_risks_meeting_id ON risks(meeting_id);
CREATE INDEX IF NOT EXISTS idx_risks_severity ON risks(severity);

CREATE TABLE IF NOT EXISTS decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  decision text NOT NULL,
  decision_maker text,
  reason text,
  impact text,
  confidence_score numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_decisions" ON decisions;
CREATE POLICY "select_own_decisions" ON decisions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_decisions" ON decisions;
CREATE POLICY "insert_own_decisions" ON decisions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_decisions" ON decisions;
CREATE POLICY "update_own_decisions" ON decisions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_decisions" ON decisions;
CREATE POLICY "delete_own_decisions" ON decisions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_decisions_meeting_id ON decisions(meeting_id);

CREATE TABLE IF NOT EXISTS deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  task text NOT NULL,
  owner text,
  due_date date NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_deadlines" ON deadlines;
CREATE POLICY "select_own_deadlines" ON deadlines FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_deadlines" ON deadlines;
CREATE POLICY "insert_own_deadlines" ON deadlines FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_deadlines" ON deadlines;
CREATE POLICY "update_own_deadlines" ON deadlines FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_deadlines" ON deadlines;
CREATE POLICY "delete_own_deadlines" ON deadlines FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON deadlines(due_date);

CREATE TABLE IF NOT EXISTS exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  format text NOT NULL,
  content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_exports" ON exports;
CREATE POLICY "select_own_exports" ON exports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_exports" ON exports;
CREATE POLICY "insert_own_exports" ON exports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_exports" ON exports;
CREATE POLICY "delete_own_exports" ON exports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_exports_meeting_id ON exports(meeting_id);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean NOT NULL DEFAULT false,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_audit_logs" ON audit_logs;
CREATE POLICY "select_own_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_audit_logs" ON audit_logs;
CREATE POLICY "insert_own_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  model text,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  cost numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_api_usage" ON api_usage;
CREATE POLICY "select_own_api_usage" ON api_usage FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_api_usage" ON api_usage;
CREATE POLICY "insert_own_api_usage" ON api_usage FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  company text,
  role text DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_meetings_updated_at ON meetings;
CREATE TRIGGER trg_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_action_items_updated_at ON action_items;
CREATE TRIGGER trg_action_items_updated_at BEFORE UPDATE ON action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
