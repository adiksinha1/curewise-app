-- Drop and recreate the view with SECURITY INVOKER to use the querying user's permissions
DROP VIEW IF EXISTS public.doctor_profiles_public;
CREATE VIEW public.doctor_profiles_public 
WITH (security_invoker = true) AS
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