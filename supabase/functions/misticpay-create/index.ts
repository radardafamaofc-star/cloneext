import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface CreateBody {
  amount: number;
  panel: string;
}

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
      headers: {
        ci,
        cs,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        payerName: "Cliente Renovação",
        payerDocument: "00000000000",
        transactionId,
        description: `Renovação: ${panel}`,
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

    return new Response(JSON.stringify({ data: data.data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("misticpay-create exception", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
