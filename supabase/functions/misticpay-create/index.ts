import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface CreateBody {
  amount: number;
  panel: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0];
const WEBHOOK_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/misticpay-webhook`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ci = Deno.env.get("MISTICPAY_CLIENT_ID");
    const cs = Deno.env.get("MISTICPAY_CLIENT_SECRET");
    if (!ci || !cs) {
      return new Response(
        JSON.stringify({ error: "MisticPay credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as CreateBody;
    const amount = Number(body?.amount);
    const panel = String(body?.panel ?? "").trim().slice(0, 200);

    if (!amount || amount < 1 || !panel) {
      return new Response(
        JSON.stringify({ error: "Parâmetros inválidos. Informe valor mínimo R$ 1,00 e o painel." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const transactionId = `renew-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const resp = await fetch("https://api.misticpay.com/api/transactions/create", {
      method: "POST",
      headers: { ci, cs, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        payerName: "Cliente Renovação",
        payerDocument: "00000000000",
        transactionId,
        description: `Renovação: ${panel}`,
        projectWebhook: WEBHOOK_URL,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("MisticPay create error", resp.status, data);
      return new Response(
        JSON.stringify({ error: data?.message || "Falha ao gerar PIX", details: data }),
        { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Registrar a transação no banco (pendente). Realtime notificará o frontend
    // assim que o webhook atualizar para COMPLETO.
    const supabase = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error: dbError } = await supabase.from("pix_transactions").insert({
      transaction_id: transactionId,
      panel,
      amount,
      status: "PENDENTE",
    });
    if (dbError) console.error("[misticpay-create] db insert error", dbError);

    return new Response(
      JSON.stringify({ data: { ...data.data, transactionId } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("misticpay-create exception", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
