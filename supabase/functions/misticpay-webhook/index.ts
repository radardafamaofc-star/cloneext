import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

// Webhook público chamado pela MisticPay quando o status de uma transação muda.
// Configurado em supabase/config.toml com verify_jwt = false.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const payload = await req.json();
    console.log("[misticpay-webhook] payload", JSON.stringify(payload));

    // MED (infração) — apenas loga por enquanto
    if (payload?.event === "INFRACTION") {
      console.log("[misticpay-webhook] infraction event ignored", payload?.infraction?.id);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Webhook de Depósito/Saque
    const transactionId = String(payload?.transactionId ?? "");
    const status = String(payload?.status ?? "");
    const e2e = payload?.e2e ?? null;

    if (!transactionId || !status) {
      console.warn("[misticpay-webhook] missing fields", payload);
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // A coluna `transaction_id` armazena o ID gerado pelo nosso sistema
    // (passado como `transactionId` ao criar a cobrança). A MisticPay devolve
    // esse mesmo ID no webhook.
    const { error } = await supabase
      .from("pix_transactions")
      .update({
        status,
        end_to_end_id: e2e,
        paid_at: status === "COMPLETO" ? new Date().toISOString() : null,
      })
      .eq("transaction_id", transactionId);

    if (error) {
      console.error("[misticpay-webhook] update error", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[misticpay-webhook] exception", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
