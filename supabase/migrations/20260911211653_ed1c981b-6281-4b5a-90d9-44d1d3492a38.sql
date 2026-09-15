CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  district TEXT NOT NULL,
  taluk TEXT NOT NULL,
  address TEXT NOT NULL,
  emergency_contact TEXT,
  designation TEXT NOT NULL DEFAULT 'Member',
  aadhar_number TEXT,
  photo_url TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'public',
  payment_status TEXT NOT NULL DEFAULT 'free',
  payment_amount NUMERIC NOT NULL DEFAULT 0,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.members TO service_role;

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct client access to members" ON public.members FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX members_created_at_idx ON public.members (created_at DESC);