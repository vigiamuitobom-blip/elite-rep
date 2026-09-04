import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dumbbell, Flame, HeartPulse, Loader2, Printer, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ADIPOSIDADE,
  EQUIPAMENTOS,
  NIVEIS,
  OBJETIVOS,
  SEXOS,
  TEMPOS,
  type Perfil,
} from "@/lib/fitplanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitPlanner Pro — Treino personalizado de segunda a sexta" },
      {
        name: "description",
        content:
          "Monte em segundos uma rotina de treino de segunda a sexta com musculação, cardio, métodos avançados e gasto calórico estimado.",
      },
      { property: "og:title", content: "FitPlanner Pro — Seu treino da semana em segundos" },
      {
        property: "og:description",
        content:
          "Plano semanal com aquecimento, tabelas de séries e repetições, cardio, calorias e alongamento.",
      },
    ],
  }),
  component: Index,
});

const estadoInicial = {
  nome: "",
  idade: "30",
  sexo: "Masculino",
  altura: "175",
  peso: "80",
  gordura: "Não sei",
  restricoes: "",
  objetivo: "Hipertrofia",
  nivel: "Intermediário (6 a 24 meses)",
  tempo: "60 minutos",
  equipamentos: "Academia completa",
};

function Index() {
  const [form, setForm] = useState(estadoInicial);
  const [plano, setPlano] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const resultadoRef = useRef<HTMLDivElement>(null);

  const set = (campo: keyof typeof estadoInicial) => (valor: string) =>
    setForm((atual) => ({ ...atual, [campo]: valor }));

  async function gerar(evento: React.FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    setErro("");
    setPlano("");

    try {
      const perfil: Perfil = {
        ...form,
        idade: Number(form.idade),
        altura: Number(form.altura),
        peso: Number(form.peso),
      };

      const resposta = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perfil),
      });

      if (!resposta.ok || !resposta.body) {
        setErro((await resposta.text()) || "Não foi possível gerar o plano agora.");
        return;
      }

      resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      const reader = resposta.body.getReader();
      const decoder = new TextDecoder();
      let acumulado = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        setPlano(acumulado);
      }
      if (!acumulado.trim()) setErro("A resposta veio vazia. Tente gerar novamente.");
    } catch {
      setErro("Falha de conexão ao gerar o plano. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" /> Personal trainer inteligente
        </span>
        <h1 className="mt-5 text-5xl leading-none sm:text-7xl">
          <span className="text-gradient-hero">FitPlanner Pro</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          Informe seus dados e receba uma rotina completa de segunda a sexta: aquecimento,
          musculação com séries e métodos avançados, cardio, calorias estimadas e alongamento.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
            <Dumbbell className="size-3.5 text-primary" /> Musculação e calistenia
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
            <HeartPulse className="size-3.5 text-primary" /> Cardio LISS e HIIT
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
            <Flame className="size-3.5 text-accent" /> Gasto calórico por METs
          </span>
        </div>
      </header>

      <form
        onSubmit={gerar}
        className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-elev sm:p-7"
      >
        <h2 className="text-2xl">Sua avaliação</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Campo label="Nome (opcional)">
            <Input
              value={form.nome}
              onChange={(e) => set("nome")(e.target.value)}
              placeholder="Seu nome"
            />
          </Campo>
          <Campo label="Sexo biológico">
            <Escolha valor={form.sexo} onChange={set("sexo")} opcoes={SEXOS} />
          </Campo>
          <Campo label="Idade (anos)">
            <Input
              type="number"
              min={12}
              max={90}
              required
              value={form.idade}
              onChange={(e) => set("idade")(e.target.value)}
            />
          </Campo>
          <Campo label="Altura (cm)">
            <Input
              type="number"
              min={120}
              max={230}
              required
              value={form.altura}
              onChange={(e) => set("altura")(e.target.value)}
            />
          </Campo>
          <Campo label="Peso atual (kg)">
            <Input
              type="number"
              min={30}
              max={250}
              step="0.1"
              required
              value={form.peso}
              onChange={(e) => set("peso")(e.target.value)}
            />
          </Campo>
          <Campo label="Gordura corporal / adiposidade">
            <Escolha valor={form.gordura} onChange={set("gordura")} opcoes={ADIPOSIDADE} />
          </Campo>
          <Campo label="Objetivo principal">
            <Escolha valor={form.objetivo} onChange={set("objetivo")} opcoes={OBJETIVOS} />
          </Campo>
          <Campo label="Nível de experiência">
            <Escolha valor={form.nivel} onChange={set("nivel")} opcoes={NIVEIS} />
          </Campo>
          <Campo label="Tempo por sessão">
            <Escolha valor={form.tempo} onChange={set("tempo")} opcoes={TEMPOS} />
          </Campo>
          <Campo label="Equipamentos disponíveis">
            <Escolha
              valor={form.equipamentos}
              onChange={set("equipamentos")}
              opcoes={EQUIPAMENTOS}
            />
          </Campo>
          <div className="sm:col-span-2">
            <Campo label="Lesões, limitações ou condições médicas">
              <Textarea
                rows={3}
                value={form.restricoes}
                onChange={(e) => set("restricoes")(e.target.value)}
                placeholder="Ex: dor no ombro direito, hérnia lombar, joelho operado..."
              />
            </Campo>
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-6 w-full text-base" disabled={carregando}>
          {carregando ? (
            <>
              <Loader2 className="animate-spin" /> Montando seu plano...
            </>
          ) : (
            <>
              <Sparkles /> Gerar plano de segunda a sexta
            </>
          )}
        </Button>
        {erro ? (
          <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {erro}
          </p>
        ) : null}
      </form>

      <div ref={resultadoRef} className="scroll-mt-6">
        {plano ? (
          <section className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-elev sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl">Seu plano semanal</h2>
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                <Printer /> Imprimir / PDF
              </Button>
            </div>
            <div className="plano-md mt-4 text-sm">
              <Markdown remarkPlugins={[remarkGfm]}>{plano}</Markdown>
            </div>
            {carregando ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Escrevendo os próximos dias...
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Escolha({
  valor,
  onChange,
  opcoes,
}: {
  valor: string;
  onChange: (v: string) => void;
  opcoes: string[];
}) {
  return (
    <Select value={valor} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opcoes.map((opcao) => (
          <SelectItem key={opcao} value={opcao}>
            {opcao}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
