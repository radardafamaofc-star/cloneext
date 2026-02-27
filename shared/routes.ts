import { z } from 'zod';
import { insertSettingsSchema, botSettings, chatLogs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: {
        200: z.custom<typeof botSettings.$inferSelect>(),
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/settings' as const,
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof botSettings.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  whatsapp: {
    status: {
      method: 'GET' as const,
      path: '/api/whatsapp/status' as const,
      responses: {
        200: z.object({
          status: z.enum(['connected', 'disconnected', 'qr']),
          qrCode: z.string().optional()
        }),
      }
    },
    restart: {
      method: 'POST' as const,
      path: '/api/whatsapp/restart' as const,
      responses: {
        200: z.object({ message: z.string() })
      }
    }
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs' as const,
      responses: {
        200: z.array(z.custom<typeof chatLogs.$inferSelect>())
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
