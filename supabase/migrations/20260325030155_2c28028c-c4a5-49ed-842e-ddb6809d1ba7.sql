
-- Create inquiries table
CREATE TABLE public.inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name text NOT NULL,
  parent_name text NOT NULL,
  contact_number text NOT NULL,
  alternate_contact text,
  email text,
  class_interested text,
  previous_school text,
  inquiry_date date NOT NULL DEFAULT CURRENT_DATE,
  source text NOT NULL DEFAULT 'Walk-in',
  address text,
  remarks text,
  status text NOT NULL DEFAULT 'New',
  converted_student_id uuid REFERENCES public.students(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add inquiry_id to students table
ALTER TABLE public.students ADD COLUMN inquiry_id uuid REFERENCES public.inquiries(id);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers insert inquiries" ON public.inquiries FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Managers update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
