
-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.classes (name) VALUES ('Playgroup'), ('Nursery'), ('Junior KG'), ('Senior KG');

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  class_id UUID REFERENCES public.classes(id),
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  address TEXT,
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Create fees table
CREATE TABLE public.fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'pending')) DEFAULT 'pending',
  payment_date DATE,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'online', 'cheque')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('holiday', 'event', 'general')) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated read classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read students" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert students" ON public.students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update students" ON public.students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete students" ON public.students FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated read teachers" ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert teachers" ON public.teachers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update teachers" ON public.teachers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete teachers" ON public.teachers FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated read attendance" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update attendance" ON public.attendance FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated read fees" ON public.fees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fees" ON public.fees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update fees" ON public.fees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated read announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update announcements" ON public.announcements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete announcements" ON public.announcements FOR DELETE TO authenticated USING (true);

-- Storage bucket for student photos
INSERT INTO storage.buckets (id, name, public) VALUES ('student-photos', 'student-photos', true);
CREATE POLICY "Anyone can view student photos" ON storage.objects FOR SELECT USING (bucket_id = 'student-photos');
CREATE POLICY "Authenticated upload student photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'student-photos');
CREATE POLICY "Authenticated update student photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'student-photos');

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON public.fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
