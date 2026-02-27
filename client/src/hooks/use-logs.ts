import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLogs() {
  return useQuery({
    queryKey: ["chat_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);

      return (data || []).map((row: any) => ({
        id: row.id,
        phoneNumber: row.phone_number,
        message: row.message,
        response: row.response,
        createdAt: row.created_at,
      }));
    },
    refetchInterval: 10000,
  });
}
