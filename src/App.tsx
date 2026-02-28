import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Utensils, 
  Dumbbell, 
  BookOpen, 
  Trophy, 
  Timer as TimerIcon,
  ChevronRight,
  Flame,
  Star,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  History as HistoryIcon,
  Award,
  Calendar as CalendarIcon,
  ChevronLeft,
  Scale,
  ShieldAlert,
  Clock,
  Ban,
  Gavel
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths, 
  differenceInMonths,
  parseISO,
  startOfToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserProfile, Technique, Workout, Achievement, HistoryItem, ScheduleItem, Diet } from './types';

// --- Components ---

const XPBar = ({ current, max, label }: { current: number, max: number, label?: string }) => {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-xs mb-1 text-zinc-400"><span>{label}</span><span>{current}/{max} XP</span></div>}
      <div className="xp-bar-container">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="xp-bar-fill" 
        />
      </div>
    </div>
  );
};

const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void, key?: any }) => (
  <motion.div 
    whileTap={onClick ? { scale: 0.98 } : {}}
    onClick={onClick}
    className={`card-gradient p-4 rounded-2xl border border-zinc-800/50 shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><Plus className="rotate-45" /></button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// --- Modules ---

const Dashboard = ({ profile, onQuickAction, onProfileUpdate }: { profile: UserProfile | null, onQuickAction: (action: string) => void, onProfileUpdate: () => void }) => {
  const [quote, setQuote] = useState("O tatame não mente.");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const quotes = [
      "O tatame não mente.",
      "Disciplina é a ponte entre metas e realizações.",
      "Um faixa preta é um faixa branca que nunca desistiu.",
      "A técnica supera a força.",
      "Resiliência é a chave do sucesso no BJJ."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  if (!profile) return <div className="p-8 text-center">Carregando...</div>;

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        height: parseFloat(data.height as string),
        weight: parseFloat(data.weight as string),
        stripes: parseInt(data.stripes as string)
      })
    }).then(() => {
      onProfileUpdate();
      setIsModalOpen(false);
    });
  };

  const getBeltColor = (belt: string) => {
    switch(belt) {
      case 'Azul': return 'bg-blue-600';
      case 'Roxa': return 'bg-purple-600';
      case 'Marrom': return 'bg-amber-800';
      case 'Preta': return 'bg-zinc-950';
      default: return 'bg-white';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <h1 className="text-2xl font-bold">Olá, {profile.name}</h1>
          <p className="text-zinc-400 text-sm">Pronto para o treino de hoje?</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
          <Flame size={16} className="text-orange-500" />
          <span className="font-bold">Foco Total</span>
        </div>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Perfil">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Nome</label>
            <input name="name" defaultValue={profile.name} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Altura (m)</label>
              <input name="height" defaultValue={profile.height} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Peso (kg)</label>
              <input name="weight" defaultValue={profile.weight} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Faixa</label>
              <select name="belt" defaultValue={profile.belt} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none">
                {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Graus (0-4)</label>
              <input name="stripes" type="number" min="0" max="4" defaultValue={profile.stripes} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Data de Início na Faixa</label>
            <input name="belt_start_date" type="date" defaultValue={profile.belt_start_date?.split('T')[0]} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Objetivo</label>
            <textarea name="objective" defaultValue={profile.objective} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
          </div>
          <button type="submit" className="w-full bg-bjj-red py-4 rounded-2xl font-bold mt-4">Salvar</button>
        </form>
      </Modal>

      <Card className="bg-zinc-900/50 border-zinc-800 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-2 h-full ${getBeltColor(profile.belt)}`} />
        <div className="pl-4">
          <p className="italic text-zinc-400 text-sm mb-4">"{quote}"</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Graduação Atual</p>
              <p className="text-xl font-bold">{profile.belt} {profile.stripes > 0 && `(${profile.stripes}º Grau)`}</p>
            </div>
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-1.5 h-6 rounded-sm ${i < profile.stripes ? 'bg-white' : 'bg-zinc-800'}`} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card onClick={() => onQuickAction('timer')} className="flex flex-col items-center justify-center py-6 gap-2">
          <TimerIcon className="text-bjj-red" size={32} />
          <span className="font-medium">Cronômetro</span>
        </Card>
        <Card onClick={() => onQuickAction('techniques')} className="flex flex-col items-center justify-center py-6 gap-2">
          <BookOpen className="text-bjj-red" size={32} />
          <span className="font-medium">Técnicas</span>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Star size={20} className="text-yellow-500" />
          Resumo do Dia
        </h2>
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg">
              <Dumbbell size={20} className="text-zinc-400" />
            </div>
            <div>
              <p className="font-medium">Treino A</p>
              <p className="text-xs text-zinc-500">Parte Superior</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-600" />
        </Card>
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg">
              <Utensils size={20} className="text-zinc-400" />
            </div>
            <div>
              <p className="font-medium">Dieta Manutenção</p>
              <p className="text-xs text-zinc-500">2500 kcal • 150g Prot</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-600" />
        </Card>
      </section>
    </div>
  );
};

const Nutrition = () => {
  const [activeTab, setActiveTab] = useState<'plan' | 'hydration'>('plan');
  const [diets, setDiets] = useState<Diet[]>([]);
  const [editingDiet, setEditingDiet] = useState<Diet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDiets = () => {
    fetch('/api/diets').then(res => res.json()).then(setDiets);
  };

  useEffect(() => {
    fetchDiets();
  }, []);

  const handleSaveDiet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const method = editingDiet?.id ? 'PATCH' : 'POST';
    const url = editingDiet?.id ? `/api/diets/${editingDiet.id}` : '/api/diets';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(() => {
      fetchDiets();
      setIsModalOpen(false);
      setEditingDiet(null);
    });
  };

  const handleDeleteDiet = (id: number) => {
    if (confirm('Tem certeza?')) {
      fetch(`/api/diets/${id}`, { method: 'DELETE' }).then(fetchDiets);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nutrição</h1>
        {activeTab === 'plan' && (
          <button 
            onClick={() => { setEditingDiet(null); setIsModalOpen(true); }}
            className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-bjj-red"
          >
            <Plus size={20} />
          </button>
        )}
      </div>
      
      <div className="flex bg-zinc-900 p-1 rounded-xl">
        <button 
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'plan' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
        >
          Planos
        </button>
        <button 
          onClick={() => setActiveTab('hydration')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'hydration' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
        >
          Hidratação
        </button>
      </div>

      {activeTab === 'plan' ? (
        <div className="space-y-4">
          {diets.map((diet) => (
            <Card key={diet.id} className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{diet.title}</h3>
                <span className={`text-sm font-bold ${diet.color}`}>{diet.kcal}</span>
              </div>
              <p className="text-sm text-zinc-400">{diet.macros}</p>
              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => { setEditingDiet(diet); setIsModalOpen(true); }}
                  className="flex-1 bg-zinc-800 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDeleteDiet(diet.id)}
                  className="px-4 bg-zinc-900 border border-zinc-800 py-2 rounded-lg text-xs font-bold text-zinc-500"
                >
                  Excluir
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-8 space-y-4">
          <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
            <span className="text-3xl font-bold text-blue-500">3.5L</span>
          </div>
          <div>
            <h3 className="text-xl font-bold">Meta Diária</h3>
            <p className="text-zinc-400">Baseado em 75kg e treino intenso</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[250, 500, 750, 1000].map(ml => (
              <button key={ml} className="bg-zinc-900 border border-zinc-800 py-3 rounded-xl text-xs font-bold active:bg-blue-500/20 active:border-blue-500/50">
                +{ml}ml
              </button>
            ))}
          </div>
        </Card>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingDiet ? "Editar Dieta" : "Nova Dieta"}
      >
        <form onSubmit={handleSaveDiet} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Título</label>
            <input name="title" defaultValue={editingDiet?.title} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Calorias</label>
            <input name="kcal" defaultValue={editingDiet?.kcal} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" placeholder="ex: 2500 kcal" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Macronutrientes</label>
            <input name="macros" defaultValue={editingDiet?.macros} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" placeholder="ex: P: 150g | C: 300g" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Cor (Tailwind Class)</label>
            <input name="color" defaultValue={editingDiet?.color || 'text-white'} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" placeholder="ex: text-emerald-500" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Cardápio / Conteúdo</label>
            <textarea name="content" defaultValue={editingDiet?.content} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none min-h-[100px]" required />
          </div>
          <button type="submit" className="w-full bg-bjj-red py-4 rounded-2xl font-bold mt-4">Salvar</button>
        </form>
      </Modal>
    </div>
  );
};

const Workouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeType, setActiveType] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'Warmup'>('A');
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWorkouts = () => {
    fetch('/api/workouts')
      .then(res => res.json())
      .then(setWorkouts);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleCompleteWorkout = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today })
    }).then(() => {
      alert('Treino Concluído! Frequência registrada no calendário.');
    });
  };

  const handleSaveWorkout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const method = editingWorkout?.id ? 'PATCH' : 'POST';
    const url = editingWorkout?.id ? `/api/workouts/${editingWorkout.id}` : '/api/workouts';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, type: activeType })
    }).then(() => {
      fetchWorkouts();
      setIsModalOpen(false);
      setEditingWorkout(null);
    });
  };

  const handleDeleteWorkout = (id: number) => {
    if (confirm('Tem certeza?')) {
      fetch(`/api/workouts/${id}`, { method: 'DELETE' }).then(fetchWorkouts);
    }
  };

  const filtered = workouts.filter(w => w.type === activeType);

  const getTabLabel = (type: string) => {
    switch(type) {
      case 'A': return 'Superior';
      case 'B': return 'Inferior';
      case 'C': return 'Core/Explosão';
      case 'D': return 'Drills';
      case 'E': return 'Pegada';
      case 'F': return 'Mobilidade';
      case 'Warmup': return 'Aquecer';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Treinos</h1>
        <button 
          onClick={() => { setEditingWorkout(null); setIsModalOpen(true); }}
          className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-bjj-red"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="flex bg-zinc-900 p-1 rounded-xl overflow-x-auto no-scrollbar gap-1">
        {(['A', 'B', 'C', 'D', 'E', 'F', 'Warmup'] as const).map(type => (
          <button 
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${activeType === type ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
          >
            {getTabLabel(type)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(workout => (
          <Card key={workout.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                onClick={() => { setEditingWorkout(workout); setIsModalOpen(true); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border cursor-pointer ${workout.completed ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}
              >
                {workout.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>
              <div onClick={() => { setEditingWorkout(workout); setIsModalOpen(true); }} className="cursor-pointer">
                <h4 className="font-bold">{workout.name}</h4>
                <p className="text-xs text-zinc-500">{workout.sets}x{workout.reps} • {workout.rest}s descanso</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">{workout.muscle_group}</span>
              <button onClick={() => handleDeleteWorkout(workout.id)} className="text-zinc-700 hover:text-red-500"><Plus className="rotate-45" size={16} /></button>
            </div>
          </Card>
        ))}
        <button 
          onClick={handleCompleteWorkout}
          className="w-full bg-bjj-red py-4 rounded-2xl font-bold shadow-lg shadow-bjj-red/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          Concluir Treino (+50 XP)
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingWorkout ? "Editar Exercício" : "Novo Exercício"}
      >
        <form onSubmit={handleSaveWorkout} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Nome do Exercício</label>
            <input name="name" defaultValue={editingWorkout?.name} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Séries</label>
              <input name="sets" type="number" defaultValue={editingWorkout?.sets} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Repetições</label>
              <input name="reps" defaultValue={editingWorkout?.reps} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" placeholder="ex: 12 ou 60s" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Descanso (s)</label>
              <input name="rest" type="number" defaultValue={editingWorkout?.rest} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Grupo Muscular</label>
              <input name="muscle_group" defaultValue={editingWorkout?.muscle_group} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
            </div>
          </div>
          <button type="submit" className="w-full bg-bjj-red py-4 rounded-2xl font-bold mt-4">Salvar</button>
        </form>
      </Modal>
    </div>
  );
};

const Techniques = () => {
  const [techs, setTechs] = useState<Technique[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('QUEDAS');
  const [editingTech, setEditingTech] = useState<Technique | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const categories = [
    'QUEDAS', 'PASSAGENS DE GUARDA', 'RASPAGENS', 
    'CONTROLES POSICIONAIS', 'FINALIZAÇÕES (ATAQUES)', 'DEFESAS'
  ];

  const fetchTechs = () => {
    fetch('/api/techniques')
      .then(res => res.json())
      .then(setTechs);
  };

  useEffect(() => {
    fetchTechs();
  }, []);

  const handleMasterTech = (tech: Technique) => {
    fetch(`/api/techniques/${tech.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'mastered' })
    }).then(() => {
      fetchTechs();
    });
  };

  const handleFavoriteTech = (tech: Technique) => {
    fetch(`/api/techniques/${tech.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorited: tech.favorited ? 0 : 1 })
    }).then(fetchTechs);
  };

  const handleSaveTech = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const method = editingTech?.id ? 'PATCH' : 'POST';
    const url = editingTech?.id ? `/api/techniques/${editingTech.id}` : '/api/techniques';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, category: selectedCategory })
    }).then(() => {
      fetchTechs();
      setIsModalOpen(false);
      setEditingTech(null);
    });
  };

  const handleDeleteTech = (id: number) => {
    if (confirm('Tem certeza?')) {
      fetch(`/api/techniques/${id}`, { method: 'DELETE' }).then(fetchTechs);
    }
  };

  const filtered = techs.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Biblioteca Técnica</h1>
        <button 
          onClick={() => { setEditingTech(null); setIsModalOpen(true); }}
          className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-bjj-red"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap uppercase tracking-wider ${selectedCategory === cat ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map(tech => {
          const isExpanded = expandedId === tech.id;
          const imageRef = tech.image_ref ? JSON.parse(tech.image_ref) : null;

          return (
            <Card key={tech.id} className="p-0 overflow-hidden border-zinc-800/50">
              <div 
                className="p-4 flex justify-between items-start cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : tech.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${tech.tipo === 'Ataque' ? 'bg-bjj-red/20 text-bjj-red' : 'bg-blue-500/20 text-blue-500'}`}>
                      {tech.tipo}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      tech.status === 'mastered' ? 'bg-emerald-500' :
                      tech.status === 'in_progress' ? 'bg-yellow-500' : 'bg-zinc-700'
                    }`} />
                  </div>
                  <h3 className="text-lg font-bold leading-tight">{tech.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{tech.objective}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleFavoriteTech(tech); }}
                    className={`transition-colors ${tech.favorited ? 'text-yellow-500' : 'text-zinc-700'}`}
                  >
                    <Star size={20} fill={tech.favorited ? 'currentColor' : 'none'} />
                  </button>
                  <ChevronRight size={20} className={`text-zinc-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-900 bg-zinc-950/50"
                  >
                    <div className="p-4 space-y-6">
                      {imageRef && (
                        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-center">
                          <p className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Referência Visual</p>
                          <p className="text-xs text-zinc-400 italic">"{imageRef.descricao_prompt_imagem}"</p>
                          <div className="mt-2 flex justify-center gap-4 text-[9px] font-bold text-zinc-600 uppercase">
                            <span>Ângulo: {imageRef.angulo}</span>
                            <span>Ambiente: {imageRef.ambiente}</span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <section>
                            <h4 className="text-[10px] font-black uppercase text-bjj-red tracking-widest mb-2">Situação Ideal</h4>
                            <p className="text-sm text-zinc-300">{tech.situation}</p>
                          </section>
                          <section>
                            <h4 className="text-[10px] font-black uppercase text-bjj-red tracking-widest mb-2">Passo a Passo</h4>
                            <div className="text-sm text-zinc-400 space-y-2 whitespace-pre-line">
                              {tech.steps}
                            </div>
                          </section>
                        </div>
                        <div className="space-y-4">
                          <section>
                            <h4 className="text-[10px] font-black uppercase text-bjj-red tracking-widest mb-2">Ajustes Finos</h4>
                            <p className="text-sm text-zinc-300">{tech.adjustments}</p>
                          </section>
                          <section>
                            <h4 className="text-[10px] font-black uppercase text-bjj-red tracking-widest mb-2">Erros Comuns</h4>
                            <p className="text-sm text-zinc-300">{tech.errors}</p>
                          </section>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-900 flex gap-3">
                        <button 
                          onClick={() => handleMasterTech(tech)}
                          disabled={tech.status === 'mastered'}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-colors ${tech.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-bjj-red text-white shadow-lg shadow-bjj-red/20'}`}
                        >
                          {tech.status === 'mastered' ? 'Dominada' : 'Marcar como Treinada (+10 XP)'}
                        </button>
                        <button 
                          onClick={() => { setEditingTech(tech); setIsModalOpen(true); }}
                          className="px-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400"
                        >
                          <Plus className="rotate-45" size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        }) : (
          <div className="text-center py-12 text-zinc-500">
            <AlertCircle className="mx-auto mb-2 opacity-20" size={48} />
            <p>Nenhuma técnica cadastrada nesta categoria.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTech ? "Editar Técnica" : "Nova Técnica"}
      >
        <form onSubmit={handleSaveTech} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Nome da Técnica</label>
            <input name="name" defaultValue={editingTech?.name} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Tipo</label>
              <select name="tipo" defaultValue={editingTech?.tipo} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none">
                <option value="Ataque">Ataque</option>
                <option value="Defesa">Defesa</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Status</label>
              <select name="status" defaultValue={editingTech?.status} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none">
                <option value="needs_improvement">Melhorar</option>
                <option value="in_progress">Em Progresso</option>
                <option value="mastered">Dominada</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Objetivo</label>
            <input name="objective" defaultValue={editingTech?.objective} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Situação Ideal</label>
            <input name="situation" defaultValue={editingTech?.situation} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Passo a Passo</label>
            <textarea name="steps" defaultValue={editingTech?.steps} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none min-h-[100px]" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Ajustes Finos</label>
              <textarea name="adjustments" defaultValue={editingTech?.adjustments} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Erros Comuns</label>
              <textarea name="errors" defaultValue={editingTech?.errors} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-bjj-red py-4 rounded-2xl font-bold mt-4">Salvar Técnica</button>
        </form>
      </Modal>
    </div>
  );
};

