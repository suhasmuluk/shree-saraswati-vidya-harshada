ALTER TABLE public.students
  ADD COLUMN books_issued boolean NOT NULL DEFAULT false,
  ADD COLUMN uniform_issued boolean NOT NULL DEFAULT false,
  ADD COLUMN materials_issued boolean NOT NULL DEFAULT false,
  ADD COLUMN items_issue_date date,
  ADD COLUMN items_remarks text;