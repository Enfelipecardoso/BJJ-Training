import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("bjj_elite.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY,
    name TEXT DEFAULT 'Guerreiro',
    height REAL DEFAULT 1.75,
    weight REAL DEFAULT 75.0,
    objective TEXT DEFAULT 'Performance',
    belt TEXT DEFAULT 'Branca',
    belt_start_date TEXT, -- ISO Date
    stripes INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE -- YYYY-MM-DD
  );

  CREATE TABLE IF NOT EXISTS xp_stats (
    id INTEGER PRIMARY KEY,
    total_xp INTEGER DEFAULT 0,
    level TEXT DEFAULT 'Iniciante',
    streak INTEGER DEFAULT 0,
    last_action_date TEXT
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    unlocked INTEGER DEFAULT 0,
    date TEXT,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS techniques (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    type TEXT,
    objective TEXT,
    situation TEXT,
    steps TEXT, -- Store as JSON string or text
    adjustments TEXT,
    errors TEXT,
    safety TEXT,
    strategy TEXT,
    image_ref TEXT, -- Store as JSON string
    status TEXT DEFAULT 'needs_improvement', -- 'mastered', 'in_progress', 'needs_improvement'
    favorited INTEGER DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    action TEXT,
    xp INTEGER
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT, -- 'A', 'B', 'C', 'Warmup'
    name TEXT,
    sets INTEGER,
    reps TEXT,
    rest INTEGER,
    muscle_group TEXT,
    completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT,
    time TEXT,
    activity TEXT
  );

  CREATE TABLE IF NOT EXISTS diets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    kcal TEXT,
    macros TEXT,
    color TEXT,
    content TEXT -- JSON or string for cardápio
  );
