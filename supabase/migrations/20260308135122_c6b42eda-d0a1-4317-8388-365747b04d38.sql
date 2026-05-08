
-- Teacher/Staff attendance table
CREATE TABLE public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_type TEXT NOT NULL CHECK (person_type IN ('teacher', 'staff')),
    person_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'leave')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (person_type, person_id, date)
);

ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read staff_attendance" ON public.staff_attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert staff_attendance" ON public.staff_attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update staff_attendance" ON public.staff_attendance FOR UPDATE TO authenticated USING (true);

-- Salary table
CREATE TABLE public.salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_type TEXT NOT NULL CHECK (person_type IN ('teacher', 'staff')),
    person_id UUID NOT NULL,
    month TEXT NOT NULL,
    base_salary NUMERIC NOT NULL DEFAULT 0,
    working_days INTEGER NOT NULL DEFAULT 0,
    present_days INTEGER NOT NULL DEFAULT 0,
    half_days INTEGER NOT NULL DEFAULT 0,
    deduction NUMERIC NOT NULL DEFAULT 0,
    net_salary NUMERIC NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (person_type, person_id, month)
);

ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read salaries" ON public.salaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert salaries" ON public.salaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update salaries" ON public.salaries FOR UPDATE TO authenticated USING (true);

CREATE TRIGGER update_salaries_updated_at BEFORE UPDATE ON public.salaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add base_salary column to teachers and staff
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS base_salary NUMERIC NOT NULL DEFAULT 15000;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS base_salary NUMERIC NOT NULL DEFAULT 10000;
