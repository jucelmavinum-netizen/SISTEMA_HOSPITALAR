-- SISA ERP Hospitalar - Supabase Schema Definition

-- 1. Profiles (Extends Auth.Users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'doctor', 'nurse', 'reception')),
  hospital_id UUID,
  province TEXT,
  municipality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patients
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  bi_number TEXT UNIQUE,
  birth_date DATE,
  gender CHAR(1),
  process_number TEXT UNIQUE,
  province TEXT,
  municipality TEXT,
  district TEXT,
  financing_type TEXT,
  insurer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. Triage Records
CREATE TABLE triage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  classification TEXT CHECK (classification IN ('red', 'orange', 'yellow', 'green', 'blue')),
  vitals JSONB, -- {temp, bp, hr, o2}
  notes TEXT,
  nurse_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inventory
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  expiry_date DATE,
  hospital_id UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Patients are viewable by authenticated users" ON patients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Inventory viewable by admin and nurse" ON inventory FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  )
);
