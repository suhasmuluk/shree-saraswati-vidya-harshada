
-- Add insert/update/delete policies for classes table
CREATE POLICY "Admins insert classes" ON public.classes FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update classes" ON public.classes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete classes" ON public.classes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
