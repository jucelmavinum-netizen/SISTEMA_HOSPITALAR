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

-- 5. Exams
CREATE TABLE exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'ready')) DEFAULT 'pending',
  requester_id UUID REFERENCES auth.users(id),
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Beds
CREATE TABLE beds (
  id TEXT PRIMARY KEY,
  ward TEXT NOT NULL,
  status TEXT CHECK (status IN ('available', 'occupied', 'cleaning')) DEFAULT 'available',
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Appointments
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Finance Records
CREATE TABLE finance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_records ENABLE ROW LEVEL SECURITY;

-- 9. Consultations
CREATE TABLE consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  triage_id UUID REFERENCES triage_records(id),
  symptoms TEXT,
  diagnosis TEXT,
  prescription TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can access consultations" ON consultations FOR ALL USING (auth.role() = 'authenticated');
