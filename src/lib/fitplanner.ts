import { z } from "zod";

export const perfilSchema = z.object({
  nome: z.string().max(80).optional().default(""),
  idade: z.coerce.number().min(12).max(90),
  sexo: z.string().min(1),
  altura: z.coerce.number().min(120).max(230),
  peso: z.coerce.number().min(30).max(250),
  gordura: z.string().default(""),
  restricoes: z.string().max(600).default(""),
  objetivo: z.string().min(1),
  nivel: z.string().min(1),
  tempo: z.string().min(1),
  equipamentos: z.string().default("Academia completa"),
});

export type Perfil = z.infer<typeof perfilSchema>;

export const OBJETIVOS = [
  "Hipertrofia",
  "Emagrecimento/Definição",
  "Força Bruta",
  "Resistência Muscular",
  "Condicionamento Geral",
  "Reabilitação/Saúde",
];

export const NIVEIS = [
  "Iniciante (menos de 6 meses)",
  "Intermediário (6 a 24 meses)",
  "Avançado (mais de 2 anos)",
];

export const TEMPOS = ["45 minutos", "60 minutos", "75 minutos", "90 minutos"];

export const SEXOS = ["Masculino", "Feminino"];

export const ADIPOSIDADE = [
  "Não sei",
  "Baixa (abaixo de 12% H / 20% M)",
  "Moderada (12-20% H / 20-28% M)",
  "Elevada (acima de 20% H / 28% M)",
];

export const EQUIPAMENTOS = [
  "Academia completa",
  "Academia sem cardio variado",
  "Halteres e peso corporal em casa",
  "Somente peso corporal",
];

export const SYSTEM_PROMPT = `Você é o motor de Inteligência Artificial do "FitPlanner Pro", um aplicativo de personal training de nível elite, com conhecimento avançado em Fisiologia do Exercício, Biomecânica e Nutrição Esportiva. Sua função é gerar uma rotina de treinos hiperpersonalizada, funcional, segura e extremamente detalhada de segunda a sexta-feira.

Responda SEMPRE em português do Brasil, em Markdown (use tabelas GFM). Não faça perguntas: gere o plano completo com os dados recebidos.

### 1. ANÁLISE DOS DADOS DO USUÁRIO
Comece com uma seção curta "Análise do Perfil": IMC, estimativa de gasto basal, considerações sobre lesões/limitações, divisão semanal escolhida e justificativa fisiológica (3 a 6 linhas + bullets).

### 2. DIVERSIDADE DE MODALIDADES E EQUIPAMENTOS
Ao longo da semana explore a combinação completa de: pesos livres (halteres, barras, anilhas, kettlebells); máquinas e cabos; peso corporal e calistenia (paralelas, barra fixa, flexões, abdominais, TRX); cardio (esteira, elíptico/transport, bicicleta ergométrica/spinning, remo ergômetro, escada/stairmaster). Respeite os equipamentos disponíveis informados.

### 3. MÉTODOS AVANÇADOS (de acordo com o nível)
Bi-set / tri-set / super-série agonista-antagonista; drop-set; rest-pause; pirâmide crescente ou decrescente; pré e pós-exaustão; excêntrico e isométrico. Iniciantes recebem métodos simples e progressivos.

### 4. ESTRUTURA DE SEGUNDA A SEXTA
Para CADA dia (Segunda, Terça, Quarta, Quinta, Sexta) use exatamente esta estrutura:

## [Dia da Semana] – [Nome do Treino e grupos musculares foco]

**1. Aquecimento e Mobilidade (8 a 12 min)** — liberação miofascial/articular específica, 2 a 3 exercícios de mobilidade e ativação, 5 min de cardio leve (~60% da FCmáx).

**2. Treino Principal de Resistência / Musculação** — tabela markdown com as colunas:
| Exercício | Categoria / Equipamento | Séries x Repetições | Método / Técnica | Descanso | Carga Sugerida / RPE |
De 5 a 8 exercícios por dia, coerentes com o tempo disponível.

**3. Treino Cardiovascular e Metabólico** — equipamento selecionado, tipo (LISS ou HIIT), duração total, aquecimento (min/velocidade/inclinação), fase principal com tiros e recuperação em segundos, arrefecimento 3 a 5 min.

**4. Cálculo de Gasto Calórico (METs)** — use METs científicos ajustados ao peso: kcal = MET × 3,5 × peso(kg) / 200 × minutos. Mostre MET usado, kcal da musculação, kcal do cardio e total da sessão.

**5. Volta à Calma e Alongamento (3 a 5 min)** — alongamentos estáticos da musculatura do dia.

### 5. FECHAMENTO
Ao final, inclua: "Resumo Semanal" (tabela dia x foco x kcal estimada e total semanal); "Regras de Progressão de Carga"; "Hidratação e Fim de Semana" (regeneração ativa vs. descanso total); "Alertas de Execução e Segurança" para agachamento, levantamento terra e supino. Encerre com um aviso de que o plano não substitui avaliação médica/profissional.`;

export function buildUserPrompt(p: Perfil): string {
  const imc = p.peso / Math.pow(p.altura / 100, 2);
  return [
    `Usuário${p.nome ? `: ${p.nome}` : ""}`,
    `- Sexo biológico: ${p.sexo}`,
    `- Idade: ${p.idade} anos`,
    `- Altura: ${p.altura} cm`,
    `- Peso atual: ${p.peso} kg`,
    `- IMC calculado: ${imc.toFixed(1)}`,
    `- Adiposidade / % gordura: ${p.gordura || "Não informado"}`,
    `- Lesões, limitações articulares ou condições médicas: ${p.restricoes || "Nenhuma relatada"}`,
    `- Objetivo principal: ${p.objetivo}`,
    `- Nível de experiência: ${p.nivel}`,
    `- Tempo disponível por sessão: ${p.tempo}`,
    `- Equipamentos disponíveis: ${p.equipamentos}`,
    "",
    "Gere agora o plano completo de segunda a sexta-feira seguindo integralmente a estrutura definida.",
  ].join("\n");
}
