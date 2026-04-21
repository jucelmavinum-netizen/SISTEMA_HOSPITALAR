-- Ensure consultations table has necessary columns and correct FKs
DO $$ 
BEGIN
    -- Fix consultations FKs
    ALTER TABLE IF EXISTS consultations 
    ALTER COLUMN doctor_id DROP NOT NULL;

    -- Fix prescriptions FKs
    ALTER TABLE IF EXISTS prescriptions 
    ALTER COLUMN doctor_id DROP NOT NULL,
    ALTER COLUMN consultation_id DROP NOT NULL;

    -- Ensure clinical_evolutions exists with correct structure
    CREATE TABLE IF NOT EXISTS clinical_evolutions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id UUID REFERENCES profiles(id),
        notes TEXT NOT NULL,
        condition_status TEXT CHECK (condition_status IN ('improving', 'stable', 'worsening', 'critical')),
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS for clinical_evolutions if not already enabled
    ALTER TABLE clinical_evolutions ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can access evolutions') THEN
        CREATE POLICY "Authenticated users can access evolutions" ON clinical_evolutions FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;
