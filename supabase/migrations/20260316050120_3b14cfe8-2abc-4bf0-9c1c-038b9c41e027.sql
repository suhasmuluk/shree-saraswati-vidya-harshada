
CREATE TABLE public.siblings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  sibling_name text NOT NULL,
  sibling_class text,
  sibling_section text,
  relationship text NOT NULL DEFAULT 'Brother',
  linked_student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.siblings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read siblings" ON public.siblings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert siblings" ON public.siblings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update siblings" ON public.siblings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete siblings" ON public.siblings FOR DELETE TO authenticated USING (true);
