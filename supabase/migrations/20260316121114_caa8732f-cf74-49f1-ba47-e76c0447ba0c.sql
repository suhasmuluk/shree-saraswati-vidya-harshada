ALTER TABLE public.fees DROP CONSTRAINT fees_payment_mode_check;
ALTER TABLE public.fees ADD CONSTRAINT fees_payment_mode_check CHECK (payment_mode IN ('cash', 'online', 'cheque', 'upi'));