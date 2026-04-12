export type TriageColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

export interface Patient {
  id: string;
  name: string;
  biNumber?: string;
  birthDate: string;
  gender: 'M' | 'F';
  isTemporary?: boolean;
  qrCode?: string;
}

export interface TriageRecord {
  id: string;
  patientId: string;
  timestamp: string;
  vitals: {
    temp: number;
    bp: string;
    heartRate: number;
    oxygen: number;
  };
  classification: TriageColor;
  notes: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  stage: 'Triagem' | 'Consulta' | 'Exames' | 'Farmácia' | 'Alta';
  timestamp: string;
  status: 'pending' | 'in-progress' | 'completed';
}
