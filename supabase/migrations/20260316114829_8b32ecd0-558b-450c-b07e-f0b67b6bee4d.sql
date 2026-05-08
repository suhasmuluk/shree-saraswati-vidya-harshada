
-- Tighten RLS: keep SELECT for all authenticated, restrict INSERT/UPDATE/DELETE by role

-- ============ STUDENTS ============
DROP POLICY IF EXISTS "Authenticated insert students" ON public.students;
DROP POLICY IF EXISTS "Authenticated update students" ON public.students;
DROP POLICY IF EXISTS "Authenticated delete students" ON public.students;

CREATE POLICY "Managers insert students" ON public.students FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers update students" ON public.students FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins delete students" ON public.students FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ TEACHERS ============
DROP POLICY IF EXISTS "Authenticated insert teachers" ON public.teachers;
DROP POLICY IF EXISTS "Authenticated update teachers" ON public.teachers;
DROP POLICY IF EXISTS "Authenticated delete teachers" ON public.teachers;

CREATE POLICY "Managers insert teachers" ON public.teachers FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers update teachers" ON public.teachers FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins delete teachers" ON public.teachers FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ STAFF ============
DROP POLICY IF EXISTS "Authenticated insert staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated update staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated delete staff" ON public.staff;

CREATE POLICY "Managers insert staff" ON public.staff FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers update staff" ON public.staff FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins delete staff" ON public.staff FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ FEES ============
DROP POLICY IF EXISTS "Authenticated insert fees" ON public.fees;
DROP POLICY IF EXISTS "Authenticated update fees" ON public.fees;

CREATE POLICY "Managers insert fees" ON public.fees FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers update fees" ON public.fees FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- ============ SALARIES ============
DROP POLICY IF EXISTS "Authenticated insert salaries" ON public.salaries;
DROP POLICY IF EXISTS "Authenticated update salaries" ON public.salaries;

CREATE POLICY "Admins insert salaries" ON public.salaries FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update salaries" ON public.salaries FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ EXAM_RESULTS ============
DROP POLICY IF EXISTS "Authenticated insert exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Authenticated update exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Authenticated delete exam_results" ON public.exam_results;

CREATE POLICY "Managers insert exam_results" ON public.exam_results FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers update exam_results" ON public.exam_results FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins delete exam_results" ON public.exam_results FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ ATTENDANCE ============
DROP POLICY IF EXISTS "Authenticated insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated update attendance" ON public.attendance;

CREATE POLICY "Managers insert attendance" ON public.attendance FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers update attendance" ON public.attendance FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- ============ STAFF_ATTENDANCE ============
DROP POLICY IF EXISTS "Authenticated insert staff_attendance" ON public.staff_attendance;
DROP POLICY IF EXISTS "Authenticated update staff_attendance" ON public.staff_attendance;

CREATE POLICY "Managers insert staff_attendance" ON public.staff_attendance FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers update staff_attendance" ON public.staff_attendance FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- ============ ANNOUNCEMENTS ============
DROP POLICY IF EXISTS "Authenticated insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated delete announcements" ON public.announcements;

CREATE POLICY "Managers insert announcements" ON public.announcements FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers update announcements" ON public.announcements FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins delete announcements" ON public.announcements FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ STUDENT_ACHIEVEMENTS ============
DROP POLICY IF EXISTS "Authenticated insert student_achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Authenticated update student_achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Authenticated delete student_achievements" ON public.student_achievements;

CREATE POLICY "Managers insert student_achievements" ON public.student_achievements FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers update student_achievements" ON public.student_achievements FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins delete student_achievements" ON public.student_achievements FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ SIBLINGS ============
DROP POLICY IF EXISTS "Authenticated insert siblings" ON public.siblings;
DROP POLICY IF EXISTS "Authenticated update siblings" ON public.siblings;
DROP POLICY IF EXISTS "Authenticated delete siblings" ON public.siblings;

CREATE POLICY "Managers insert siblings" ON public.siblings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers update siblings" ON public.siblings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins delete siblings" ON public.siblings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
