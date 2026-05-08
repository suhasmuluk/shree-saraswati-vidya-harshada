
CREATE TABLE public.student_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT,
  achievement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read student_achievements" ON public.student_achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert student_achievements" ON public.student_achievements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update student_achievements" ON public.student_achievements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete student_achievements" ON public.student_achievements FOR DELETE TO authenticated USING (true);
