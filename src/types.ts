export type TriageColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

export interface Patient {
  id: string;
  name: string;
  biNumber?: string;
  birthDate: string;
  gender: 'M' | 'F';
  isTemporary?: boolean;
  qrCode?: string;
  contact?: string;
  tipo_sanguineo?: string;
  alergias?: string[];
  doencas_cronicas?: string[];
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  dateTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'waiting';
  type: 'Consulta' | 'Retorno' | 'Exame';
}

export interface Exam {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  status: 'pending' | 'processing' | 'ready';
  result?: string;
  date: string;
  requester: string;
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
