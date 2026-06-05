import React from 'react';
import { 
  Search, 
  Plus, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Download, 
  History, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ChevronRight, 
  Upload, 
  Sliders, 
  RotateCw, 
  Columns, 
  LayoutGrid, 
  Info, 
  BookOpen, 
  User as UserIcon,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import Modal from './ui/Modal';

// Interactive medical SVGs to mimic patient images
const XRAY_TORAX_SVG = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full bg-slate-950 text-slate-200">
    <rect width="400" height="400" fill="#030712" />
    <defs>
      <radialGradient id="lungGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#030712" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="spineGlow" cx="50%" cy="55%" r="40%">
        <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#030712" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Grid Backers */}
    <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3">
      <line x1="50" y1="0" x2="50" y2="400" />
      <line x1="100" y1="0" x2="100" y2="400" />
      <line x1="150" y1="0" x2="150" y2="400" />
      <line x1="200" y1="0" x2="200" y2="400" />
      <line x1="250" y1="0" x2="250" y2="400" />
      <line x1="300" y1="0" x2="300" y2="400" />
      <line x1="350" y1="0" x2="350" y2="400" />
      
      <line x1="0" y1="50" x2="400" y2="50" />
      <line x1="0" y1="100" x2="400" y2="100" />
      <line x1="0" y1="150" x2="400" y2="150" />
      <line x1="0" y1="200" x2="400" y2="200" />
      <line x1="0" y1="250" x2="400" y2="250" />
      <line x1="0" y1="300" x2="400" y2="300" />
      <line x1="0" y1="350" x2="400" y2="350" />
    </g>

    {/* Lungs Silhouettes */}
    <ellipse cx="140" cy="200" rx="60" ry="110" fill="url(#lungGlow)" />
    <ellipse cx="260" cy="200" rx="60" ry="110" fill="url(#lungGlow)" />
    <ellipse cx="200" cy="210" rx="110" ry="120" fill="url(#spineGlow)" />

    {/* Spine (Coluna Vertebral) */}
    <g fill="#94a3b8" opacity="0.6">
      {Array.from({ length: 18 }).map((_, i) => (
        <rect key={i} x="190" y={40 + i * 17} width="20" height="11" rx="2" fill="#cbd5e1" />
      ))}
      {Array.from({ length: 18 }).map((_, i) => (
        <circle key={i} cx="200" cy={55 + i * 17} r="3" fill="#64748b" />
      ))}
    </g>

    {/* Clavicles (Clavículas) */}
    <path d="M 120 70 Q 160 85 195 80" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.65" />
    <path d="M 280 70 Q 240 85 205 80" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.65" />

    {/* Ribs (Costelas) */}
    <g stroke="#cbd5e1" strokeWidth="4.5" fill="none" opacity="0.45" strokeLinecap="round">
      {/* Left Ribs */}
      <path d="M 195 100 Q 120 105 100 130" />
      <path d="M 195 118 Q 110 125 90 155" />
      <path d="M 195 136 Q 100 145 80 180" />
      <path d="M 195 154 Q 90 165 75 205" />
      <path d="M 195 172 Q 85 185 75 230" />
      <path d="M 195 190 Q 80 205 75 255" />
      <path d="M 195 208 Q 85 225 80 280" />
      <path d="M 195 226 Q 90 245 85 305" />

      {/* Right Ribs */}
      <path d="M 205 100 Q 280 105 300 130" />
      <path d="M 205 118 Q 290 125 310 155" />
      <path d="M 205 136 Q 300 145 320 180" />
      <path d="M 205 154 Q 310 165 325 205" />
      <path d="M 205 172 Q 315 185 325 230" />
      <path d="M 205 190 Q 320 205 325 255" />
      <path d="M 205 208 Q 315 225 320 280" />
      <path d="M 205 226 Q 310 245 315 305" />
    </g>

    {/* Radiographic Indicators */}
    <text x="350" y="50" fill="#22c55e" fontSize="16" fontWeight="bold" fontFamily="monospace">R</text>
    <text x="50" y="50" fill="#475569" fontSize="11" fontWeight="bold" fontFamily="monospace">AP_REC</text>
    <text x="50" y="70" fill="#475569" fontSize="9" fontFamily="monospace">SISA-IMAGIOLOGIA</text>
    <text x="50" y="360" fill="#475569" fontSize="9" fontFamily="monospace">WL: 1200 / WW: 400</text>
    <text x="320" y="360" fill="#64748b" fontSize="9" fontFamily="monospace">50 Hz</text>

    {/* Calibration Markings */}
    <path d="M 380 150 L 380 250 M 375 150 L 385 150 M 375 250 L 385 250" stroke="#475569" strokeWidth="1" />
    <text x="355" y="205" fill="#475569" fontSize="8" fontFamily="monospace">10cm</text>
  </svg>
);

