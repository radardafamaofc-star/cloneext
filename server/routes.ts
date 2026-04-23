import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(
  _httpServer: Server,
  app: Express
): Promise<Server> {
  // Project reset: WhatsApp/legacy routes removed.
  // Future API routes (e.g. Mistic Pay PIX) will go here.
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  return _httpServer;
}
