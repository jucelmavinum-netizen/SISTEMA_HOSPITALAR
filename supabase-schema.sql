-- SISA ERP Hospitalar - Supabase Schema Definition (Updated with Advanced Medical Features)

-- 1. Profiles (Extends Auth.Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'doctor', 'nurse', 'reception', 'lab_tech', 'pharmacist')),
  hospital_id UUID,
  hospital_name TEXT,
  province TEXT,
  municipality TEXT,
  specialty TEXT, -- For doctors
  license_number TEXT, -- Professional license
  shift TEXT, -- Shift/Duty schedule
  contract_type TEXT CHECK (contract_type IN ('contracted', 'on-call')), -- Vínculo (Contratado/Plantonista)
  status TEXT DEFAULT 'present', -- present, on-call, absent
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patients
CREATE TABLE IF NOT EXISTS patients (
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
  blood_type TEXT,
  allergies TEXT[], -- Array of allergies
  chronic_diseases TEXT[], -- Array of chronic diseases
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 3. Triage Records
CREATE TABLE IF NOT EXISTS triage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  classification TEXT CHECK (classification IN ('red', 'orange', 'yellow', 'green', 'blue')),
  blood_pressure TEXT,
  temperature DECIMAL(4,1),
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(3,2),
  symptoms TEXT,
  nurse_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  expiry_date DATE,
  hospital_id UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Exams
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'ready')) DEFAULT 'pending',
  requester_id UUID REFERENCES profiles(id),
  result TEXT,
  result_file_url TEXT, -- URL for PDF or Image
  technician_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Beds
CREATE TABLE IF NOT EXISTS beds (
  id TEXT PRIMARY KEY,
  ward TEXT NOT NULL,
  status TEXT CHECK (status IN ('available', 'occupied', 'cleaning')) DEFAULT 'available',
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  type TEXT DEFAULT 'Consulta',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Finance Records
CREATE TABLE IF NOT EXISTS finance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT,
  description TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Consultations
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  triage_id UUID REFERENCES triage_records(id),
  symptoms TEXT,
  diagnosis TEXT,
  endemic_disease TEXT, -- For tracking Malaria, Dengue, etc.
  specialty_data JSONB, -- For specialty specific data (Pediatrics, OBGYN, etc.)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  medications JSONB, -- Array of {name, dosage, frequency, duration}
  digital_signature TEXT,
  status TEXT CHECK (status IN ('active', 'dispensed', 'expired')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_evolutions ENABLE ROW LEVEL SECURITY;

-- Policies (Basic Authenticated Access)
-- In production, these should be refined by role
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access profiles') THEN
        CREATE POLICY "Authenticated users can access profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access patients') THEN
        CREATE POLICY "Authenticated users can access patients" ON patients FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access triage') THEN
        CREATE POLICY "Authenticated users can access triage" ON triage_records FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access inventory') THEN
        CREATE POLICY "Authenticated users can access inventory" ON inventory FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access exams') THEN
        CREATE POLICY "Authenticated users can access exams" ON exams FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access beds') THEN
        CREATE POLICY "Authenticated users can access beds" ON beds FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access appointments') THEN
        CREATE POLICY "Authenticated users can access appointments" ON appointments FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access finance') THEN
        CREATE POLICY "Authenticated users can access finance" ON finance_records FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access consultations') THEN
        CREATE POLICY "Authenticated users can access consultations" ON consultations FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access prescriptions') THEN
        CREATE POLICY "Authenticated users can access prescriptions" ON prescriptions FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can access audit logs') THEN
        CREATE POLICY "Admin can access audit logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access evolutions') THEN
        CREATE POLICY "Authenticated users can access evolutions" ON clinical_evolutions FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 12. Clinical Evolutions (PEP - Daily Notes)
CREATE TABLE IF NOT EXISTS clinical_evolutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  notes TEXT NOT NULL,
  condition_status TEXT CHECK (condition_status IN ('improving', 'stable', 'worsening', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Attendance Records (Faltas e Atrasos)
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  type TEXT CHECK (type IN ('absence', 'late')) DEFAULT 'absence',
  reason TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access attendance" ON attendance_records FOR ALL USING (auth.role() = 'authenticated');
