-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  patient_id uuid NOT NULL REFERENCES auth.users(id),
  patient_name text NOT NULL,
  patient_age integer NOT NULL,
  diagnosis text NOT NULL,
  medicines jsonb NOT NULL, -- Array of {name, dosage}
  advice text,
  prescription_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Doctors can create prescriptions
CREATE POLICY "Doctors can create prescriptions"
ON public.prescriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = doctor_id AND
  has_role(auth.uid(), 'doctor'::app_role)
);

-- Doctors can view their own prescriptions
CREATE POLICY "Doctors can view their prescriptions"
ON public.prescriptions
FOR SELECT
TO authenticated
USING (
  auth.uid() = doctor_id AND
  has_role(auth.uid(), 'doctor'::app_role)
);

-- Patients can view their own prescriptions
CREATE POLICY "Patients can view their prescriptions"
ON public.prescriptions
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

-- Anyone can verify prescriptions (for QR code verification)
CREATE POLICY "Anyone can verify prescriptions by id"
ON public.prescriptions
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();