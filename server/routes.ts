import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { connectToWhatsApp, connectionStatus, currentQr } from "./whatsapp";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Start WhatsApp client in the background
  connectToWhatsApp().catch(console.error);

  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const updated = await storage.updateSettings(input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.whatsapp.status.path, async (req, res) => {
    res.json({
      status: connectionStatus,
      qrCode: currentQr
    });
  });

  app.post(api.whatsapp.restart.path, async (req, res) => {
    connectToWhatsApp().catch(console.error);
    res.json({ message: "Restarting WhatsApp connection..." });
  });

  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  return httpServer;
}