`);

// Seed initial data if empty
const profileCount = db.prepare("SELECT COUNT(*) as count FROM user_profile").get() as { count: number };
if (profileCount.count === 0) {
  db.prepare("INSERT INTO user_profile (id, belt_start_date) VALUES (1, ?)").run(new Date().toISOString());
  db.prepare("INSERT INTO xp_stats (id) VALUES (1)").run();
  
  // Seed some techniques
  const techniques = [
    [
      'Single Leg', 'QUEDAS', 'Ataque', 'Derrubar o oponente controlando uma perna', 'Oponente em pé com base paralela ou avançada', 
      '1. Faça a pegada na gola e manga; 2. Entre com o joelho no chão entre as pernas do oponente; 3. Abrace a perna do oponente; 4. Levante-se mantendo a perna presa; 5. Derrube o oponente.',
      'Mantenha a cabeça colada no peito do oponente', 'Deixar a cabeça baixa facilitando a guilhotina', 'Cuidado com o sprawl', 'Explosão e timing',
      JSON.stringify({ descricao_prompt_imagem: "Atleta de kimono abraçando a perna do oponente em pé", angulo: "lateral", posicoes_corpo: "um em pé, outro agachado", ambiente: "tatame neutro" })
    ],
    [
      'Double Leg', 'QUEDAS', 'Ataque', 'Derrubar o oponente controlando as duas pernas', 'Oponente em pé com base alta', 
      '1. Nivele o quadril; 2. Entre com os dois joelhos próximos aos pés do oponente; 3. Abrace as duas pernas atrás dos joelhos; 4. Empurre com o ombro e puxe as pernas; 5. Derrube lateralmente.',
      'Mantenha as costas retas na entrada', 'Entrar de longe sem quebrar a postura', 'Cuidado com a guilhotina', 'Velocidade e pressão',
      JSON.stringify({ descricao_prompt_imagem: "Atleta entrando nas duas pernas do oponente", angulo: "diagonal", posicoes_corpo: "entrada de queda", ambiente: "tatame neutro" })
    ],
    [
      'Torreando', 'PASSAGENS DE GUARDA', 'Ataque', 'Passar a guarda controlando as calças', 'Oponente de guarda aberta', 
      '1. Faça pegada nas calças na altura dos joelhos; 2. Empurre as pernas para o lado; 3. Circule para o lado oposto; 4. Estabilize no controle lateral.',
      'Mantenha os braços esticados para evitar a reposição', 'Ficar muito próximo das pernas sem controle', 'Cuidado com triângulos', 'Movimentação lateral rápida',
      JSON.stringify({ descricao_prompt_imagem: "Atleta em pé empurrando as pernas do oponente no chão", angulo: "superior", posicoes_corpo: "um em pé, outro deitado", ambiente: "tatame neutro" })
    ],
    [
      'Armbar da Guarda', 'FINALIZAÇÕES (ATAQUES)', 'Ataque', 'Finalizar o oponente com chave de braço', 'Oponente dentro da sua guarda fechada', 
      '1. Controle o braço e a gola; 2. Coloque o pé no quadril; 3. Gire o corpo e passe a perna sobre a cabeça; 4. Aperte os joelhos e eleve o quadril.',
      'Mantenha o braço do oponente colado ao seu peito', 'Deixar espaço entre o seu quadril e o ombro dele', 'Cuidado com o amassamento', 'Isolamento do braço',
      JSON.stringify({ descricao_prompt_imagem: "Atleta aplicando chave de braço da guarda fechada", angulo: "lateral", posicoes_corpo: "um por cima, outro por baixo", ambiente: "tatame neutro" })
    ],
    [
      'Mata-leão', 'FINALIZAÇÕES (ATAQUES)', 'Ataque', 'Finalizar o oponente com estrangulamento pelas costas', 'Você nas costas do oponente com ganchos', 
      '1. Passe o braço pelo pescoço; 2. Segure no seu próprio bíceps; 3. Coloque a outra mão atrás da cabeça; 4. Aperte e expire.',
      'Esconda a mão atrás da cabeça para evitar a defesa', 'Não fechar os cotovelos', 'Cuidado com a defesa de mão', 'Controle total das costas',
      JSON.stringify({ descricao_prompt_imagem: "Atleta aplicando mata-leão pelas costas", angulo: "diagonal", posicoes_corpo: "um nas costas do outro", ambiente: "tatame neutro" })
    ],
    [
      'Escape da Montada', 'DEFESAS', 'Defesa', 'Sair da posição de montada', 'Oponente montado sobre você', 
      '1. Proteja o pescoço; 2. Prenda um braço e a perna do mesmo lado; 3. Faça a ponte (upa); 4. Gire para o lado do braço preso; 5. Caia na guarda.',
      'Explosão no quadril é fundamental', 'Tentar empurrar o oponente com as mãos', 'Cuidado com armbars durante a saída', 'Timing do upa',
      JSON.stringify({ descricao_prompt_imagem: "Atleta fazendo ponte para sair da montada", angulo: "lateral", posicoes_corpo: "um montado, outro por baixo", ambiente: "tatame neutro" })
    ]
  ];
  const insertTech = db.prepare("INSERT INTO techniques (name, category, type, objective, situation, steps, adjustments, errors, safety, strategy, image_ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  techniques.forEach(t => insertTech.run(...t));

  // Seed achievements
  const achievements = [
    ['Primeiro Passo', 'Consistência', 'check-circle', 1, new Date().toISOString()],
    ['Técnico', 'Técnica', 'book-open', 0, null],
    ['Monstro', 'Física', 'dumbbell', 0, null],
    ['Competidor', 'Competição', 'trophy', 0, null],
    ['Mestre da Dieta', 'Consistência', 'utensils', 0, null],
  ];
  const insertAch = db.prepare("INSERT INTO achievements (name, category, icon, unlocked, date) VALUES (?, ?, ?, ?, ?)");
  achievements.forEach(a => insertAch.run(...a));

  // Seed workouts
  const workouts = [
    // Treino A - Superior (Força e Estabilidade Escapular)
    ['A', 'Supino com Halteres (Estabilidade)', 4, '10', 60, 'Peito'],
    ['A', 'Remada Curvada com Pegada Pronada', 4, '10', 60, 'Costas'],
    ['A', 'Barra Fixa com Kimono (Grip)', 3, 'Falha', 90, 'Costas/Pegada'],
    ['A', 'Desenvolvimento Militar (Strict Press)', 3, '12', 60, 'Ombros'],
    ['A', 'Paralelas (Dips) com Peso', 3, '10', 60, 'Tríceps/Peito'],
    ['A', 'Face Pulls (Saúde do Ombro)', 3, '15', 45, 'Deltoide Posterior'],
    ['A', 'Flexão de Braço Explosiva', 3, '15', 45, 'Peito/Potência'],

    // Treino B - Inferior (Base, Torque e Prevenção de Lesões)
    ['B', 'Agachamento Costas (Back Squat)', 4, '10', 90, 'Pernas'],
    ['B', 'Levantamento Terra Convencional', 3, '6', 120, 'Cadeia Posterior'],
    ['B', 'Agachamento Búlgaro (Unilateral)', 3, '10 (cada)', 60, 'Pernas/Estabilidade'],
    ['B', 'Stiff (RDL)', 3, '12', 60, 'Posterior/Lombar'],
    ['B', 'Elevação Pélvica Pesada', 4, '12', 60, 'Glúteos/Quadril'],
    ['B', 'Copenhagen Plank (Adutores)', 3, '30s (cada)', 45, 'Adutores/Core'],
    ['B', 'Panturrilha Sentado', 4, '15', 45, 'Pernas'],

    // Treino C - Core e Explosão (Específico para Passagem e Raspagem)
    ['C', 'Kettlebell Swing (Heavy)', 4, '20', 45, 'Potência de Quadril'],
    ['C', 'Medicine Ball Slam (Vertical)', 3, '15', 45, 'Potência Superior'],
    ['C', 'Burpees Over Bar', 4, '12', 60, 'Cardio/Explosão'],
    ['C', 'Prancha com Toque no Ombro', 3, '20 (total)', 30, 'Core Antirrotacional'],
    ['C', 'Russian Twist com Anilha', 3, '20 (cada)', 30, 'Core Rotacional'],
    ['C', 'Abdominal Canivete (V-Ups)', 3, '15', 30, 'Core Total'],
    ['C', 'L-Sit (Progressão)', 3, '20s', 45, 'Core/Compressão'],

    // Treino D - Condicionamento e Drills (Simulação de Luta)
    ['D', 'Sprawl + Entrada de Queda', 4, '10', 60, 'Agilidade'],
    ['D', 'Sombra de Jiu-Jitsu (Movimentação)', 3, '3 min', 60, 'Técnica/Cardio'],
    ['D', 'Pular Corda (Double Unders)', 3, '2 min', 45, 'Cardio/Coordenação'],
    ['D', 'Passagem de Guarda no Saco/Bola', 3, '2 min', 60, 'Agilidade/Drill'],
    ['D', 'Escalada de Montanha (Mountain Climbers)', 3, '45s', 30, 'Cardio/Core'],

    // Treino E - Pegada e Antebraço (O Segredo do Controle)
    ['E', 'Farmer Walk (Caminhada do Fazendeiro)', 3, '40m', 60, 'Pegada/Core'],
    ['E', 'Rosca Direta com Toalha', 3, '12', 45, 'Antebraço/Bíceps'],
    ['E', 'Suspensão na Barra Fixa (Dead Hang)', 3, 'Máximo', 60, 'Resistência de Pegada'],
    ['E', 'Extensão de Punho com Halter', 3, '15', 30, 'Antebraço'],
    ['E', 'Aperto de Handgrip', 3, '20 (cada)', 30, 'Força de Esmagamento'],

    // Treino F - Mobilidade e Recuperação (Yoga para BJJ)
    ['F', 'Mobilidade de Quadril 90/90', 3, '10 (cada)', 0, 'Mobilidade'],
    ['F', 'Postura do Pombo (Pigeon Pose)', 2, '60s (cada)', 0, 'Glúteos/Quadril'],
    ['F', 'Cobra para Cão Olhando Baixo', 3, '10 reps', 0, 'Coluna/Posterior'],
    ['F', 'Mobilidade de Tornozelo', 2, '15 (cada)', 0, 'Base'],
    ['F', 'Alongamento de Peitoral na Parede', 2, '45s (cada)', 0, 'Postura'],

    // Warmup (Aquecimento Específico de Tatame)
    ['Warmup', 'Rolamentos (Frente, Trás, Ombro)', 2, '12', 0, 'Mobilidade'],
    ['Warmup', 'Fuga de Quadril (4 direções)', 2, '20', 0, 'Mobilidade'],
    ['Warmup', 'Ponte com Rotação (Upa)', 2, '16', 0, 'Mobilidade/Core'],
    ['Warmup', 'Shrimping (Fuga de Quadril)', 2, '20m', 0, 'Mobilidade'],
    ['Warmup', 'Entrada de Queda (Shadow)', 2, '15', 0, 'Aquecimento'],
  ];
  const insertWorkout = db.prepare("INSERT INTO workouts (type, name, sets, reps, rest, muscle_group) VALUES (?, ?, ?, ?, ?, ?)");
  workouts.forEach(w => insertWorkout.run(...w));

  // Seed schedule
  const schedule = [
    ['Segunda-Feira', '12:00', 'Jiu Jitsu'],
    ['Segunda-Feira', '20:15', 'Jiu Jitsu'],
    ['Terça-Feira', '08:30', 'Jiu Jitsu'],
    ['Terça-Feira', '12:00', 'NOGI'],
    ['Terça-Feira', '15:30', 'Jiu Jitsu'],
    ['Quarta-Feira', '12:00', 'Jiu Jitsu'],
    ['Quarta-Feira', '20:15', 'Jiu Jitsu'],
    ['Quinta-Feira', '08:30', 'Jiu Jitsu'],
    ['Quinta-Feira', '12:00', 'NOGI'],
    ['Quinta-Feira', '20:15', 'Jiu Jitsu'],
    ['Sexta-Feira', '12:00', 'Jiu Jitsu'],
    ['Sexta-Feira', '19:40', 'NOGI'],
    ['Sábado', '10:00', 'OPEN MAT'],
  ];
  const insertSchedule = db.prepare("INSERT INTO schedule (day, time, activity) VALUES (?, ?, ?)");
  schedule.forEach(s => insertSchedule.run(...s));

  // Seed diets
  const diets = [
    ["Ganho de Massa", "3200 kcal", "P: 180g | C: 400g | G: 80g", "text-emerald-500", "Café: 4 ovos + Aveia..."],
    ["Cutting", "2200 kcal", "P: 200g | C: 150g | G: 60g", "text-orange-500", "Café: Omelete de claras..."],
    ["Manutenção", "2700 kcal", "P: 160g | C: 300g | G: 70g", "text-blue-500", "Café: Pão integral + Queijo..."],
  ];
  const insertDiet = db.prepare("INSERT INTO diets (title, kcal, macros, color, content) VALUES (?, ?, ?, ?, ?)");
  diets.forEach(d => insertDiet.run(...d));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/profile", (req, res) => {
    const profile = db.prepare("SELECT * FROM user_profile WHERE id = 1").get();
    res.json(profile);
  });

  app.patch("/api/profile", (req, res) => {
    const fields = Object.keys(req.body).map(key => `${key} = ?`).join(", ");
    const values = Object.values(req.body);
    db.prepare(`UPDATE user_profile SET ${fields} WHERE id = 1`).run(...values);
    res.json({ success: true });
  });

  app.get("/api/attendance", (req, res) => {
    const attendance = db.prepare("SELECT date FROM attendance").all();
    res.json(attendance.map((a: any) => a.date));
  });

  app.post("/api/attendance", (req, res) => {
    const { date } = req.body; // YYYY-MM-DD
    try {
      db.prepare("INSERT INTO attendance (date) VALUES (?)").run(date);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Data já registrada ou inválida" });
    }
  });

  app.delete("/api/attendance/:date", (req, res) => {
    db.prepare("DELETE FROM attendance WHERE date = ?").run(req.params.date);
    res.json({ success: true });
  });

  app.post("/api/xp", (req, res) => {
    const { amount, action } = req.body;
    const stats = db.prepare("SELECT * FROM xp_stats WHERE id = 1").get() as any;
    const newXp = stats.total_xp + amount;
    
    let level = 'Iniciante';
    if (newXp >= 6000) level = 'Elite';
    else if (newXp >= 3000) level = 'Dominante';
    else if (newXp >= 1500) level = 'Competidor';
    else if (newXp >= 500) level = 'Guerreiro';

    db.prepare("UPDATE xp_stats SET total_xp = ?, level = ? WHERE id = 1").run(newXp, level);
    db.prepare("INSERT INTO history (date, action, xp) VALUES (?, ?, ?)").run(new Date().toISOString(), action, amount);
    
    res.json({ total_xp: newXp, level });
  });

  app.get("/api/techniques", (req, res) => {
    const techs = db.prepare("SELECT * FROM techniques").all();
    res.json(techs);
  });

  app.post("/api/techniques", (req, res) => {
    const { name, category, type, objective, situation, steps, adjustments, errors, safety, strategy, image_ref } = req.body;
    const result = db.prepare("INSERT INTO techniques (name, category, type, objective, situation, steps, adjustments, errors, safety, strategy, image_ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(name, category, type, objective, situation, steps, adjustments, errors, safety, strategy, image_ref);
    res.json({ id: result.lastInsertRowid });
  });

  app.patch("/api/techniques/:id", (req, res) => {
    const { id } = req.params;
    const fields = Object.keys(req.body).map(key => `${key} = ?`).join(", ");
    const values = Object.values(req.body);
    db.prepare(`UPDATE techniques SET ${fields} WHERE id = ?`).run(...values, id);
    res.json({ success: true });
  });

  app.delete("/api/techniques/:id", (req, res) => {
    db.prepare("DELETE FROM techniques WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/workouts", (req, res) => {
    const workouts = db.prepare("SELECT * FROM workouts").all();
    res.json(workouts);
  });

  app.post("/api/workouts", (req, res) => {
    const { type, name, sets, reps, rest, muscle_group } = req.body;
    const result = db.prepare("INSERT INTO workouts (type, name, sets, reps, rest, muscle_group) VALUES (?, ?, ?, ?, ?, ?)").run(type, name, sets, reps, rest, muscle_group);
    res.json({ id: result.lastInsertRowid });
  });

  app.patch("/api/workouts/:id", (req, res) => {
    const { id } = req.params;
    const fields = Object.keys(req.body).map(key => `${key} = ?`).join(", ");
    const values = Object.values(req.body);
    db.prepare(`UPDATE workouts SET ${fields} WHERE id = ?`).run(...values, id);
    res.json({ success: true });
  });

  app.delete("/api/workouts/:id", (req, res) => {
    db.prepare("DELETE FROM workouts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/history", (req, res) => {
    const history = db.prepare("SELECT * FROM history ORDER BY date DESC LIMIT 50").all();
    res.json(history);
  });

  app.get("/api/achievements", (req, res) => {
    const achievements = db.prepare("SELECT * FROM achievements").all();
    res.json(achievements);
  });

  app.get("/api/schedule", (req, res) => {
    const schedule = db.prepare("SELECT * FROM schedule").all();
    res.json(schedule);
  });

  app.post("/api/schedule", (req, res) => {
    const { day, time, activity } = req.body;
    const result = db.prepare("INSERT INTO schedule (day, time, activity) VALUES (?, ?, ?)").run(day, time, activity);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/schedule/:id", (req, res) => {
    db.prepare("DELETE FROM schedule WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/diets", (req, res) => {
    const diets = db.prepare("SELECT * FROM diets").all();
    res.json(diets);
  });

  app.post("/api/diets", (req, res) => {
    const { title, kcal, macros, color, content } = req.body;
    const result = db.prepare("INSERT INTO diets (title, kcal, macros, color, content) VALUES (?, ?, ?, ?, ?)").run(title, kcal, macros, color, content);
    res.json({ id: result.lastInsertRowid });
  });

  app.patch("/api/diets/:id", (req, res) => {
    const { id } = req.params;
    const fields = Object.keys(req.body).map(key => `${key} = ?`).join(", ");
    const values = Object.values(req.body);
    db.prepare(`UPDATE diets SET ${fields} WHERE id = ?`).run(...values, id);
    res.json({ success: true });
  });

  app.delete("/api/diets/:id", (req, res) => {
    db.prepare("DELETE FROM diets WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
