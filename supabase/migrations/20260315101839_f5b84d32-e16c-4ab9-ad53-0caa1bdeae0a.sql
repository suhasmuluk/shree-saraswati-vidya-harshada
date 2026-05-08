ALTER TABLE public.students 
ADD COLUMN has_transport boolean NOT NULL DEFAULT false,
ADD COLUMN transport_type text DEFAULT NULL,
ADD COLUMN transport_route text DEFAULT NULL;