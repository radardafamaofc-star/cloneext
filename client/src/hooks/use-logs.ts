import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: async () => {
      const res = await fetch(api.logs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chat logs");
      
      const data = await res.json();
      const parsed = api.logs.list.responses[200].safeParse(data);
      
      if (!parsed.success) {
        console.error("[Zod] logs.list validation failed:", parsed.error.format());
        throw parsed.error;
      }
      
      return parsed.data;
    },
    // Keep logs relatively fresh
    refetchInterval: 10000,
  });
}
