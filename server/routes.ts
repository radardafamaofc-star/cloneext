import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { connectToWhatsApp, connectionStatus, currentQr } from "./whatsapp";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Start WhatsApp client in the background
  connectToWhatsApp().catch(console.error);

  app.get('/api/settings', async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch('/api/settings', async (req, res) => {
    try {
      const updated = await storage.updateSettings(req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/whatsapp/status', async (req, res) => {
    res.json({
      status: connectionStatus,
      qrCode: currentQr
    });
  });

  app.post('/api/whatsapp/restart', async (req, res) => {
    connectToWhatsApp().catch(console.error);
    res.json({ message: "Restarting WhatsApp connection..." });
  });

  app.get('/api/logs', async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  return httpServer;
}
