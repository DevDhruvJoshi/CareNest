import OpenAI from 'openai';
import { z } from 'zod';

const llmEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required for LLM'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
});

function isMockEnabled(): boolean {
  const flag = String(process.env.LLM_MOCK || process.env.AI_MOCK || '').toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes';
}

const parsed = llmEnvSchema.safeParse(process.env);

export type PlanRequestInput = {
  rpiHostname?: string;
  vpsHost?: string;
  vpsUser?: string;
  remotePort?: number;
  localPort?: number;
  sshPort?: number;
};

export async function generatePlanFromPrompt(masterPrompt: string, input: PlanRequestInput) {
  // If mock mode is enabled, return a deterministic plan without calling external APIs
  if (isMockEnabled()) {
    const filled = masterPrompt
      .replace('RPI_HOSTNAME: <raspberrypi.local या IP>', `RPI_HOSTNAME: ${input.rpiHostname || 'raspberrypi.local'}`)
      .replace('VPS_HOST: <your.vps.example.com>', `VPS_HOST: ${input.vpsHost || 'your.vps.example.com'}`)
      .replace('VPS_USER: <ubuntu>', `VPS_USER: ${input.vpsUser || 'ubuntu'}`)
      .replace('REMOTE_PORT: 5000 (या आपका चुना हुआ)', `REMOTE_PORT: ${String(input.remotePort || 5000)}`)
      .replace('LOCAL_PORT: 5000', `LOCAL_PORT: ${String(input.localPort || 5000)}`)
      .replace('SSH_PORT: 22', `SSH_PORT: ${String(input.sshPort || 22)}`);
    const steps = [
      '1) Repo sanity and config merge',
      '2) Python venv setup and requirements install',
      '3) SSH keys create and print public key',
      '4) UFW + Fail2Ban hardening',
      '5) systemd services: mummycare + autossh-mummycare',
      '6) Verify tunnel via VPS localhost check',
    ].join('\n');
    const content = `MOCK PLAN (no LLM)\n\n${filled}\n\nActions:\n${steps}`;
    return { content };
  }

  if (!parsed.success) {
    throw new Error('LLM environment not configured: ' + JSON.stringify(parsed.error.flatten().fieldErrors));
  }
  const { OPENAI_API_KEY, OPENAI_MODEL } = parsed.data;
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });

  const filledPrompt = masterPrompt
    .replace('RPI_HOSTNAME: <raspberrypi.local या IP>', `RPI_HOSTNAME: ${input.rpiHostname || 'raspberrypi.local'}`)
    .replace('VPS_HOST: <your.vps.example.com>', `VPS_HOST: ${input.vpsHost || 'your.vps.example.com'}`)
    .replace('VPS_USER: <ubuntu>', `VPS_USER: ${input.vpsUser || 'ubuntu'}`)
    .replace('REMOTE_PORT: 5000 (या आपका चुना हुआ)', `REMOTE_PORT: ${String(input.remotePort || 5000)}`)
    .replace('LOCAL_PORT: 5000', `LOCAL_PORT: ${String(input.localPort || 5000)}`)
    .replace('SSH_PORT: 22', `SSH_PORT: ${String(input.sshPort || 22)}`);

  const systemMessage = 'You are an expert DevOps + Python engineer. Output concise, actionable steps. Avoid interactive actions. Assume Debian-based OS.';

  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: filledPrompt },
    ],
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content || '';
  return { content };
}


