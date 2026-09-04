import { createFileRoute } from "@tanstack/react-router";

import { SYSTEM_PROMPT, buildUserPrompt, perfilSchema } from "@/lib/fitplanner";

export const Route = createFileRoute("/api/generate-plan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("Serviço de IA não configurado.", { status: 500 });
        }

        let perfil;
        try {
          perfil = perfilSchema.parse(await request.json());
        } catch {
          return new Response("Dados do perfil inválidos.", { status: 400 });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            stream: true,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: buildUserPrompt(perfil) },
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          let message = "Não foi possível gerar o plano agora.";
          if (upstream.status === 429) message = "Muitas solicitações. Tente novamente em instantes.";
          if (upstream.status === 402)
            message = "Os créditos de IA do app acabaram. Adicione créditos para continuar.";
          if (upstream.status === 403) message = "O acesso à IA está bloqueado nas configurações.";
          console.error("AI gateway error", upstream.status, detail);
          return new Response(message, { status: upstream.status });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const payload = trimmed.slice(5).trim();
                  if (payload === "[DONE]") continue;
                  try {
                    const json = JSON.parse(payload);
                    const delta = json?.choices?.[0]?.delta?.content;
                    if (typeof delta === "string" && delta.length > 0) {
                      controller.enqueue(encoder.encode(delta));
                    }
                  } catch {
                    /* ignore partial chunk */
                  }
                }
              }
            } catch (error) {
              console.error(error);
            } finally {
              controller.close();
              reader.releaseLock();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
