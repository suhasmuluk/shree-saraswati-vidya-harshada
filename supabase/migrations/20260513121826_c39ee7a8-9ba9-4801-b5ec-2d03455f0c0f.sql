
-- Soft delete / archive columns for students
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archive_reason TEXT;

-- Soft delete / archive columns for teachers
ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archive_reason TEXT;

-- Soft delete / archive columns for staff (consistency)
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archive_reason TEXT;

-- Indexes for active filtering
CREATE INDEX IF NOT EXISTS idx_students_active ON public.students(is_active) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_teachers_active ON public.teachers(is_active) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_staff_active ON public.staff(is_active) WHERE is_deleted = false;

-- Audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT,
  action TEXT NOT NULL,
  reason TEXT,
  performed_by UUID,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read audit_logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated insert audit_logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins delete audit_logs"
  ON public.audit_logs FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON public.audit_logs(performed_at DESC);
