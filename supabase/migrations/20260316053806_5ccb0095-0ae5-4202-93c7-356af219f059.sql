
-- Exam results table
CREATE TABLE public.exam_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  marks_obtained NUMERIC NOT NULL DEFAULT 0,
  total_marks NUMERIC NOT NULL DEFAULT 100,
  grade TEXT,
  remarks TEXT,
  result_status TEXT NOT NULL DEFAULT 'pass',
  exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read exam_results" ON public.exam_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert exam_results" ON public.exam_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update exam_results" ON public.exam_results FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete exam_results" ON public.exam_results FOR DELETE TO authenticated USING (true);