const Progress = ({ profile }: { profile: UserProfile | null }) => {
  const [attendance, setAttendance] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchAttendance = () => {
    fetch('/api/attendance').then(res => res.json()).then(setAttendance);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (!profile) return null;

  const toggleAttendance = (dateStr: string) => {
    const exists = attendance.includes(dateStr);
    if (exists) {
      fetch(`/api/attendance/${dateStr}`, { method: 'DELETE' }).then(fetchAttendance);
    } else {
      fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr })
      }).then(fetchAttendance);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getGraduationInfo = () => {
    if (!profile.belt_start_date) return null;
    const start = parseISO(profile.belt_start_date);
    const today = new Date();
    const monthsInBelt = differenceInMonths(today, start);
    
    let minMonths = 0;
    switch(profile.belt) {
      case 'Azul': minMonths = 24; break;
      case 'Roxa': minMonths = 18; break;
      case 'Marrom': minMonths = 12; break;
      case 'Preta': minMonths = 36; break; // IBJJF degrees take years
      default: minMonths = 12; // White belt estimate
    }

    const progress = Math.min(100, (monthsInBelt / minMonths) * 100);
    return { monthsInBelt, minMonths, progress };
  };

  const gradInfo = getGraduationInfo();

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-bold">Meu Progresso</h1>

      <Card className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarIcon size={20} className="text-bjj-red" />
            Frequência
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={20} /></button>
            <span className="text-sm font-bold uppercase">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-zinc-600">{d}</div>
          ))}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isTrained = attendance.includes(dateStr);
            const isToday = isSameDay(day, startOfToday());
            
            return (
              <button 
                key={dateStr}
                onClick={() => toggleAttendance(dateStr)}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  isTrained ? 'bg-bjj-red text-white' : 
                  isToday ? 'border border-bjj-red text-bjj-red' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">Treinos este mês:</p>
          <p className="text-sm font-bold">{attendance.filter(d => d.startsWith(format(currentMonth, 'yyyy-MM'))).length} dias</p>
        </div>
        <div className="flex justify-between items-center pt-1">
          <p className="text-xs text-zinc-500">Total no ano ({format(new Date(), 'yyyy')}):</p>
          <p className="text-sm font-bold text-bjj-red">{attendance.filter(d => d.startsWith(format(new Date(), 'yyyy'))).length} treinos</p>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" />
          Graduação (IBJJF)
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold">Tempo na Faixa {profile.belt}</p>
            <p className="text-xl font-bold">{gradInfo?.monthsInBelt || 0} meses</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase font-bold">Mínimo Exigido</p>
            <p className="text-sm font-bold">{gradInfo?.minMonths || 0} meses</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
            <span>Progresso para próxima graduação</span>
            <span>{Math.round(gradInfo?.progress || 0)}%</span>
          </div>
          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${gradInfo?.progress || 0}%` }}
              className="h-full bg-bjj-red"
            />
          </div>
        </div>

        <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Dica do Sistema</p>
          <p className="text-xs text-zinc-400">
            {gradInfo && gradInfo.progress >= 100 
              ? "Você já atingiu o tempo mínimo exigido pela IBJJF para esta faixa! Fale com seu mestre."
              : `Faltam aproximadamente ${gradInfo ? gradInfo.minMonths - gradInfo.monthsInBelt : '?'} meses de carência mínima.`}
          </p>
        </div>
      </Card>
    </div>
  );
};

const Timer = () => {
  const [time, setTime] = useState(300); // 5 minutes
  const [isActive, setIsActive] = useState(false);
  const [rounds, setRounds] = useState(5);
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    let interval: any = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      if (currentRound < rounds) {
        setCurrentRound(c => c + 1);
        setTime(300);
        // Play sound logic here
      } else {
        setIsActive(false);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, time, currentRound, rounds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-24 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-zinc-500">Round {currentRound}/{rounds}</h1>
        <div className="text-8xl font-black font-mono tracking-tighter text-white tabular-nums">
          {formatTime(time)}
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-xs">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`flex-1 py-6 rounded-3xl font-black text-xl uppercase tracking-widest shadow-2xl transition-all ${isActive ? 'bg-zinc-800 text-white' : 'bg-bjj-red text-white shadow-bjj-red/40'}`}
        >
          {isActive ? 'Pausar' : 'Iniciar'}
        </button>
        <button 
          onClick={() => { setIsActive(false); setTime(300); setCurrentRound(1); }}
          className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800"
        >
          <Plus className="rotate-45" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <Card className="text-center">
          <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Tempo</p>
          <p className="font-bold">5:00</p>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Descanso</p>
          <p className="font-bold">1:00</p>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Rounds</p>
          <p className="font-bold">{rounds}</p>
        </Card>
      </div>
    </div>
  );
};

const Schedule = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const days = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado', 'Domingo'];

  const fetchSchedule = () => {
    fetch('/api/schedule')
      .then(res => res.json())
      .then(setSchedule);
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleSaveSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(() => {
      fetchSchedule();
      setIsModalOpen(false);
    });
  };

  const handleDeleteSchedule = (id: number) => {
    if (confirm('Tem certeza?')) {
      fetch(`/api/schedule/${id}`, { method: 'DELETE' }).then(fetchSchedule);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Grade de Horários</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-bjj-red"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="space-y-6">
        {days.map(day => {
          const items = schedule.filter(s => s.day === day);
          if (items.length === 0) return null;
          
          return (
            <div key={day} className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-bjj-red border-l-2 border-bjj-red pl-3">{day}</h2>
              <div className="grid gap-2">
                {items.map(item => (
                  <Card key={item.id} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-zinc-300">{item.time}</span>
                      <span className="font-bold text-white">{item.activity}</span>
                    </div>
                    <button onClick={() => handleDeleteSchedule(item.id)} className="text-zinc-700 hover:text-red-500"><Plus className="rotate-45" size={16} /></button>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Novo Horário"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Dia da Semana</label>
            <select name="day" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Horário</label>
            <input name="time" placeholder="ex: 12:00h" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Atividade</label>
            <input name="activity" placeholder="ex: Jiu Jitsu" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-bjj-red outline-none" required />
          </div>
          <button type="submit" className="w-full bg-bjj-red py-4 rounded-2xl font-bold mt-4">Salvar</button>
        </form>
      </Modal>
    </div>
  );
};

const Rules = () => {
  const [activeSubTab, setActiveSubTab] = useState('points');

  const points = [
    { score: 4, actions: ['Montada', 'Montada pelas costas', 'Pegada pelas costas'] },
    { score: 3, actions: ['Passagem de guarda'] },
    { score: 2, actions: ['Queda', 'Raspagem', 'Joelho na barriga'] },
  ];

  const times = [
    { belt: 'Branca', time: '5 min' },
    { belt: 'Azul', time: '6 min' },
    { belt: 'Roxa', time: '7 min' },
    { belt: 'Marrom', time: '8 min' },
    { belt: 'Preta', time: '10 min' },
  ];

  const penalties = [
    { step: '1ª Falta', effect: 'Apenas marcação no placar' },
    { step: '2ª Falta', effect: 'Vantagem para o adversário' },
    { step: '3ª Falta', effect: '2 pontos para o adversário' },
    { step: '4ª Falta', effect: 'Desclassificação imediata' },
  ];

  const advantages = [
    { type: 'Quase Pontuação', desc: 'Quando o atleta chega em uma posição de pontuação mas não consegue estabilizar por 3 segundos.' },
    { type: 'Tentativa de Finalização', desc: 'Quando o atleta aplica um golpe que coloca o adversário em perigo real de desistência.' },
    { type: 'Domínio Técnico', desc: 'Movimentação quase completa de uma posição passível de pontuação.' },
  ];

  const decisions = [
    { type: 'Desistência', desc: 'Batida física (mão ou pé), verbal ou grito de dor.' },
    { type: 'Interrupção', desc: 'Câimbras, lesão grave ou sangramento inestancável.' },
    { type: 'Desclassificação', desc: 'Faltas gravíssimas ou acúmulo de 4 punições.' },
    { type: 'Perda dos Sentidos', desc: 'Desmaio por golpe legal ou acidente.' },
    { type: 'Placar', desc: 'Maior número de pontos, seguido de vantagens.' },
    { type: 'Decisão do Árbitro', desc: 'Em caso de empate total, o árbitro escolhe o mais ofensivo.' },
  ];

  const prohibited = [
    { move: 'Bate-estaca', age: 'Todas', belt: 'Todas' },
    { move: 'Chave de Calcanhar', age: 'Até 17 anos', belt: 'Branca a Marrom' },
    { move: 'Cervical (sem finalização)', age: 'Todas', belt: 'Todas' },
    { move: 'Mão de Vaca', age: 'Até 15 anos', belt: 'Todas' },
    { move: 'Suplex (cabeça no solo)', age: 'Todas', belt: 'Todas' },
    { move: 'Queda Tesoura', age: 'Todas', belt: 'Todas' },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Livro de Regras</h1>
        <div className="bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase">
          IBJJF 2024
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'points', label: 'Pontos', icon: Trophy },
          { id: 'advantages', label: 'Vantagens', icon: Star },
          { id: 'times', label: 'Tempos', icon: Clock },
          { id: 'penalties', label: 'Punições', icon: ShieldAlert },
          { id: 'decisions', label: 'Decisões', icon: Gavel },
          { id: 'prohibited', label: 'Proibidos', icon: Ban },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSubTab === tab.id ? 'bg-bjj-red text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'points' && (
            <div className="space-y-4">
              {points.map(p => (
                <Card key={p.score} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-xl font-black text-bjj-red border border-zinc-800">
                    {p.score}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Pontos</p>
                    <div className="flex flex-wrap gap-x-2">
                      {p.actions.map((a, i) => (
                        <span key={i} className="text-sm font-medium">
                          {a}{i < p.actions.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
              <div className="bg-zinc-900/30 p-4 rounded-2xl border border-dashed border-zinc-800">
                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Regra de Estabilização</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Os pontos só serão assinalados pelo árbitro central sempre que o atleta estabilizar por <span className="text-white font-bold">3 (três) segundos</span> a posição conquistada.
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'advantages' && (
            <div className="grid grid-cols-1 gap-3">
              {advantages.map((a, i) => (
                <Card key={i} className="p-4">
                  <p className="text-sm font-bold text-yellow-500 mb-1">{a.type}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{a.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {activeSubTab === 'times' && (
            <Card className="divide-y divide-zinc-800 p-0 overflow-hidden">
              {times.map(t => (
                <div key={t.belt} className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      t.belt === 'Branca' ? 'bg-white' :
                      t.belt === 'Azul' ? 'bg-blue-600' :
                      t.belt === 'Roxa' ? 'bg-purple-600' :
                      t.belt === 'Marrom' ? 'bg-amber-800' : 'bg-zinc-950 border border-zinc-700'
                    }`} />
                    <span className="font-bold text-sm">{t.belt}</span>
                  </div>
                  <span className="text-sm font-mono text-zinc-400">{t.time}</span>
                </div>
              ))}
              <div className="p-4 bg-zinc-900/50">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Nota:</p>
                <p className="text-[10px] text-zinc-500">Tempos válidos para a categoria Adulto.</p>
              </div>
            </Card>
          )}

          {activeSubTab === 'penalties' && (
            <div className="space-y-3">
              {penalties.map((p, i) => (
                <div key={i} className="flex gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-500 border border-zinc-800">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{p.step}</p>
                    <p className="text-xs text-zinc-500">{p.effect}</p>
                  </div>
                </div>
              ))}
              <div className="p-4 bg-bjj-red/5 border border-bjj-red/20 rounded-2xl mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-bjj-red" />
                  <p className="text-xs font-bold uppercase text-bjj-red">Falta de Combatividade</p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  O árbitro contará 20 segundos consecutivos e fará o gesto de "Lute". A punição segue a mesma sequência acima.
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'decisions' && (
            <div className="grid grid-cols-1 gap-3">
              {decisions.map((d, i) => (
                <Card key={i} className="p-4">
                  <p className="text-sm font-bold text-bjj-red mb-1">{d.type}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{d.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {activeSubTab === 'prohibited' && (
            <div className="space-y-3">
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-500 uppercase font-bold">
                    <tr>
                      <th className="p-3">Golpe</th>
                      <th className="p-3">Idade</th>
                      <th className="p-3">Faixa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {prohibited.map((p, i) => (
                      <tr key={i}>
                        <td className="p-3 font-medium text-zinc-200">{p.move}</td>
                        <td className="p-3 text-zinc-500">{p.age}</td>
                        <td className="p-3 text-zinc-500">{p.belt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Atenção</p>
                <p className="text-[10px] text-zinc-500">Esta é uma lista resumida. Consulte o livro de regras oficial para a lista completa de golpes proibidos por categoria.</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = () => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(setProfile);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleQuickAction = (action: string) => {
    setActiveTab(action);
  };

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
    { id: 'schedule', icon: CalendarIcon, label: 'Agenda' },
    { id: 'nutrition', icon: Utensils, label: 'Dieta' },
    { id: 'workouts', icon: Dumbbell, label: 'Treino' },
    { id: 'techniques', icon: BookOpen, label: 'Técnicas' },
    { id: 'progress', icon: Trophy, label: 'Progresso' },
    { id: 'rules', icon: Scale, label: 'Regras' },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black relative">
      <main className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard profile={profile} onQuickAction={handleQuickAction} onProfileUpdate={fetchProfile} />}
            {activeTab === 'schedule' && <Schedule />}
            {activeTab === 'nutrition' && <Nutrition />}
            {activeTab === 'workouts' && <Workouts />}
            {activeTab === 'techniques' && <Techniques />}
            {activeTab === 'progress' && <Progress profile={profile} />}
            {activeTab === 'rules' && <Rules />}
            {activeTab === 'timer' && <Timer />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/50 px-6 py-3 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-bjj-red scale-110' : 'text-zinc-500'}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
