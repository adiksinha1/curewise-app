-- Create a public-facing view for doctor profiles that only exposes non-sensitive information
DROP VIEW IF EXISTS public.doctor_profiles_public;
CREATE VIEW public.doctor_profiles_public AS
SELECT 
  dc.user_id,
  dc.specialization,
  dc.years_of_experience,
  dc.bio,
  dc.languages,
  dc.verified,
  p.full_name,
  p.email
FROM public.doctor_credentials dc
INNER JOIN public.profiles p ON dc.user_id = p.id
WHERE dc.verified = true;

-- Drop the overly permissive public policy on doctor_credentials
DROP POLICY IF EXISTS "Anyone can view verified doctor credentials" ON public.doctor_credentials;

-- Add cancelled_at timestamp for audit purposes if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'appointments' 
    AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE public.appointments 
    ADD COLUMN cancelled_at timestamp with time zone;
  END IF;
END $$;

-- Add comment documenting the appointment deletion policy
COMMENT ON TABLE public.appointments IS 'Appointments can only be deleted if they are scheduled and have not yet occurred. Completed or past appointments are preserved for audit trail. Use the status field for soft cancellations if deletion is not allowed.';