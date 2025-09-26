import { Router } from 'express';
import { z } from 'zod';
import { loadIdeMasterPrompt } from '../services/prompts';
import { generatePlanFromPrompt } from '../services/llm';
import { requireAuth } from './auth';

export const aiRouter = Router();

const planSchema = z.object({
  rpiHostname: z.string().optional(),
  vpsHost: z.string().optional(),
  vpsUser: z.string().optional(),
  remotePort: z.number().int().positive().optional(),
  localPort: z.number().int().positive().optional(),
  sshPort: z.number().int().positive().optional(),
});

aiRouter.post('/plan', requireAuth(['admin']), async (req, res) => {
  const parsed = planSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }
  const { masterBlock } = loadIdeMasterPrompt();
  if (!masterBlock) {
    return res.status(500).json({ error: 'Master prompt not found' });
  }
  try {
    const result = await generatePlanFromPrompt(masterBlock, parsed.data);
    return res.json({ plan: result.content });
  } catch (err: any) {
    return res.status(500).json({ error: 'LLM error', message: err?.message || String(err) });
  }
});

// Return the current master prompt block for inspection/debugging
aiRouter.get('/prompt', requireAuth(['admin']), async (_req, res) => {
  const { masterBlock } = loadIdeMasterPrompt();
  if (!masterBlock) {
    return res.status(404).json({ error: 'Master prompt not found' });
  }
  return res.json({ masterBlock });
});


// Alias endpoint for clarity: returns the same master prompt block
aiRouter.get('/master-prompt', requireAuth(['admin']), async (_req, res) => {
  const { masterBlock } = loadIdeMasterPrompt();
  if (!masterBlock) {
    return res.status(404).json({ error: 'Master prompt not found' });
  }
  return res.json({ masterBlock });
});