const MRI_BRAIN_SVG = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full bg-slate-950 text-slate-200">
    <rect width="400" height="400" fill="#030712" />
    <defs>
      <radialGradient id="brainGlow" cx="50%" cy="50%" r="45%">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
        <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#030712" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Grid Backers */}
    <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3">
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`x-${i}`} x1={(i + 1) * 50} y1="0" x2={(i + 1) * 50} y2="400" />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`y-${i}`} x1="0" y1={(i + 1) * 50} x2="400" y2={(i + 1) * 50} />
      ))}
    </g>

    {/* Brain Shape Glow */}
    <ellipse cx="200" cy="200" rx="95" ry="120" fill="url(#brainGlow)" />
    
    {/* Outside Skull */}
    <ellipse cx="200" cy="200" rx="100" ry="125" stroke="#cbd5e1" strokeWidth="6" strokeDasharray="180, 5, 20" fill="none" opacity="0.3" />
    <ellipse cx="200" cy="200" rx="98" ry="123" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.5" />

    {/* Brain Temporal/Frontal lobes details */}
    <g fill="none" stroke="#e2e8f0" opacity="0.5">
      {/* Intricate brain folds / sulci */}
      <path d="M 200 80 Q 200 320 200 320" strokeWidth="2.5" />
      <path d="M 200 120 C 130 110, 110 180, 150 200 C 120 220, 110 280, 200 300" strokeWidth="2" />
      <path d="M 200 120 C 270 110, 290 180, 250 200 C 280 220, 290 280, 200 300" strokeWidth="2" />
      
      {/* Cerebral folds details */}
      <path d="M 120 170 Q 150 180 180 160" strokeWidth="1.5" />
      <path d="M 280 170 Q 250 180 220 160" strokeWidth="1.5" />
      
      <path d="M 130 220 Q 165 210 180 230" strokeWidth="1.5" />
      <path d="M 270 220 Q 235 210 220 230" strokeWidth="1.5" />

      <path d="M 160 140 Q 170 120 200 130" strokeWidth="1.2" />
      <path d="M 240 140 Q 230 120 170 130" strokeWidth="1.2" />

      {/* Ventricles (Bright central regions in MRI T2) */}
      <path d="M 175 180 Q 185 210 200 200 Q 185 210 190 240" stroke="#f1f5f9" strokeWidth="5.5" strokeLinecap="round" opacity="0.8" />
      <path d="M 225 180 Q 215 210 200 200 Q 215 210 210 240" stroke="#f1f5f9" strokeWidth="5.5" strokeLinecap="round" opacity="0.8" />
    </g>

    {/* Radiographic Indicators */}
    <text x="350" y="50" fill="#a855f7" fontSize="16" fontWeight="bold" fontFamily="monospace">L</text>
    <text x="50" y="50" fill="#475569" fontSize="11" fontWeight="bold" fontFamily="monospace">MRI-T2</text>
    <text x="50" y="70" fill="#475569" fontSize="9" fontFamily="monospace">SISA-IMAGIOLOGIA</text>
    <text x="50" y="340" fill="#475569" fontSize="9" fontFamily="monospace">TE: 90ms / TR: 4000ms</text>
    <text x="50" y="360" fill="#475569" fontSize="9" fontFamily="monospace">Slc: 12 / 24</text>
    <text x="320" y="360" fill="#64748b" fontSize="9" fontFamily="monospace">SISA v1.4</text>
  </svg>
);

const ECO_ABDOMEN_SVG = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full bg-slate-950 text-slate-200">
    <rect width="400" height="400" fill="#020617" />
    <defs>
      {/* Ultrasound Sector cone */}
      <clipPath id="ultrasoundCone">
        <path d="M 200 40 L 40 360 A 240 240 0 0 0 360 360 Z" />
      </clipPath>
      <radialGradient id="coneGlow" cx="50%" cy="10%" r="80%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#0f766e" stopOpacity="0.15" stopAlpha="0.1" />
        <stop offset="100%" stopColor="#020617" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="liverTissue" cx="45%" cy="50%" r="30%">
         <stop offset="0%" stopColor="#334155" stopOpacity="0.7" />
         <stop offset="50%" stopCol="#1e293b" stopOpacity="0.4" />
         <stop offset="100%" stopColor="#020617" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Sector Cone Backdrop */}
    <path d="M 200 40 L 40 360 A 240 240 0 0 0 360 360 Z" fill="url(#coneGlow)" />

    {/* Sector Cone Edge */}
    <path d="M 200 40 L 40 360 A 240 240 0 0 0 360 360 Z" stroke="#14b8a6" strokeWidth="2" strokeOpacity="0.5" fill="none" />

    {/* Ultrasound Scanlines/Speckle Effect inside clip path */}
    <g clipPath="url(#ultrasoundCone)">
      {/* Radial sweep arc grids */}
      <circle cx="200" cy="40" r="100" stroke="#0d9488" strokeWidth="0.5" strokeDasharray="3,6" fill="none" opacity="0.3" />
      <circle cx="200" cy="40" r="180" stroke="#0d9488" strokeWidth="0.5" strokeDasharray="3,6" fill="none" opacity="0.3" />
      <circle cx="200" cy="40" r="260" stroke="#0d9488" strokeWidth="0.5" strokeDasharray="3,6" fill="none" opacity="0.3" />
      <circle cx="200" cy="40" r="320" stroke="#0d9488" strokeWidth="0.5" strokeDasharray="3,6" fill="none" opacity="0.3" />

      {/* Anatomical grainy spots */}
      <ellipse cx="170" cy="220" rx="60" ry="40" fill="url(#liverTissue)" />
      
      {/* Gallbladder or fluid collection (Anechoic area = black) */}
      <ellipse cx="210" cy="230" rx="35" ry="18" fill="#020617" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(-15, 210, 230)" opacity="0.9" />
      
      {/* Gallstones (Hyperechoic with shadow) */}
      <ellipse cx="200" cy="234" rx="6" ry="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
      <ellipse cx="215" cy="231" rx="5" ry="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
      
      {/* Acoustic shadow (black wedge below gallstones) */}
      <path d="M 194 240 L 175 360 L 235 360 L 221 236 Z" fill="#020617" opacity="0.65" />
      
      {/* Random Speckle grain curves */}
      <path d="M 80 180 Q 110 160 140 190" stroke="#475569" strokeWidth="3" strokeDasharray="1,4" fill="none" />
      <path d="M 100 240 Q 150 250 160 210" stroke="#64748b" strokeWidth="4" strokeDasharray="2,3" fill="none" />
      <path d="M 230 180 Q 280 160 300 220" stroke="#334155" strokeWidth="3.5" strokeDasharray="1,5" fill="none" />
    </g>

    {/* Graphic Data */}
    <text x="310" y="60" fill="#10b981" fontSize="12" fontWeight="bold" fontFamily="monospace">GEN</text>
    <text x="310" y="80" fill="#64748b" fontSize="9" fontFamily="monospace">C5-2 OB-Gyn</text>
    <text x="310" y="100" fill="#64748b" fontSize="9" fontFamily="monospace">MI 1.1 TIB 0.2</text>
    <text x="50" y="60" fill="#10b981" fontSize="14" fontWeight="bold" fontFamily="monospace">ECOGRAFIA</text>
    <text x="50" y="80" fill="#475569" fontSize="9" fontFamily="monospace">H. GERAL SISA</text>
    <text x="50" y="360" fill="#64748b" fontSize="9" fontFamily="monospace">Fr: 32 Hz &bull; Dr: 65dB</text>

    {/* Scale ticks */}
    <g stroke="#475569" strokeWidth="1">
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1="380" y1={80 + i * 50} x2="385" y2={80 + i * 50} />
      ))}
    </g>
    <text x="360" y="333" fill="#475569" fontSize="8" fontFamily="monospace">15cm</text>
  </svg>
);

