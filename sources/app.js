import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomInt } from 'node:crypto';
import { submissionSchema } from './schema.js';
import { errorMessages, winMessage } from './messages.js';

export function createApp({
  logger = console,
  pickError = () => randomInt(errorMessages.length),
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '8kb' }));
  const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
  app.use(express.static(publicDir));

  app.post('/api/validate', (request, response) => {
    const parsed = submissionSchema.safeParse(request.body);
    if (parsed.success) {
      logger.info?.('[validator] Valid submission');
      return response.json({ success: true, message: winMessage });
    }
    logger.info?.(
      '[validator] Invalid submission',
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        code: issue.code,
        message: issue.message,
      })),
    );
    const choice = pickError();
    const index = Number.isInteger(choice)
      ? ((choice % errorMessages.length) + errorMessages.length) % errorMessages.length
      : 0;
    return response.status(422).json({ success: false, message: errorMessages[index] });
  });

  app.use('/api', (_request, response) =>
    response.status(404).json({ message: 'Nagy büdös lófaszt!' }),
  );
  app.use((error, _request, response, _next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      logger.warn?.('[validator] Invalid JSON body');
      return response.status(400).json({ success: false, message: errorMessages[0] });
    }
    logger.error?.('[validator] Unexpected error', error);
    return response
      .status(500)
      .json({ success: false, message: 'A kurva életbe már, hát nem igaz!' });
  });
  return app;
}
