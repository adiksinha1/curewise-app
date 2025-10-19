-- Create a public-facing view for doctor profiles that only exposes non-sensitive information
CREATE OR REPLACE VIEW public.doctor_profiles_public AS
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

-- Keep existing policies for doctors to manage their own credentials
-- (These already exist: "Doctors can view their own credentials", "Doctors can insert their own credentials", "Doctors can update their own credentials")

-- Add DELETE policies for appointments table to allow cancellation
-- Patients can delete their own scheduled appointments (before appointment time)
CREATE POLICY "Patients can delete scheduled appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (
  auth.uid() = patient_id AND 
  status = 'scheduled' AND
  appointment_date > now()
);

-- Doctors can delete appointments assigned to them (if scheduled and not yet passed)
CREATE POLICY "Doctors can delete scheduled appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (
  auth.uid() = doctor_id AND
  status = 'scheduled' AND
  appointment_date > now()
);

-- Add cancelled_at timestamp for audit purposes
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;

-- Add comment documenting the appointment deletion policy
COMMENT ON TABLE public.appointments IS 'Appointments can only be deleted if they are scheduled and have not yet occurred. Completed or past appointments are preserved for audit trail. Use the status field for soft cancellations if deletion is not allowed.';