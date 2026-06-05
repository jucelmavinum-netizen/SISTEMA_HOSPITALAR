import React from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Send, 
  Paperclip, 
  User, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  RefreshCcw, 
  FileText, 
  Heart, 
  Activity, 
  X, 
  FileSpreadsheet, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import Modal from './ui/Modal';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface TeleConsultation {
  id: string;
  patient_name: string;
  patient_id: string;
  specialty: string;
  time: string;
  date: string;
  gender: string;
  birth_date: string;
  blood_type: string;
  allergies: string;
  chronic_diseases: string;
  emergency_contact: string;
  status: 'espera' | 'conectado' | 'atendimento' | 'finalizado';
}

export default function Telemedicine() {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeSubView, setActiveSubView] = React.useState<'dashboard' | 'active_consultation'>('dashboard');
  
  // Tables state from Supabase
  const [allPatients, setAllPatients] = React.useState<any[]>([]);
  const [waitingList, setWaitingList] = React.useState<TeleConsultation[]>([]);
  const [historyList, setHistoryList] = React.useState<any[]>([]);
  
  // Selected patient for active consultation
  const [activePatient, setActivePatient] = React.useState<TeleConsultation | null>(null);
  
  // Filter states
  const [historySearch, setHistorySearch] = React.useState('');
  const [historySpecialtyFilter, setHistorySpecialtyFilter] = React.useState('all');
  
  // Video room interactive states
  const [isMicOn, setIsMicOn] = React.useState(true);
  const [isCamOn, setIsCamOn] = React.useState(true);
  const [isPatientCamOn, setIsPatientCamOn] = React.useState(true);
  const [consultationTimer, setConsultationTimer] = React.useState(0);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);
  
  // Chat state inside Virtual Room
  const [chatInput, setChatInput] = React.useState('');
  const [chatMessages, setChatMessages] = React.useState<Array<{
    sender: 'doctor' | 'patient' | 'system';
    text: string;
    time: string;
  }>>([]);
  
  // Prescription Writer State
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = React.useState(false);
  const [prescriptionMeds, setPrescriptionMeds] = React.useState<Medication[]>([]);
  const [newMedName, setNewMedName] = React.useState('');
  const [newMedDosage, setNewMedDosage] = React.useState('');
  const [newMedFrequency, setNewMedFrequency] = React.useState('');
  const [digitalSignature, setDigitalSignature] = React.useState('');
  
  // Diagnosis clinical notes
  const [clinicalNotes, setClinicalNotes] = React.useState({
    symptoms: 'Fadiga crônica, palpitações leves e cefaleia ocasional descrita em teleconsulta.',
    diagnosis: '',
    recommendations: '',
    saveError: '',
    saveSuccess: false
  });

  // Exam clinical request State
  const [isExamModalOpen, setIsExamModalOpen] = React.useState(false);
  const [examType, setExamType] = React.useState('');
  const [examPriority, setExamPriority] = React.useState('routine');
  const [examNotes, setExamNotes] = React.useState('');
  const [examSavesuccess, setExamSaveSuccess] = React.useState(false);

  // New consultation schedule form
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [doctors, setDoctors] = React.useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = React.useState({
    patientId: '',
    doctorId: '',
    specialty: 'Clínica Geral',
    date: new Date().toISOString().split('T')[0],
    time: '14:00'
  });

  // Reschedule state
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = React.useState(false);
  const [rescheduleForm, setRescheduleForm] = React.useState({
    id: '',
    patientName: '',
    date: '',
    time: ''
  });

  const handleOpenReschedule = (item: TeleConsultation) => {
    setRescheduleForm({
      id: item.id,
      patientName: item.patient_name,
      date: item.date || new Date().toISOString().split('T')[0],
      time: item.time || '14:00'
    });
    setIsRescheduleModalOpen(true);
  };

  const handleSaveReschedule = async () => {
    try {
      if (!rescheduleForm.date || !rescheduleForm.time) {
        alert("Por favor, preencha a data e o horário.");
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: rescheduleForm.date,
          appointment_time: rescheduleForm.time
        })
        .eq('id', rescheduleForm.id);

      if (error) {
        throw error;
      }

      alert("Teleconsulta reagendada com sucesso!");
      setIsRescheduleModalOpen(false);
      await fetchTeleConsultations();
    } catch (err: any) {
      console.error("Error rescheduling:", err);
      alert("Erro ao reagendar teleconsulta: " + err.message);
    }
  };

  const handleCancelTeleconsultation = async (id: string) => {
    if (!window.confirm("Deseja realmente cancelar esta teleconsulta agendada?")) {
      return;
    }
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      alert("Teleconsulta cancelada com sucesso!");
      await fetchTeleConsultations();
    } catch (err: any) {
      console.error("Error cancelling teleconsultation:", err);
      alert("Erro ao cancelar teleconsulta: " + err.message);
    }
  };

  const fetchTeleConsultations = async () => {
    try {
      const { data: apps, error: appError } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            id,
            full_name,
            gender,
            birth_date,
            blood_type,
            allergies,
            chronic_diseases,
            emergency_contact
          )
        `)
        .eq('type', 'Telemedicina')
        .order('appointment_date', { ascending: true });

      if (appError) {
        throw appError;
      }

      if (apps) {
        const mappedList: TeleConsultation[] = apps.map((app: any) => {
          const mapStatus = (s: string) => {
            if (s === 'scheduled') return 'espera';
            if (s === 'in_progress' || s === 'completed_at_tele') return 'conectado';
            if (s === 'completed') return 'finalizado';
            return 'espera';
          };

          const pat = app.patients || {};
          const patGender = pat.gender === 'male' || pat.gender === 'M' || pat.gender === 'Masculino' ? 'Masculino' : 
                            pat.gender === 'female' || pat.gender === 'F' || pat.gender === 'Feminino' ? 'Feminino' : 'Não informado';

          return {
            id: app.id,
            patient_name: pat.full_name || 'Paciente sem Nome',
            patient_id: pat.id || app.patient_id,
            specialty: app.notes || 'Clínica Geral',
            time: app.appointment_time || '12:00',
            date: app.appointment_date || '',
            gender: patGender,
            birth_date: pat.birth_date || 'Não informada',
            blood_type: pat.blood_type || 'O+',
            allergies: pat.allergies || pat.alergias || 'Nenhuma declarada',
            chronic_diseases: pat.chronic_diseases || pat.doencas_cronicas || 'Nenhuma reportada',
            emergency_contact: pat.emergency_contact || '+244 923 000 000',
            status: mapStatus(app.status)
          };
        });

        setWaitingList(mappedList);
      }
    } catch (err) {
      console.error('Error loading teleconsultations:', err);
    }
  };

  // Load patient list and profile data from Supabase DB on initiation
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          setCurrentUser(profile || authUser);
          
          // Seed digital signature default
          setDigitalSignature(`DR(A). ${profile?.full_name?.toUpperCase() || authUser.email?.split('@')[0].toUpperCase()} - RE: ${Math.floor(Math.random() * 89999) + 10000}/AO`);
        }
        
        // Fetch real patients from SISA
        const { data: patientsDb, error: pError } = await supabase
          .from('patients')
          .select('*')
          .order('full_name');
          
        if (patientsDb && patientsDb.length > 0) {
          setAllPatients(patientsDb);
        } else {
          // If no patients exist, populate typical SISA Patients fallback
          setAllPatients([
            { id: 'p-1', full_name: 'António Francisco Manuel', gender: 'male', birth_date: '1984-05-12', province: 'Luanda', bi_number: '00329188LA045' },
            { id: 'p-2', full_name: 'Maria Domingos João', gender: 'female', birth_date: '1998-11-20', province: 'Bengo', bi_number: '00732111BG092' },
            { id: 'p-3', full_name: 'Sebastião Neto Luamba', gender: 'male', birth_date: '1976-02-28', province: 'Huambo', bi_number: '00129288HA022' },
            { id: 'p-4', full_name: 'Helena Bartolomeu de Sousa', gender: 'female', birth_date: '2001-08-04', province: 'Zaire', bi_number: '00921233ZR051' }
          ]);
        }

        // Fetch Doctors profiles
        const { data: docsDb } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'doctor');
        if (docsDb) {
          setDoctors(docsDb);
        }
        
        // Load Consultations History
        const { data: consults, error: hError } = await supabase
          .from('consultations')
          .select('*, patients(full_name)')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (consults) {
          setHistoryList(consults);
        }

        // Fetch real Telemedicine Consultations
        await fetchTeleConsultations();
      } catch (e) {
        console.error("Error fetching patient details:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Consultation timeline timer ticking simulation
  React.useEffect(() => {
    let interval: any = null;
    if (activeSubView === 'active_consultation') {
      interval = setInterval(() => {
        setConsultationTimer(prev => prev + 1);
      }, 1000);
    } else {
      setConsultationTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeSubView]);

  // Handle formatted timer output
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Switch views and enter Virtual Consultation Room
  const startConsultation = async (item: TeleConsultation) => {
    // Select patient
    setActivePatient(item);
    
    // Update patient status in waiting list
    setWaitingList(prev => prev.map(p => p.id === item.id ? { ...p, status: 'atendimento' } : p));
    
    try {
      await supabase
        .from('appointments')
        .update({ status: 'in_progress' })
        .eq('id', item.id);
    } catch (e) {
      console.error("Error starting consultation in DB:", e);
    }
    
    // Prepare initial interactive chat logs
    setChatMessages([
      { sender: 'system', text: 'Sessão de Telemedicina encriptada conectada com SISA Wellness App (Mobile).', time: '13:42' },
      { sender: 'system', text: 'Câmara e microfone do paciente estabelecidos com estabilidade excelente.', time: '13:42' },
      { sender: 'patient', text: `Olá Doutor(a), boa tarde! Consigo ouvir-te bem.`, time: '13:43' },
    ]);
    
    // Clear clinical forms
    setClinicalNotes({
      symptoms: 'Fadiga crônica, palpitações leves e cefaleia ocasional descrita em teleconsulta.',
      diagnosis: '',
      recommendations: '',
      saveError: '',
      saveSuccess: false
    });
    setPrescriptionMeds([]);
    setExamSaveSuccess(false);

    // Enter full active visual view
    setActiveSubView('active_consultation');
    setConsultationTimer(0);
  };

  // Simulated Chat response
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const timeNow = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    
    const userMessage = {
      sender: 'doctor' as const,
      text: chatInput,
      time: timeNow
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Trigger smart patient response simulation
    setTimeout(() => {
      const patientResponses = [
        "Sim, entendo perfeitamente. Tenho tomado os comprimidos à hora certa.",
        "A dor de cabeça é mais forte no final do dia, doutor.",
        "Já fiz os exames de sangue no mês passado mas os resultados deram normais.",
        "Muito obrigado, vou aguardar a receita digital aqui no meu aplicativo SISA Wellness.",
        "Certo, farei o repouso recomendado de 3 dias."
      ];
      const randomResponse = patientResponses[Math.floor(Math.random() * patientResponses.length)];
      
      setChatMessages(prev => [...prev, {
        sender: 'patient' as const,
        text: randomResponse,
        time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  // Calculate stats values
  const totalWaiting = waitingList.filter(p => p.status === 'espera').length;
  const completedCount = waitingList.filter(p => p.status === 'finalizado').length;
  const inServiceCount = waitingList.filter(p => p.status === 'atendimento' || p.status === 'conectado').length;

  // Add medication to the current digital prescription
  const handleAddMedication = () => {
    if (!newMedName.trim() || !newMedDosage.trim()) return;
    const med: Medication = {
      name: newMedName,
      dosage: newMedDosage,
      frequency: newMedFrequency || '1x ao dia, de 12 em 12 horas'
    };
    setPrescriptionMeds(prev => [...prev, med]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFrequency('');
  };

  // Remove medication from active layout prescription
  const handleRemoveMedication = (index: number) => {
    setPrescriptionMeds(prev => prev.filter((_, i) => i !== index));
  };

  // Save the full Clinical Notes/Consent form to Supabase Database
  const submitClinicalNotes = async () => {
    if (!activePatient) return;
    if (!clinicalNotes.diagnosis.trim()) {
      setClinicalNotes(prev => ({ ...prev, saveError: 'Insira o diagnóstico antes de registrar o atendimento.' }));
      return;
    }

    setClinicalNotes(prev => ({ ...prev, saveError: '', saveSuccess: false }));

    try {
      const doctorId = currentUser?.id || '00000000-0000-0000-0000-000000000000';
      
      // Save consultation entry
      const { data: consData, error: insertError } = await supabase
        .from('consultations')
        .insert([{
          patient_id: activePatient.patient_id,
          doctor_id: doctorId,
          symptoms: clinicalNotes.symptoms,
          diagnosis: clinicalNotes.diagnosis,
          notes: clinicalNotes.recommendations || 'Teleconsulta realizada com acompanhamento remoto por video-chamada.'
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Also save clinical evolution record if table exists
      try {
        await supabase
          .from('clinical_evolutions')
          .insert([{
            patient_id: activePatient.patient_id,
            doctor_id: doctorId,
            evolution_notes: `Paciente atendido via TELEMEDICINA (SISA Wellness).\nDiagnóstico: ${clinicalNotes.diagnosis}\nStatus: Estável.`,
            condition_status: 'stable',
            notes: clinicalNotes.recommendations
          }]);
      } catch (evoErr) {
        console.warn("Could not insert clinical evolution, might not be configured, bypassing", evoErr);
      }

      setClinicalNotes(prev => ({ ...prev, saveSuccess: true }));
      
      // Push into historical logs
      setHistoryList(prev => [
        {
          id: consData?.id || Math.random().toString(),
          patient_id: activePatient.patient_id,
          diagnosis: clinicalNotes.diagnosis,
          symptoms: clinicalNotes.symptoms,
          created_at: new Date().toISOString(),
          patients: { full_name: activePatient.patient_name }
        },
        ...prev
      ]);

      // Highlight the notification visually
      setChatMessages(prev => [...prev, {
        sender: 'system',
        text: `Diagnóstico gravado com sucesso no prontuário eletrônico do paciente: "${clinicalNotes.diagnosis}"`,
        time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err: any) {
      setClinicalNotes(prev => ({ ...prev, saveError: err.message || 'Erro ao comunicar com a base de dados.' }));
    }
  };

  // Save digital prescription specifically
  const submitDigitalPrescription = async () => {
    if (!activePatient || prescriptionMeds.length === 0) return;

    try {
      const doctorId = currentUser?.id || '00000000-0000-0000-0000-000000000000';
      
      const { error: prescError } = await supabase
        .from('prescriptions')
        .insert([{
          patient_id: activePatient.patient_id,
          doctor_id: doctorId,
          medications: prescriptionMeds,
          status: 'active',
          digital_signature: digitalSignature || 'Assinado digitalmente via SISA Telemedicina'
        }]);

      if (prescError) throw prescError;

      setIsPrescriptionModalOpen(false);
      
      setChatMessages(prev => [...prev, {
        sender: 'system',
        text: `Receita Digital emitida e assinada. (${prescriptionMeds.length} Medicamentos salvos e sincronizados com SISA Wellness).`,
        time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      alert('Erro ao emitir receita: ' + err.message);
    }
  };

  // Save scientific exam request
  const submitExamRequest = async () => {
    if (!activePatient || !examType) return;
    setExamSaveSuccess(false);

    try {
      const doctorId = currentUser?.id || '00000000-0000-0000-0000-000000000000';
      
      const { error: examErr } = await supabase
        .from('exams')
        .insert([{
          patient_id: activePatient.patient_id,
          exam_type: examType,
          requester_id: doctorId,
          status: 'pending',
          priority: examPriority,
          notes: examNotes || 'Solicitação efetuada em sessão de teleconsulta via videoconferência'
        }]);

      if (examErr) throw examErr;

      setExamSaveSuccess(true);
      setTimeout(() => {
        setIsExamModalOpen(false);
        setExamSaveSuccess(false);
        setExamType('');
        setExamNotes('');
      }, 1000);

      setChatMessages(prev => [...prev, {
        sender: 'system',
        text: `Solicitado exame de laboratório: ${examType} (${examPriority.toUpperCase()}). Sincronizado com laboratório da unidade.`,
        time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err: any) {
      alert('Erro ao solicitar exame: ' + err.message);
    }
  };

  // Schedule a future telemedicine call
  const handleScheduleConsultation = async () => {
    try {
      const p = allPatients.find(x => x.id === scheduleForm.patientId);
      if (!p) return;

      // Determine a valid doctor_id
      let finalDoctorId = scheduleForm.doctorId || (currentUser?.role === 'doctor' ? currentUser.id : null);
      if (!finalDoctorId && doctors.length > 0) {
        finalDoctorId = doctors[0].id;
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: p.id,
          doctor_id: finalDoctorId,
          appointment_date: scheduleForm.date,
          appointment_time: scheduleForm.time,
          status: 'scheduled',
          type: 'Telemedicina',
          notes: scheduleForm.specialty
        }]);

      if (error) {
        throw error;
      }

      alert('Consulta agendada com sucesso no banco de dados!');
      setIsScheduleModalOpen(false);
      
      // Reload telemedicine appointments from DB
      await fetchTeleConsultations();
    } catch (err: any) {
      console.error('Error scheduling teleconsultation:', err);
      alert('Erro ao agendar teleconsulta: ' + err.message);
    }
  };

  // Close live camera/audio conference
  const handleEndCall = async () => {
    if (!activePatient) return;
    
    const patientIdToUpdate = activePatient.id;

    // Set status as finalizado locally
    setWaitingList(prev => prev.map(p => p.id === patientIdToUpdate ? { ...p, status: 'finalizado' } : p));
    
    try {
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', patientIdToUpdate);
        
      await fetchTeleConsultations();
    } catch (e) {
      console.error("Error finalizing appointment in DB:", e);
    }
    
    // Exit consultation screen back to core screen
    setActiveSubView('dashboard');
    setActivePatient(null);
  };

  // Calculate stats and counts
  const filteredHistory = historyList.filter(item => {
    const patientName = item.patients?.full_name || '';
    const matchesSearch = patientName.toLowerCase().includes(historySearch.toLowerCase()) || 
                          (item.diagnosis && item.diagnosis.toLowerCase().includes(historySearch.toLowerCase()));
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 min-h-[400px]">
        <RefreshCcw className="w-8 h-8 text-navy animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Carregando painel de telemedicina...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Dynamic Navigation Title and Subtitles */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
            <Video className="w-7 h-7 text-emerald" /> Telemedicina
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Centro de atendimento e consultas remotas integradas com o aplicativo de bem-estar SISA Wellness.
          </p>
        </div>
        
        {activeSubView === 'dashboard' && (
          <button 
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-navy hover:bg-navy/90 text-white font-bold text-xs py-3 px-6 rounded-2xl flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-md shadow-navy/10 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Agendar Teleconsulta
          </button>
        )}
      </div>

      {activeSubView === 'dashboard' ? (
        <div className="space-y-8">
          {/* Superior Interactive Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Consultas Virtuais Hoje', value: waitingList.length + completedCount, description: 'Sessões programadas', trend: 'Alta atividade', color: 'text-indigo-600', bg: 'bg-indigo-50/50 border-indigo-100/40' },
              { label: 'Pacientes em Espera', value: totalWaiting, description: 'Aguardando chamada', trend: 'Sala Virtual ativa', color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100/40' },
              { label: 'Em Atendimento', value: inServiceCount, description: 'Conferências ao vivo', trend: 'Médicos ocupados', color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100/40' },
              { label: 'Consultas Concluídas', value: completedCount, description: 'Diagnósticos emitidos', trend: 'Prontuários atualizados', color: 'text-slate-600', bg: 'bg-slate-50/50 border-slate-100/40' }
            ].map((stat, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-6 rounded-3xl bg-white border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-100/50 transition-all",
                  stat.bg
                )}
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                  <span className={cn("text-3xl font-black block tracking-tight", stat.color)}>{stat.value}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-400 border-t border-slate-50/10 pt-3">
                  <span>{stat.description}</span>
                  <span className="text-emerald font-bold">&bull; {stat.trend}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT 2 COLUMNS: Waiting list and Pending schedule list */}
            <div className="lg:col-span-2 space-y-8">
              {/* Waiting List Section */}
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Fila de Atendimento do Médico</h4>
                      <p className="text-[11px] text-slate-400">Pacientes do SISA Wellness integrados prontos para vídeo chamadas.</p>
                    </div>
                  </div>
                  <span className="bg-rose-50 text-rose-600 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full">
                    {totalWaiting} aguardando
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest pl-6">Paciente</th>
                        <th className="p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Especialidade</th>
                        <th className="p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Horário</th>
                        <th className="p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                        <th className="p-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest pr-6">Opções</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {waitingList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 text-xs font-semibold">
                            Nenhum paciente aguardando na fila no momento.
                          </td>
                        </tr>
                      ) : (
                        waitingList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-navy/5 rounded-xl flex items-center justify-center text-navy font-black text-xs uppercase">
                                  {item.patient_name.slice(0, 2)}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-slate-900 block group-hover:text-navy transition-colors">{item.patient_name}</span>
                                  <span className="text-[10px] text-slate-400 mt-0.5 block">{item.gender}, {item.birth_date}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-medium text-slate-600 bg-slate-100 py-1 px-3 rounded-xl">{item.specialty}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {item.time}
                              </div>
                            </td>
                            <td className="p-4">
                              {item.status === 'espera' && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-100/50">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Em Espera
                                </span>
                              )}
                              {item.status === 'atendimento' && (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100/50">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Ao Vivo
                                </span>
                              )}
                              {item.status === 'finalizado' && (
                                <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                                  Concluído
                                </span>
                              )}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              {item.status === 'espera' ? (
                                <button
                                  onClick={() => startConsultation(item)}
                                  className="bg-emerald hover:bg-emerald/90 text-white font-bold text-[11px] uppercase tracking-wider py-2 px-4 rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer shadow-md shadow-emerald/10 transition-all hover:-translate-y-0.5 active:scale-95"
                                >
                                  <Video className="w-3.5 h-3.5" /> Iniciar Consulta
                                </button>
                              ) : item.status === 'atendimento' ? (
                                <button
                                  onClick={() => setActiveSubView('active_consultation')}
                                  className="bg-navy hover:bg-navy/90 text-white font-bold text-[11px] uppercase tracking-wider py-2 px-4 rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer"
                                >
                                  <Activity className="w-3.5 h-3.5" /> Restaurar Sala
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 block font-bold">Encerrado</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* upcoming teleconsultations schedule view */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Próximas Teleconsultas Agendadas</h4>
                    <p className="text-[11px] text-slate-400">Próximos dias planejados pendentes de aprovação pelo SISA Wellness.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {waitingList.filter(item => item.status === 'espera').length === 0 ? (
                    <div className="col-span-2 p-8 text-center text-slate-400 bg-slate-50/25 border border-slate-100 rounded-2xl">
                      <p className="text-xs font-semibold">Nenhuma próxima teleconsulta agendada no sistema.</p>
                      <button 
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="mt-3 text-xs text-indigo-600 hover:text-indigo-750 font-bold underline"
                      >
                        Agendar Primeira Teleconsulta
                      </button>
                    </div>
                  ) : (
                    waitingList.filter(item => item.status === 'espera').map((elem) => (
                      <div key={elem.id} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/20 space-y-4 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-950 block">{elem.patient_name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">SISA Telemedicina &bull; {elem.specialty}</span>
                          </div>
                          <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase tracking-wide shrink-0">
                            Previsão Ativa
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {elem.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {elem.time}</span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[10px]">
                          <button 
                            onClick={() => handleOpenReschedule(elem)}
                            className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-center cursor-pointer transition-colors"
                          >
                            Reagendar
                          </button>
                          <button 
                            onClick={() => handleCancelTeleconsultation(elem.id)}
                            className="flex-1 py-1.5 px-3 rounded-lg border border-red-50 hover:bg-red-50 text-red-600 font-bold text-center cursor-pointer transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: History with functional search and details */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
                      <FileText className="w-4.5 h-4.5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Histórico Clinico</h4>
                      <p className="text-[10px] text-slate-400">Últimos atendimentos gravados.</p>
                    </div>
                  </div>
                </div>

                {/* Filter and search bar for history */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome ou diagnóstico..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-100 focus:outline-none focus:border-navy text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto no-scrollbar">
                  {filteredHistory.length === 0 ? (
                    <p className="text-center text-slate-400 py-6 text-[11px] font-bold">Nenhum histórico encontrado com esse filtro.</p>
                  ) : (
                    filteredHistory.map((h, index) => (
                      <div key={index} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/20 space-y-2 hover:bg-slate-50/50 transition-all flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-black text-slate-950 block truncate max-w-[120px]">
                            {h.patients?.full_name || 'Paciente Geral'}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-bold shrink-0">
                            {new Date(h.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-indigo-600 tracking-tight">
                          Diagnóstico: <span className="text-slate-700 font-medium">{h.diagnosis || 'Sem diagnóstico formal'}</span>
                        </div>
                        {h.symptoms && (
                          <div className="text-[10px] text-slate-400 italic font-medium truncate">
                            " {h.symptoms} "
                          </div>
                        )}
                        <span className="text-[9px] font-black tracking-widest uppercase text-emerald mt-1 inline-block align-middle">
                          &bull; RECEITA ASSOCIADA
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Patient App integration tutorial visual block */}
              <div className="bg-gradient-to-br from-navy to-blue-900 rounded-3xl p-6 text-white space-y-4 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 -mr-6 -mb-6">
                  <Video className="w-40 h-40" />
                </div>
                
                <span className="text-[9px] font-black bg-emerald text-white tracking-widest px-3 py-1 rounded-full uppercase">
                  SISA Wellness Integration Mode
                </span>
                <h4 className="text-sm font-black uppercase tracking-tight pt-1">Fluxo Mobile Integrado</h4>
                
                <ul className="space-y-2 text-[11px] font-medium text-slate-200">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald font-bold">✓</span>
                    <span>Paciente solicita e agenda a sessão direto de casa no SISA Wellness App.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald font-bold">✓</span>
                    <span>O sistema notifica em tempo real e lista o paciente na Fila do Médico.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald font-bold">✓</span>
                    <span>Após a consulta, a prescrição e os prontuários são disponibilizados no app do paciente de forma imediata e assinada digitalmente.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIRTUAL CONSULTATION SCREEN ACTIVE */
        activePatient && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LARGE LEFT BLOCK: 2/3 COLUMN holding VC grids and Interactive Live Chat */}
            <div className="lg:col-span-2 space-y-6">
              {/* VIDEO ROOM CALL CONTAINER */}
              <div className="bg-slate-950 rounded-3xl overflow-hidden relative shadow-2xl border border-slate-900 h-[480px] flex flex-col justify-between">
                
                {/* Top Video Header bar */}
                <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-slate-950/80 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-white text-xs font-black tracking-widest uppercase bg-slate-900/40 px-3 py-1 rounded-md backdrop-blur-sm">
                      Consulta ao Vivo: {activePatient.patient_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-emerald text-xs font-bold bg-emerald/10 px-3 py-1 rounded-md backdrop-blur-sm border border-emerald/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> {formatTime(consultationTimer)}
                    </span>
                    <span className="bg-slate-900/60 text-white text-[11px] font-medium px-3 py-1 rounded-md">
                      Rede Excelente (42ms)
                    </span>
                  </div>
                </div>

                {/* VIDEO CONFERENCING GRID */}
                <div className="flex-1 flex items-center justify-center relative bg-slate-900">
                  {/* REMOTE PATIENT CAM SCREEN */}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    {isPatientCamOn ? (
                      /* Mock patient visual video avatar simulation container */
                      <div className="w-full h-full relative flex items-center justify-center">
                        {/* Interactive dynamic sound heartbeat scale in the background of avatar */}
                        <div className="absolute inset-x-0 bottom-16 h-28 flex items-center justify-center gap-1 opacity-25">
                          {[1,2,3,4,3,2,1,2,3,4,5,6,5,4,3,2,3,4,3,2,1].map((n, i) => (
                            <motion.div 
                              key={i} 
                              className="w-1.5 rounded-full bg-emerald"
                              animate={{ height: [`${n * 4}px`, `${n * 14}px`, `${n * 4}px`] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.05 }}
                            />
                          ))}
                        </div>

                        <div className="text-center space-y-4 z-10">
                          <div className="w-28 h-28 bg-emerald/10 border-2 border-emerald rounded-full flex items-center justify-center shadow-2xl relative mx-auto">
                            <span className="text-3xl font-black text-white">{activePatient.patient_name.slice(0, 2)}</span>
                            <div className="absolute right-0 bottom-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-slate-900">
                              <span className="w-2.5 h-2.5 bg-white rounded-full block animate-ping" />
                            </div>
                          </div>
                          <div>
                            <p className="text-white text-sm font-black uppercase tracking-wider">{activePatient.patient_name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Paciente Móvel connected via WiFi de Angola Telecom</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <VideoOff className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                        <p className="text-slate-400 text-xs font-bold">Câmara do Paciente Desligada</p>
                      </div>
                    )}
                  </div>

                  {/* DOCTOR SMALL SELF PHOTO CARD Overlay on corner */}
                  <div className="absolute bottom-6 right-6 w-44 h-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-2xl z-20 transition-all hover:scale-105">
                    {isCamOn ? (
                      <div className="w-full h-full bg-slate-800 flex flex-col justify-between p-3 relative">
                        {/* Dynamic self mic volume feedback */}
                        <div className="absolute right-3 top-3 flex items-center gap-0.5">
                          {isMicOn ? (
                            <span className="text-[10px] text-emerald bg-emerald/15 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <Mic className="w-2.5 h-2.5" /> Áudio Ativo
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-500 bg-rose-500/15 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <MicOff className="w-2.5 h-2.5" /> Silenciado
                            </span>
                          )}
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-10 h-10 bg-navy text-white rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                            DR
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-350 font-black tracking-widest uppercase">VOCÊ (MÉDICO)</p>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-950 flex items-center justify-center p-4">
                        <VideoOff className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* BOTTOM MEDIA AND ROOM CONTROLS BAR */}
                <div className="p-6 bg-slate-950 border-t border-slate-900/60 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                        isMicOn ? "bg-slate-850 hover:bg-slate-800 text-white" : "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                      )}
                    >
                      {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>
                    
                    <button 
                      onClick={() => setIsCamOn(!isCamOn)}
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                        isCamOn ? "bg-slate-850 hover:bg-slate-800 text-white" : "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                      )}
                    >
                      {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsScreenSharing(!isScreenSharing);
                        setChatMessages(prev => [...prev, {
                          sender: 'system',
                          text: isScreenSharing ? 'Compartilhamento de ecrã encerrado pelo médico.' : 'Médico iniciou compartilhamento do ecrã clínico.',
                          time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
                        }]);
                      }}
                      className={cn(
                        "font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer",
                        isScreenSharing ? "bg-emerald text-white" : "bg-slate-850 hover:bg-slate-850 text-slate-300"
                      )}
                    >
                      {isScreenSharing ? '✓ Compartilhando Tela' : 'Compartilhar Tela'}
                    </button>
                    
                    <button
                      onClick={() => {
                        alert("Simulado: Envie exames ou relatórios de referência.");
                      }}
                      className="w-11 h-11 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>

                  <button 
                    onClick={handleEndCall}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20 hover:-translate-y-0.5 cursor-pointer active:scale-95"
                  >
                    <PhoneOff className="w-4 h-4" /> Encerrar Chamada
                  </button>
                </div>
              </div>

              {/* LIVE CLINICAL CHAT AREA */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 flex flex-col h-[320px]">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Chat Permanente da Teleconsulta</span>
                
                {/* Chat items list wrapper */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar text-xs">
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed flex flex-col space-y-0.5",
                        msg.sender === 'doctor' 
                          ? "bg-navy text-white ml-auto rounded-tr-none" 
                          : msg.sender === 'patient' 
                          ? "bg-slate-100 text-slate-800 mr-auto rounded-tl-none"
                          : "bg-slate-50 text-slate-500 text-center italic mx-auto border border-slate-100 py-1.5 px-4 font-medium"
                      )}
                    >
                      <span className="font-medium">{msg.text}</span>
                      <span className={cn("text-[9px] block text-right font-black opacity-60 self-end", msg.sender === 'doctor' ? "text-white/80" : "text-slate-400")}>
                        {msg.time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Input area */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Escreva uma mensagem para enviar ao smartphone do paciente..."
                    className="flex-1 bg-slate-50 border border-transparent focus:bg-white focus:border-navy rounded-xl px-4 py-3 outline-none text-xs text-slate-850"
                  />
                  <button 
                    onClick={sendChatMessage}
                    className="bg-emerald hover:bg-emerald/90 text-white p-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald/10"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGT SPLIT PANEL: PATIENT CLINICAL RESUME */}
            <div className="space-y-6">
              {/* Card visual profile */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-navy text-white rounded-2xl flex items-center justify-center font-black uppercase shadow-lg shadow-navy/10 text-sm">
                    {activePatient.patient_name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">{activePatient.patient_name}</h3>
                    <p className="text-[10px] text-slate-400">Gênero: {activePatient.gender} &bull; {activePatient.birth_date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50/50 rounded-xl space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Grupo Sanguíneo</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {activePatient.blood_type}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50/50 rounded-xl space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Contacto Emergência</span>
                    <span className="font-bold text-slate-900 block truncate">{activePatient.emergency_contact.split(" ")[1]}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> ALERGIAS REGISTRADAS
                    </span>
                    <p className="text-xs font-bold text-slate-800 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/40">
                      {activePatient.allergies}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1 border-b border-dashed border-slate-100 pb-1">
                      DOENÇAS CRÔNICAS
                    </span>
                    <p className="text-xs font-semibold text-slate-700">
                      {activePatient.chronic_diseases}
                    </p>
                  </div>
                </div>
              </div>

              {/* MEDS & CONSULT LOGS HISTORY RESUME */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Histórico Rápido do Paciente</span>
                
                <div className="space-y-3 text-[11px] font-medium text-slate-700">
                  <div className="flex items-start justify-between bg-slate-50/40 p-3 rounded-2xl border border-slate-100/40">
                    <div>
                      <span className="font-black text-slate-900 block">Última Consulta Física</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Dr. Manuel Neto - Triagem Dinâmica</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-bold">12/04/2026</span>
                  </div>

                  <div className="flex items-start justify-between bg-slate-50/40 p-3 rounded-2xl border border-slate-100/40">
                    <div>
                      <span className="font-black text-slate-900 block">Exame de Hemograma Completo</span>
                      <span className="text-[10px] text-emerald block mt-0.5">Pronto para visualizar</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-bold">14/04/2026</span>
                  </div>

                  <div className="flex items-start justify-between bg-slate-50/40 p-3 rounded-2xl border border-slate-100/40">
                    <div>
                      <span className="font-black text-slate-900 block">Medicação Ativa Cadastrada</span>
                      <span className="text-[10px] text-slate-450 block mt-0.5">Enalapril 20mg - 1x ao dia</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold">Ativo</span>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE DOCTOR CLINICAL DECISIONS */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ações Clínicas de Telemedicina</span>
                
                {/* Clinical textfields directly inside pane */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Escreva Diagnóstico Principal</label>
                    <textarea 
                      value={clinicalNotes.diagnosis}
                      onChange={(e) => setClinicalNotes({ ...clinicalNotes, diagnosis: e.target.value, saveSuccess: false })}
                      rows={2}
                      placeholder="Ex: Hipertensão essencial controlada, Cefaleia tensional ligeira..."
                      className="w-full text-xs p-3 border border-slate-150 focus:outline-none focus:border-navy rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Recomendações e Observações</label>
                    <textarea 
                      value={clinicalNotes.recommendations}
                      onChange={(e) => setClinicalNotes({ ...clinicalNotes, recommendations: e.target.value, saveSuccess: false })}
                      rows={2}
                      placeholder="Ex: Aumentar ingestão de líquidos, repousar..."
                      className="w-full text-xs p-3 border border-slate-150 focus:outline-none focus:border-navy rounded-xl"
                    />
                  </div>

                  {clinicalNotes.saveError && (
                    <p className="text-rose-500 text-[11px] font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {clinicalNotes.saveError}
                    </p>
                  )}

                  {clinicalNotes.saveSuccess && (
                    <p className="text-emerald text-[11px] font-bold flex items-center gap-1.5 animate-bounce">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Diagnóstico salvo no SISA!
                    </p>
                  )}

                  <button
                    onClick={submitClinicalNotes}
                    className="w-full bg-navy py-3 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wide transition-all hover:bg-navy/95 cursor-pointer shadow-md shadow-navy/10 active:scale-95"
                  >
                    Registrar Diagnóstico e Prontuário
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setIsPrescriptionModalOpen(true);
                      setPrescriptionMeds([]);
                    }}
                    className="py-3 px-3 rounded-xl border border-indigo-150 hover:bg-indigo-50/50 text-indigo-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 shrink-0" /> Receita Digital
                  </button>

                  <button 
                    onClick={() => {
                      setIsExamModalOpen(true);
                    }}
                    className="py-3 px-3 rounded-xl border border-emerald-150 hover:bg-emerald-50/50 text-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 shrink-0" /> Requisitar Exame
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* --- CLINICAL MODALS --- */}
      
      {/* 1. EMITIR RECEITA DIGITAL MODAL */}
      <Modal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        title="Novo Receituário Digital SISA"
        className="max-w-xl"
      >
        <div className="space-y-6">
          <div className="p-4 bg-navy/[0.02] border border-navy/5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Paciente</span>
              <span className="text-xs font-bold text-slate-900 block">{activePatient?.patient_name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Metodologia</span>
              <span className="text-xs font-bold text-indigo-600 block">Sincronização Wellness</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1">Medicamentos Receitados</h4>
            
            <div className="space-y-2 max-h-[140px] overflow-y-auto no-scrollbar">
              {prescriptionMeds.length === 0 ? (
                <p className="text-center text-slate-400 text-[11px] font-semibold py-4">Nenhum medicamento adicionado ainda.</p>
              ) : (
                prescriptionMeds.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-indigo-50 bg-indigo-50/10 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{m.dosage} &bull; {m.frequency}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveMedication(i)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded outline-none transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Medicamento</label>
                <input 
                  type="text"
                  placeholder="Ex: Paracetamol 500mg"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-150 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Dosagem</label>
                <input 
                  type="text"
                  placeholder="Ex: 1 comprimido"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-150 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Frequência</label>
                <div className="flex gap-1.5">
                  <input 
                    type="text"
                    placeholder="Ex: 8 em 8 horas"
                    value={newMedFrequency}
                    onChange={(e) => setNewMedFrequency(e.target.value)}
                    className="flex-1 text-xs p-2 bg-white border border-slate-150 rounded-lg outline-none"
                  />
                  <button
                    onClick={handleAddMedication}
                    className="bg-emerald text-white p-2 rounded-lg font-bold text-xs"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Assinatura Eletrônica Certificada SISA
            </label>
            <input 
              type="text"
              value={digitalSignature}
              onChange={(e) => setDigitalSignature(e.target.value)}
              className="w-full-no-margin text-xs p-3 font-mono bg-slate-900 text-emerald-400 border-none outline-none rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setIsPrescriptionModalOpen(false)}
              className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-600 cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={submitDigitalPrescription}
              disabled={prescriptionMeds.length === 0}
              className="flex-grow py-3 px-4 bg-emerald hover:bg-emerald/95 text-white font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer disabled:opacity-40"
            >
              Emitir e Assinar Receita Digital
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. REQUISITAR EXAMES DE LABORATÓRIO MODAL */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Nova Requisição de Exame SISA"
        className="max-w-md"
      >
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Tipo de Exame de Laboratório</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none bg-white"
            >
              <option value="">Selecione o Exame...</option>
              <option value="Hemograma Completo">Hemograma Completo</option>
              <option value="Glicemia em Jejum">Glicemia em Jejum</option>
              <option value="Ureia e Creatinina">Ureia e Creatinina</option>
              <option value="Perfil Lipídico">Perfil Lipídico</option>
              <option value="Urina Tipo I">Urina Tipo I</option>
              <option value="Ácido Úrico">Ácido Úrico</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Prioridade Clínica</label>
            <div className="flex gap-2">
              {[
                { id: 'routine', label: 'Rotina' },
                { id: 'urgent', label: 'Urgente' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setExamPriority(p.id)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer",
                    examPriority === p.id 
                      ? "bg-navy text-white border-navy" 
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Notas de Suporte do Exame</label>
            <textarea
              rows={3}
              placeholder="Ex: Confirmação diagnóstica pós queixas em teleconsulta de fadiga extrema."
              value={examNotes}
              onChange={(e) => setExamNotes(e.target.value)}
              className="w-full text-xs p-3 border border-slate-150 focus:outline-none focus:border-navy rounded-xl"
            />
          </div>

          {examSavesuccess && (
            <p className="text-emerald text-[11px] font-black text-center flex items-center justify-center gap-1 bg-emerald-50 py-2.5 rounded-xl border border-emerald-100">
              ✓ Requisição enviada com sucesso para o Laboratório!
            </p>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setIsExamModalOpen(false)}
              className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={submitExamRequest}
              disabled={!examType}
              className="flex-grow py-3 px-4 bg-navy hover:bg-navy/95 text-white font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer disabled:opacity-45"
            >
              Enviar Requisição
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. AGENDAR TELECONSULTA MODAL */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Agendar Nova Videoconsulta"
        className="max-w-md"
      >
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Pesquisar Paciente</label>
            <select
              value={scheduleForm.patientId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, patientId: e.target.value })}
              className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none bg-white"
            >
              <option value="">Selecione o Paciente...</option>
              {allPatients.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.bi_number || p.process_number})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Médico Responsável</label>
            <select
              value={scheduleForm.doctorId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, doctorId: e.target.value })}
              className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none bg-white"
            >
              <option value="">Selecione o Médico...</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.full_name} ({d.specialty || d.role})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Especialidade Médica</label>
            <select
              value={scheduleForm.specialty}
              onChange={(e) => setScheduleForm({ ...scheduleForm, specialty: e.target.value })}
              className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none bg-white font-bold"
            >
              <option value="Clínica Geral">Clínica Geral</option>
              <option value="Cardiologia">Cardiologia</option>
              <option value="Neurologia">Neurologia</option>
              <option value="Pediatria">Pediatria</option>
              <option value="Ginecologia / Obstetrícia">Ginecologia / Obstetrícia</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Data</label>
              <input 
                type="date"
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                className="w-full text-xs p-3 border border-slate-150 rounded-xl bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Horário</label>
              <input 
                type="time"
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                className="w-full text-xs p-3 border border-slate-150 rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-600 cursor-pointer"
            >
              Descartar
            </button>
            <button
              onClick={handleScheduleConsultation}
              disabled={!scheduleForm.patientId}
              className="flex-grow py-3 px-4 bg-navy hover:bg-navy/95 text-white font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer disabled:opacity-45"
            >
              Salvar Agendamento SISA
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. REAGENDAR TELECONSULTA MODAL */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title="Reagendar Teleconsulta SISA"
        className="max-w-md"
      >
        <div className="space-y-5">
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
            <p className="text-xs text-slate-500 font-bold">Paciente</p>
            <p className="text-sm text-indigo-950 font-black">{rescheduleForm.patientName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Nova Data</label>
              <input 
                type="date"
                value={rescheduleForm.date}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                className="w-full text-xs p-3 border border-slate-150 rounded-xl bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Novo Horário</label>
              <input 
                type="time"
                value={rescheduleForm.time}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                className="w-full text-xs p-3 border border-slate-150 rounded-xl bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setIsRescheduleModalOpen(false)}
              className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-600 cursor-pointer"
            >
              Voltar
            </button>
            <button
              onClick={handleSaveReschedule}
              className="flex-grow py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer"
            >
              Confirmar Reagendamento
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
