-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('doctor', 'patient');

-- Create profiles table for basic user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table to distinguish doctors from patients
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create doctor_credentials table
CREATE TABLE public.doctor_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  license_number TEXT NOT NULL UNIQUE,
  specialization TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL,
  medical_school TEXT,
  certifications TEXT[],
  languages TEXT[],
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_medical_history table
CREATE TABLE public.patient_medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chronic_conditions TEXT[],
  allergies TEXT[],
  current_medications TEXT[],
  past_surgeries TEXT[],
  family_history TEXT[],
  blood_type TEXT,
  height_cm DECIMAL,
  weight_kg DECIMAL,
  smoking_status TEXT CHECK (smoking_status IN ('never', 'former', 'current')),
  alcohol_consumption TEXT CHECK (alcohol_consumption IN ('none', 'occasional', 'moderate', 'heavy')),
  exercise_frequency TEXT CHECK (exercise_frequency IN ('none', 'rare', 'weekly', 'daily')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id)
);

-- Create symptom_checks table to store symptom checker history
CREATE TABLE public.symptom_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  duration TEXT,
  severity TEXT,
  age_range TEXT,
  ai_analysis JSONB NOT NULL,
  conditions_identified TEXT[],
  severity_level TEXT,
  is_emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  notes TEXT,
  diagnosis TEXT,
  prescription TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor'));

-- User Roles RLS Policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Doctor Credentials RLS Policies
CREATE POLICY "Doctors can view their own credentials"
  ON public.doctor_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own credentials"
  ON public.doctor_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can insert their own credentials"
  ON public.doctor_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified doctor credentials"
  ON public.doctor_credentials FOR SELECT
  USING (verified = TRUE);

-- Patient Medical History RLS Policies
CREATE POLICY "Patients can view their own medical history"
  ON public.patient_medical_history FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own medical history"
  ON public.patient_medical_history FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own medical history"
  ON public.patient_medical_history FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient medical history"
  ON public.patient_medical_history FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor'));

-- Symptom Checks RLS Policies
CREATE POLICY "Users can view their own symptom checks"
  ON public.symptom_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom checks"
  ON public.symptom_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can view all symptom checks"
  ON public.symptom_checks FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor'));

-- Appointments RLS Policies
CREATE POLICY "Patients can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update appointments assigned to them"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = doctor_id);

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_credentials_updated_at
  BEFORE UPDATE ON public.doctor_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_medical_history_updated_at
  BEFORE UPDATE ON public.patient_medical_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_doctor_credentials_user_id ON public.doctor_credentials(user_id);
CREATE INDEX idx_patient_medical_history_patient_id ON public.patient_medical_history(patient_id);
CREATE INDEX idx_symptom_checks_user_id ON public.symptom_checks(user_id);
CREATE INDEX idx_symptom_checks_created_at ON public.symptom_checks(created_at DESC);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);