const MOCK_IMAGES_MAP: Record<string, () => React.JSX.Element> = {
  'raio_x_torax': XRAY_TORAX_SVG,
  'mri_brain': MRI_BRAIN_SVG,
  'eco_abdomen': ECO_ABDOMEN_SVG
};

interface ImagingProps {
  patientId?: string; // Optional: when integrated inside PEP
}

export default function Imaging({ patientId }: ImagingProps) {
  const [exams, setExams] = React.useState<any[]>([]);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [isLaudoModalOpen, setIsLaudoModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = React.useState(false);

  // Focus and Active Records
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null);
  const [selectedExam, setSelectedExam] = React.useState<any>(null);
  const [currentDoctor, setCurrentDoctor] = React.useState<any>(null);

  // Image manipulation tools
  const [zoomLevel, setZoomLevel] = React.useState(100);
  const [rotation, setRotation] = React.useState(0);
  const [contrastSetting, setContrastSetting] = React.useState(100);
  const [brightnessSetting, setBrightnessSetting] = React.useState(100);

  // Multi-exam comparison
  const [compareLeftExam, setCompareLeftExam] = React.useState<any>(null);
  const [compareRightExam, setCompareRightExam] = React.useState<any>(null);

  // Reporting Form Data
  const [laudoForm, setLaudoForm] = React.useState({
    result: 'Normal', // Normal, Alterado, Crítico
    notes: '',
    conclusion: '',
    doctor_signature: ''
  });

  // Adding new exam data
  const [uploadForm, setUploadForm] = React.useState({
    patient_id: '',
    exam_type: 'Raio-X',
    region: 'Tórax AP e Perfil',
    notes: '',
    mock_type: 'raio_x_torax'
  });

  React.useEffect(() => {
    fetchInitialData();
  }, [patientId]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch patients
      const { data: pats, error: patErr } = await supabase
        .from('patients')
        .select('*')
        .order('full_name');
      
      if (patErr) throw patErr;
      const patientsList = pats || [];
      setPatients(patientsList);

      // 2. Fetch logged in User profile metadata
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        let { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', authUser.id)
          .single();
        
        setCurrentDoctor({
          full_name: profile?.full_name || authUser.email?.split('@')[0] || 'Dr. Médico Clínico',
          role: profile?.role || 'doctor'
        });
      }

      // 3. Load exams from local storage with pre-populated mocks
      const storedExams = localStorage.getItem('sisa_imaging_exams_v3');
      let parsedExams = [];

      if (storedExams) {
        parsedExams = JSON.parse(storedExams);
      } else {
        // Preload robust initial mock exams mapped onto realistic patient IDs
        const p1 = patientsList.find(p => p.full_name?.toLowerCase().includes('maria')) || patientsList[0] || { id: 'p-1', full_name: 'Maria Domingos', process_number: 'SISA-P0020' };
        const p2 = patientsList.find(p => p.full_name?.toLowerCase().includes('joão') || p.full_name?.toLowerCase().includes('joao')) || patientsList[1] || { id: 'p-2', full_name: 'João Afonso', process_number: 'SISA-P0021' };
        const p3 = patientsList.find(p => p.full_name?.toLowerCase().includes('teresa')) || patientsList[2] || { id: 'p-3', full_name: 'Teresa Bento', process_number: 'SISA-P0022' };

        parsedExams = [
          {
            id: 'img-exam-1',
            patient_id: p1.id,
            patient_name: p1.full_name,
            patient_process: p1.process_number || 'SISA-AO-5899',
            exam_type: 'Raio-X',
            region: 'Tórax AP e Perfil',
            requester: 'Dr. Manuel Neto (Médico Principal)',
            date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
            status: 'ready',
            mock_type: 'raio_x_torax',
            laudo: {
              result: 'Normal',
              notes: 'Campos pleuropulmonares limpos e transparentes. Transparência pulmonar normal. Silhueta cardíaca, hilos pulmonares e mediastino dentro dos limites radiológicos normais. Ausência de derrames pleurais activos ou consolidações lobares.',
              conclusion: 'Exame radiográfico de tórax sem evidência de lesões cardiopulmonares pleurais agudas.',
              doctor_signature: 'Dr. Bento Kiala (Radiologista SISA - C.M. nº 4022)'
            },
            notes: 'Exame de rotina solicitado na triagem geral.'
          },
          {
            id: 'img-exam-2',
            patient_id: p2.id,
            patient_name: p2.full_name,
            patient_process: p2.process_number || 'SISA-AO-3810',
            exam_type: 'Tomografia',
            region: 'Crânio / Encéfalo Axial',
            requester: 'Dr. Manuel Neto (Médico Principal)',
            date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
            status: 'pending',
            mock_type: 'mri_brain',
            laudo: null,
            notes: 'Paciente queixava-se de cefaleias intensas e vômitos persistentes em jato.'
          },
          {
            id: 'img-exam-3',
            patient_id: p3.id,
            patient_name: p3.full_name,
            patient_process: p3.process_number || 'SISA-AO-1209',
            exam_type: 'Ecografia',
            region: 'Abdómen Superior (Vesícula Biliar)',
            requester: 'Drª. Isabel de Castro',
            date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
            status: 'critical',
            mock_type: 'eco_abdomen',
            laudo: {
              result: 'Crítico / Urgência',
              notes: 'Hepatomegália difusa homogénea. Vesícula biliar moderadamente distendida apresentando paredes espessadas medindo 6mm (sinal de duplo contorno). Identifica-se colecção de múltiplos cálculos móveis de natureza facetada no seu lúmen, com o maior medindo 12mm obstruindo o infundíbulo.',
              conclusion: 'Colecistite Aguda Litíase obstrutiva vesicular. Líquido livre pericolecístico de grau ligeiro. Recomenda-se urgente intervenção cirúrgica.',
              doctor_signature: 'Dra. Clara de Almeida (Especialista em Imagem SISA)'
            },
            notes: 'Dor irradiada para o hipocôndrio direito após ingestão de gordura.'
          }
        ];
        localStorage.setItem('sisa_imaging_exams_v3', JSON.stringify(parsedExams));
      }

      setExams(parsedExams);

      // If patientId is provided (Integrated inside PEP), auto-select that patient!
      if (patientId) {
        const found = patientsList.find(p => p.id === patientId);
        if (found) {
          setSelectedPatient(found);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync exams back to localStorage
  const saveExamsToStore = (updatedExams: any[]) => {
    setExams(updatedExams);
    localStorage.setItem('sisa_imaging_exams_v3', JSON.stringify(updatedExams));
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const pat = patients.find(p => p.id === uploadForm.patient_id);
    if (!pat) {
      alert("Paciente inválido ou não selecionado.");
      setIsSubmitting(false);
      return;
    }

    const newExam = {
      id: `img-exam-${Date.now()}`,
      patient_id: pat.id,
      patient_name: pat.full_name,
      patient_process: pat.process_number || 'Não Declarado',
      exam_type: uploadForm.exam_type,
      region: uploadForm.region,
      requester: currentDoctor?.full_name || 'Dr. Médico Requisitante SISA',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      mock_type: uploadForm.mock_type,
      laudo: null,
      notes: uploadForm.notes
    };

    const updated = [newExam, ...exams];
    saveExamsToStore(updated);
    
    // Auto reset uploader
    alert("Exame registado e associado ao prontuário do paciente com sucesso!");
    setIsUploadModalOpen(false);
    setUploadForm({
      patient_id: '',
      exam_type: 'Raio-X',
      region: 'Tórax AP e Perfil',
      notes: '',
      mock_type: 'raio_x_torax'
    });
    setIsSubmitting(false);
  };

  const handleLaudarExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const updated = exams.map(ex => {
      if (ex.id === selectedExam.id) {
        return {
          ...ex,
          status: laudoForm.result === 'Crítico / Urgência' ? 'critical' : 'ready',
          laudo: {
            result: laudoForm.result,
            notes: laudoForm.notes,
            conclusion: laudoForm.conclusion,
            doctor_signature: laudoForm.doctor_signature || `${currentDoctor?.full_name} (${currentDoctor?.role === 'doctor' ? 'Médico Radiologista SISA' : 'Clínico'})`
          }
        };
      }
      return ex;
    });

    saveExamsToStore(updated);
    alert('Laudo Radiológico gravado com sucesso no Prontuário do Paciente!');
    
    // Reset and close
    setIsLaudoModalOpen(false);
    setSelectedExam(null);
  };

  // General Search function over patients
  const filteredPatients = patients.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.full_name?.toLowerCase().includes(query) ||
      p.process_number?.toLowerCase().includes(query) ||
      p.bi_number?.toLowerCase().includes(query) ||
      p.municipal_card_id?.toLowerCase().includes(query)
    );
  });

  const getPatientExams = (pId: string) => {
    return exams.filter(ex => ex.patient_id === pId);
  };

  const activePatientExams = selectedPatient ? getPatientExams(selectedPatient.id) : [];

  // Overall Statistics for Dashboard
  const totalExamsCount = exams.length;
  const pendingCount = exams.filter(e => e.status === 'pending').length;
  const completedCount = exams.filter(e => e.status === 'ready').length;
  const criticalCount = exams.filter(e => e.status === 'critical').length;

  const handlePrintLaudo = (exam: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Laudo de Imagiologia SISA</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="p-10 font-sans bg-white text-slate-900 leading-relaxed min-h-screen flex flex-col justify-between">
          <div>
            <!-- Republic Header -->
            <div class="text-center space-y-1 mb-6 border-b pb-4 border-slate-300">
              <div class="text-[20px] font-extrabold text-slate-900">REPÚBLICA DE ANGOLA</div>
              <div class="text-[12px] uppercase tracking-widest text-slate-600 font-bold">Ministério da Saúde</div>
              <div class="text-xs font-semibold text-slate-500 uppercase">Hospital Geral Geral SISA &bull; Serviço de Imagiologia</div>
              <div class="text-[10px] text-slate-400 font-mono mt-1">SISA Código Ref: #IMG-${exam.id.slice(-6).toUpperCase()}</div>
            </div>

            <!-- Header Title -->
            <div class="text-center my-6 font-black text-sm uppercase tracking-wider text-slate-800">
              LAUDO DE EXAME RADIOLÓGICO / IMAGIOLOGIA
            </div>

            <!-- Patient Core biographical data table -->
            <div class="border border-slate-200 rounded-xl p-4 mb-6 bg-slate-50/50">
              <table class="w-full text-xs text-left">
                <tr>
                  <td class="font-bold py-1 w-1/4 text-slate-500">Nome do Paciente:</td>
                  <td class="py-1 font-bold text-slate-900" colSpan="3">${exam.patient_name}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-slate-500">Nº de Processo:</td>
                  <td class="py-1 font-mono text-slate-700 font-bold">${exam.patient_process}</td>
                  <td class="font-bold py-1 w-1/4 text-slate-500">Modalidade/Exame:</td>
                  <td class="py-1 font-bold text-emerald-800">${exam.exam_type} - ${exam.region}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-slate-500">Médico Solicitante:</td>
                  <td class="py-1 text-slate-700">${exam.requester}</td>
                  <td class="font-bold py-1 text-slate-500">Data de Realização:</td>
                  <td class="py-1 font-mono">${exam.date}</td>
                </tr>
              </table>
            </div>

            <!-- Report Details -->
            <div class="space-y-6 mt-8">
              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-1">RESULTADO GERAL</h4>
                <p class="mt-2 text-sm font-black uppercase text-slate-900 ${exam.status === 'critical' ? 'text-red-650' : 'text-slate-800'}">
                  ${exam.laudo?.result || 'Pendente de Diagnóstico'}
                </p>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-1">OBSERVAÇÕES RADIOLÓGICAS</h4>
                <p class="mt-2 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">${exam.laudo?.notes || 'Este exame ainda não foi laudado pela equipe competente.'}</p>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-1">CONCLUSÃO CLÍNICA</h4>
                <p class="mt-2 text-xs font-bold text-slate-950 whitespace-pre-wrap leading-relaxed">${exam.laudo?.conclusion || 'Sem conclusão.'}</p>
              </div>
            </div>
          </div>

          <!-- Signatures Section -->
          <div class="mt-16 pt-8 border-t border-slate-200">
            <div class="text-center text-xs">
              <div class="w-64 mx-auto border-b border-indigo-400 h-10 mb-2"></div>
              <p class="font-bold uppercase text-slate-800">${exam.laudo?.doctor_signature || 'Direção de Imagiologia SISA'}</p>
              <p class="text-[9px] text-slate-400 mt-0.5">Assinatura Electrônica Legitima &bull; Sistema SISA</p>
            </div>

            <div class="text-center text-[9px] text-slate-400 mt-12 space-y-1">
              <p>Este relatório integra as vias oficiais de imagiologia hospitalar do Ministério da Saúde de Angola.</p>
              <p>Data de Emissão: ${new Date().toLocaleString('pt-AO')} &bull; Autenticação Criptográfica SISA: IMG_VAL_${exam.id.slice(0,8).toUpperCase()}</p>
            </div>
          </div>

          <div class="no-print mt-8 flex justify-center">
            <button onclick="window.print()" class="bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-2.5 px-6 rounded-lg text-sm shadow cursor-pointer">
              Imprimir Laudo Técnico
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadLaudoText = (exam: any) => {
    const textContent = `
=============================================
 REPÚBLICA DE ANGOLA - RECONSTITUIÇÃO SISA
 MINISTÉRIO DA SAÚDE - IMAGIOLOGIA DIGITAL
=============================================
ID EXAME: #${exam.id}
PACIENTE: ${exam.patient_name} (Processo: ${exam.patient_process})
EXAME: ${exam.exam_type} (${exam.region})
DATA: ${exam.date}
SOLICITANTE: ${exam.requester}

LAUDO TÉCNICO RADIOLÓGICO:
---------------------------------------------
RESULTADO:  ${exam.laudo?.result || 'Pendente'}
OBSERVAÇÕES:
${exam.laudo?.notes || '-'}

CONCLUSÃO:
${exam.laudo?.conclusion || '-'}

RESPONSÁVEL:   ${exam.laudo?.doctor_signature || '-'}
---------------------------------------------
Emitido via Portal de Imagiologia SISA em ${new Date().toLocaleDateString('pt-AO')}
    `;
    const element = document.createElement("a");
    const file = new Blob([textContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Laudo_${exam.patient_name.replace(/\s+/g, '_')}_${exam.exam_type}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Upper Module Banner */}
      <div className="bg-gradient-to-r from-navy to-slate-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-sky-400 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-sky-500/20 text-sky-300 rounded-full text-[10px] uppercase font-black tracking-widest">
                PACS Integrado
              </span>
              <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-ping" />
            </div>
            <h1 className="text-2xl font-black tracking-tight font-sans">
              Serviço de Imagiologia Digital
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Sistema Integrado de Arquivamento e Transmissão de Imagens Médicas (PACS) do Hospital Geral. Diagnósticos Rápidos, Laudos Criptografados e Históricos em Tempo Real.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-100 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Columns className="w-4 h-4" />
              Comparador PACS
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Exame de Imagem
            </button>
          </div>
        </div>
      </div>

      {/* SISA KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wide">Total de Imagens</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalExamsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
            <LayoutGrid className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-amber-500 tracking-wide">Pendentes de Laudo</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-55/10 flex items-center justify-center">
            <Info className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-wide">Laudos Concluídos</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-55/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-rose-500 tracking-wide">Achados Críticos</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Main Structural Splitter layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Search/List Panel */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm xl:col-span-1">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Pesquisar Paciente SISA
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Pesquise pelo nome, nº processo, BI ou Bilhete Digital para aceder ao prontuário imagiológico.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nome ou código do paciente..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-sky-500 rounded-xl text-xs border border-transparent focus:border-transparent outline-none transition-all font-bold text-slate-700"
            />
          </div>

          <hr className="border-slate-100" />

          {/* Patient Result List */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                <span className="text-[10px] text-slate-400 font-bold">Carregando Prontuários...</span>
              </div>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map(p => {
                const isSelected = selectedPatient?.id === p.id;
                const pExams = getPatientExams(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={cn(
                      "w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer",
                      isSelected 
                        ? "bg-slate-900 text-white border-transparent shadow shadow-slate-900/10" 
                        : "bg-white border-slate-150 hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className="space-y-1 leading-none">
                      <p className="font-extrabold text-xs">{p.full_name}</p>
                      <p className={cn(
                        "text-[9px] font-mono",
                        isSelected ? "text-slate-400" : "text-slate-500"
                      )}>
                        Proc: {p.process_number || '#SISA-N/D'} &bull; BI: {p.bi_number || 'Sem BI'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-extrabold uppercase",
                        pExams.length > 0 
                          ? (isSelected ? "bg-sky-500/20 text-sky-300" : "bg-sky-50 text-sky-800")
                          : "bg-slate-100 text-slate-400"
                      )}>
                        {pExams.length} {pExams.length === 1 ? 'Exame' : 'Exames'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-400 italic text-xs">
                Nenhum paciente localizado.
              </div>
            )}
          </div>
        </div>

        {/* Right Active Patient exams registry table / detail view */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[460px] flex flex-col justify-between">
            {selectedPatient ? (
              <div className="space-y-6">
                
                {/* Header active selection details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 border rounded-xl flex items-center justify-center shrink-0">
                      <UserIcon className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 leading-none">
                        {selectedPatient.full_name}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-bold mt-1">
                        Proc. SISA: <span className="font-mono">{selectedPatient.process_number || 'N/D'}</span> &bull; {selectedPatient.province} / {selectedPatient.municipality}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold uppercase rounded-full px-3 py-1 self-start sm:self-auto">
                    Prontuário Imagiológico Ativo
                  </span>
                </div>

                {/* Exams List Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                      <History className="w-4 h-4 text-slate-400" />
                      Histórico Clínico de Exames ({activePatientExams.length})
                    </span>
                    
                    <span className="text-[10px] text-slate-400 font-bold">
                      Acesso restrito a profissionais médicos autorizados
                    </span>
                  </div>

                  <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/20">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 font-black uppercase text-slate-500 text-[10px] border-b border-slate-150">
                        <tr>
                          <th className="p-3">Data</th>
                          <th className="p-3">Tipo / Região</th>
                          <th className="p-3">Médico</th>
                          <th className="p-3">Estado</th>
                          <th className="p-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {activePatientExams.length > 0 ? (
                          activePatientExams.map(ex => (
                            <tr key={ex.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono text-slate-600 font-bold">
                                {ex.date}
                              </td>
                              <td className="p-3">
                                <p className="font-extrabold text-slate-900">{ex.exam_type}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{ex.region}</p>
                              </td>
                              <td className="p-3 text-slate-600 font-medium">
                                {ex.requester}
                              </td>
                              <td className="p-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                                  ex.status === 'ready' && "bg-emerald-100 text-emerald-800",
                                  ex.status === 'pending' && "bg-amber-100 text-amber-800",
                                  ex.status === 'critical' && "bg-red-100 text-red-800 animate-pulse"
                                )}>
                                  {ex.status === 'ready' ? 'Laudado' : ex.status === 'pending' ? 'Pendente' : 'Achado Crítico'}
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setSelectedExam(ex);
                                    setZoomLevel(100);
                                    setContrastSetting(100);
                                    setBrightnessSetting(100);
                                    setRotation(0);
                                    setIsViewModalOpen(true);
                                  }}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg inline-flex text-sky-600 cursor-pointer"
                                  title="Ver Imagem / PACS"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {ex.status === 'pending' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedExam(ex);
                                      setLaudoForm({
                                        result: 'Normal',
                                        notes: '',
                                        conclusion: '',
                                        doctor_signature: ''
                                      });
                                      setIsLaudoModalOpen(true);
                                    }}
                                    className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-[10px] font-bold cursor-pointer"
                                  >
                                    Laudar
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handlePrintLaudo(ex)}
                                      className="p-1.5 hover:bg-slate-100 rounded-lg inline-flex text-indigo-600 cursor-pointer"
                                      title="Imprimir Certidão de Laudo"
                                    >
                                      <Printer className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDownloadLaudoText(ex)}
                                      className="p-1.5 hover:bg-slate-100 rounded-lg inline-flex text-emerald-600 cursor-pointer"
                                      title="Descarregar Laudo"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                              Não existem exames de imagiologia registados para este paciente SISA.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
                <div className="p-4 bg-slate-50 border rounded-3xl">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
                <div>
                  <h3 className="font-black text-slate-700 text-sm uppercase tracking-wider">
                    Selecione um Paciente
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto">
                    Aceda ao menu lateral esquerdo, busque um paciente por nome ou código biométrico para gerir os seus estudos imagiológicos e visualizar exames em tempo real.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: PACS IMAGE VIEWER */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Visualizador de Imagem Médica (SISA PACS) - ${selectedExam?.patient_name}`}
        className="max-w-4xl"
      >
        {selectedExam && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Imaging Screen Screen (Left) */}
              <div className="flex-1 flex flex-col bg-black rounded-3xl overflow-hidden relative border border-slate-800">
                
                {/* Real-time filters and metrics header overlays */}
                <div className="absolute top-4 left-4 z-10 bg-black/75 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 leading-relaxed pointer-events-none space-y-1">
                  <p className="text-white font-bold">{selectedExam.exam_type} - {selectedExam.region}</p>
                  <p>Proc: {selectedExam.patient_process}</p>
                  <p>Lote Imagem: #{selectedExam.id.toUpperCase()}</p>
                  <p>Zoom: {zoomLevel}% | Rotação: {rotation}°</p>
                  <p>Contraste: {contrastSetting}% | Brilho: {brightnessSetting}%</p>
                </div>

                <div className="absolute top-4 right-4 z-10 flex gap-1.5">
                  <button
                    onClick={() => {
                      setZoomLevel(100);
                      setContrastSetting(100);
                      setBrightnessSetting(100);
                      setRotation(0);
                    }}
                    className="p-2 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                  >
                    Resetar
                  </button>
                </div>

                {/* Radiographic SVG Render Box */}
                <div className="w-full h-[360px] overflow-hidden flex items-center justify-center p-6 relative">
                  <div
                    className="w-full h-full max-w-[340px] max-h-[340px] transition-transform duration-250 cursor-grab active:cursor-grabbing"
                    style={{
                      transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                      filter: `contrast(${contrastSetting}%) brightness(${brightnessSetting}%) shadow(0 0 10px rgba(0,255,255,0.15))`
                    }}
                  >
                    {(() => {
                      const SvgComponent = MOCK_IMAGES_MAP[selectedExam.mock_type] || XRAY_TORAX_SVG;
                      return <SvgComponent />;
                    })()}
                  </div>
                </div>

                {/* Micro DICOM manipulators toolbar */}
                <div className="bg-slate-900 py-3.5 px-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                      className="p-2 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded-lg cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-mono text-slate-400 font-bold px-2">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(250, prev + 25))}
                      className="p-2 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded-lg cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-slate-500" />
                      <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Ct</span>
                      <input 
                        type="range" 
                        min="50" 
                        max="200" 
                        value={contrastSetting} 
                        onChange={(e) => setContrastSetting(Number(e.target.value))}
                        className="w-20 accent-sky-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Br</span>
                      <input 
                        type="range" 
                        min="50" 
                        max="200" 
                        value={brightnessSetting} 
                        onChange={(e) => setBrightnessSetting(Number(e.target.value))}
                        className="w-20 accent-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-2 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded-lg cursor-pointer"
                    title="Rotar Imagem"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Patient and Diagnosis study panel (Right) */}
              <div className="w-full lg:w-80 space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Identificação do Estudo</h4>
                  <p className="font-extrabold text-slate-900 mt-2 text-sm">{selectedExam.patient_name}</p>
                  <p className="text-xs text-slate-500">Processo: <span className="font-mono font-bold text-slate-700">{selectedExam.patient_process}</span></p>
                  <p className="text-xs text-slate-500 mt-1">Data: <span className="font-mono font-bold">{selectedExam.date}</span></p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Laudo do Radiologista</h4>
                  {selectedExam.laudo ? (
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                          selectedExam.status === 'critical' ? "bg-red-100 text-red-800 animate-pulse" : "bg-emerald-100 text-emerald-800"
                        )}>
                          {selectedExam.laudo.result}
                        </span>
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 text-[10px] uppercase block">Conclusão:</span>
                        <p className="font-extrabold text-slate-900 mt-0.5">{selectedExam.laudo.conclusion}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 text-[10px] uppercase block">Observações:</span>
                        <p className="text-slate-600 mt-0.5 h-[120px] overflow-y-auto border p-2 bg-white rounded-xl text-[11px] font-medium leading-normal">{selectedExam.laudo.notes}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold border-t pt-2 mt-4 text-center italic">
                        {selectedExam.laudo.doctor_signature}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-600 font-bold mt-2">Sem Diagnóstico Concluído</p>
                      <p className="text-[10px] text-slate-400 mt-1">Este estudo ainda requer o laudo técnico por parte do radiologista ou médico clínico.</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5">
                  {selectedExam.laudo && (
                    <button
                      onClick={() => handlePrintLaudo(selectedExam)}
                      className="flex-1 py-3 bg-navy hover:bg-navy/95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadLaudoText(selectedExam)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Laudo (TXT)
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: PACIENTE IMAGE COMPARER SECTION */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Estação de Comparação PACS SISA - Vista Lado-a-Lado"
        className="max-w-5xl"
      >
        <div className="space-y-6 font-sans">
          <p className="text-[11px] text-slate-500 font-medium pb-4 border-b">
            Selecione dois exames distintos para avaliar a evolução de imagens clínicas, comparar estudos em diferentes datas ou de diferentes técnicas de imagem.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Choose Left Slot */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Exame Clínico 1 (Lado Esquerdo)</label>
              <select
                className="w-full text-xs p-3.5 border border-slate-150 rounded-xl outline-none bg-white font-bold text-slate-700"
                value={compareLeftExam?.id || ''}
                onChange={(e) => {
                  const examObj = exams.find(ex => ex.id === e.target.value);
                  setCompareLeftExam(examObj || null);
                }}
              >
                <option value="">Selecione um Estudo...</option>
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    [{ex.date}] {ex.patient_name} - {ex.exam_type} ({ex.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Choose Right Slot */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Exame Clínico 2 (Lado Direito)</label>
              <select
                className="w-full text-xs p-3.5 border border-slate-150 rounded-xl outline-none bg-white font-bold text-slate-700"
                value={compareRightExam?.id || ''}
                onChange={(e) => {
                  const examObj = exams.find(ex => ex.id === e.target.value);
                  setCompareRightExam(examObj || null);
                }}
              >
                <option value="">Selecione um Estudo...</option>
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    [{ex.date}] {ex.patient_name} - {ex.exam_type} ({ex.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive split panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            {/* LEFT COMPARER SLOT */}
            <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between min-h-[340px]">
              {compareLeftExam ? (
                <>
                  <div className="pb-3 border-b border-slate-900 flex justify-between items-center text-[10px] font-semibold text-slate-400">
                    <div>
                      <p className="text-white font-black">{compareLeftExam.patient_name}</p>
                      <p>{compareLeftExam.exam_type} &bull; {compareLeftExam.region}</p>
                    </div>
                    <p className="font-mono">{compareLeftExam.date}</p>
                  </div>
                  <div className="w-full h-[220px] flex items-center justify-center p-4">
                    <div className="w-full h-full max-w-[200px] max-h-[200px]">
                      {(() => {
                        const LeftSvg = MOCK_IMAGES_MAP[compareLeftExam.mock_type] || XRAY_TORAX_SVG;
                        return <LeftSvg />;
                      })()}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-900 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Canal Radiográfico A
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-600">
                  <Eye className="w-8 h-8 text-slate-700 animate-pulse" />
                  <p className="text-xs font-bold mt-2">Canal Esquerdo Vazio</p>
                  <p className="text-[10px] text-slate-500">Escolha um exame acima para carregar.</p>
                </div>
              )}
            </div>

            {/* RIGHT COMPARER SLOT */}
            <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between min-h-[340px]">
              {compareRightExam ? (
                <>
                  <div className="pb-3 border-b border-slate-900 flex justify-between items-center text-[10px] font-semibold text-slate-400">
                    <div>
                      <p className="text-white font-black">{compareRightExam.patient_name}</p>
                      <p>{compareRightExam.exam_type} &bull; {compareRightExam.region}</p>
                    </div>
                    <p className="font-mono">{compareRightExam.date}</p>
                  </div>
                  <div className="w-full h-[220px] flex items-center justify-center p-4">
                    <div className="w-full h-full max-w-[200px] max-h-[200px]">
                      {(() => {
                        const RightSvg = MOCK_IMAGES_MAP[compareRightExam.mock_type] || XRAY_TORAX_SVG;
                        return <RightSvg />;
                      })()}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-900 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Canal Radiográfico B
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-600">
                  <Eye className="w-8 h-8 text-slate-700 animate-pulse" />
                  <p className="text-xs font-bold mt-2">Canal Direito Vazio</p>
                  <p className="text-[10px] text-slate-500">Escolha um exame acima para carregar.</p>
                </div>
              )}
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Concluir Comparação
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: REGISTRAR/UPLOAD NOVO EXAME */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Anexar Novo Exame Radiológico ao SISA PACS"
        className="max-w-lg"
      >
        <form onSubmit={handleCreateExam} className="space-y-4 font-sans text-xs">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Paciente Associado *</label>
            <select
              className="w-full p-3 border border-slate-150 rounded-xl outline-none bg-white font-bold text-slate-700"
              required
              value={uploadForm.patient_id}
              onChange={(e) => setUploadForm({ ...uploadForm, patient_id: e.target.value })}
            >
              <option value="">Selecione o Paciente SISA...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.process_number || 'Sem Processo'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Tipo de Exame *</label>
              <select
                className="w-full p-3 border border-slate-150 rounded-xl outline-none bg-white font-bold text-slate-700"
                value={uploadForm.exam_type}
                onChange={(e) => setUploadForm({ ...uploadForm, exam_type: e.target.value })}
              >
                <option value="Raio-X">Raio-X</option>
                <option value="Tomografia">Tomografia (TC)</option>
                <option value="Ecografia">Ecografia</option>
                <option value="Ressonância Magnética">Ressonância Magnética (RM)</option>
              </select>
            </div>

            <div className="space-y-1.1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Ficheiro PACS Simulado *</label>
              <select
                className="w-full p-3 border border-slate-150 rounded-xl outline-none bg-white font-bold text-slate-700"
                value={uploadForm.mock_type}
                onChange={(e) => setUploadForm({ ...uploadForm, mock_type: e.target.value })}
              >
                <option value="raio_x_torax">Raio-X Tórax Standard</option>
                <option value="mri_brain">MRI Cerebral T2</option>
                <option value="eco_abdomen">Ecografia Abdominal G-OB</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Região Anatómica Examinada *</label>
            <input
              type="text"
              required
              placeholder="Ex: Tórax AP e Lat, Crânio Axial, Abdómen Superior..."
              className="w-full p-3 border border-slate-150 rounded-xl font-bold bg-white outline-none focus:border-sky-500"
              value={uploadForm.region}
              onChange={(e) => setUploadForm({ ...uploadForm, region: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Observações do Técnico / Indicação Clínica</label>
            <textarea
              placeholder="Indique os motivos do exame ou observações gerais..."
              className="w-full p-3 border border-slate-150 rounded-xl min-h-[70px] outline-none"
              value={uploadForm.notes}
              onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
            />
          </div>

          {/* Graphical Drag & Drop Zone */}
          <div className="border border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-extrabold text-slate-700 mt-2 text-[11px] uppercase">Arraste Ficheiros DICOM / Imagens PNG / PDFs</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Limite máximo de 20MB. Vinculado automaticamente à ficha SISA.</p>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-sky-600 hover:bg-sky-550 text-white font-extrabold rounded-xl transition-all shadow-md shadow-sky-600/10 cursor-pointer text-center"
            >
              {isSubmitting ? 'Gravando Estudo...' : 'Registrar Estudo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: GRAVAR LAUDO DIAGNÓSTICO */}
      <Modal
        isOpen={isLaudoModalOpen}
        onClose={() => setIsLaudoModalOpen(false)}
        title={`Gravar Laudo de Imagiologia SISA - ${selectedExam?.patient_name}`}
        className="max-w-lg"
      >
        {selectedExam && (
          <form onSubmit={handleLaudarExam} className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 mb-2">
              <p className="font-bold text-slate-800">Estudo Tecnológico: {selectedExam.exam_type} ({selectedExam.region})</p>
              <p className="text-[10px] text-slate-400">Solicitado por: {selectedExam.requester}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Classificação Clínica do Diagnóstico *</label>
              <select
                className="w-full p-3 border border-slate-150 rounded-xl outline-none bg-white font-bold text-slate-700"
                value={laudoForm.result}
                onChange={(e) => setLaudoForm({ ...laudoForm, result: e.target.value })}
              >
                <option value="Normal">Normal (Ausência de Alterações Patológicas)</option>
                <option value="Alterado">Alterado (Achados patológicos descritos)</option>
                <option value="Crítico / Urgência">Crítico / Urgência (Requer avaliação urgente!)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Descrição Detalhada do Laudo / Observações Radiológicas *</label>
              <textarea
                required
                placeholder="Insira o laudo médico detalhado, dados pleuropulmonares, densidade tissular, etc..."
                className="w-full p-3 border border-slate-150 rounded-xl min-h-[140px] outline-none font-medium leading-normal bg-white"
                value={laudoForm.notes}
                onChange={(e) => setLaudoForm({ ...laudoForm, notes: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Conclusão Sintética Diagnóstica *</label>
              <input
                type="text"
                required
                placeholder="Ex: Exame de tórax sem alterações. Sinais ecográficos de colecistite..."
                className="w-full p-3 border border-slate-150 rounded-xl bg-white font-bold outline-none"
                value={laudoForm.conclusion}
                onChange={(e) => setLaudoForm({ ...laudoForm, conclusion: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Responsável Clínico (Assinatura Certificada) L. nº</label>
              <input
                type="text"
                placeholder={`${currentDoctor?.full_name} ...`}
                className="w-full p-3 border border-slate-150 rounded-xl bg-slate-50 text-slate-600 font-bold outline-none"
                value={laudoForm.doctor_signature}
                onChange={(e) => setLaudoForm({ ...laudoForm, doctor_signature: e.target.value })}
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsLaudoModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-navy hover:bg-navy/95 text-white font-black rounded-xl transition-all shadow-md cursor-pointer text-center"
              >
                Gravar Laudo Oficial
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
