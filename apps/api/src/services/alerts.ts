import { prisma } from '@carenest/db';

type AlertChannel = 'sms' | 'email' | 'call' | 'log';

export interface AlertPayload {
  subject?: string;
  message: string;
  to?: string;
  channel?: AlertChannel;
}

const rateWindowMs = 60_000; // 1 minute
const maxPerWindow = 5;
const sentLog: Map<string, number[]> = new Map();

function checkRateLimit(key: string) {
  const now = Date.now();
  const arr = (sentLog.get(key) || []).filter((ts) => now - ts < rateWindowMs);
  if (arr.length >= maxPerWindow) return false;
  arr.push(now);
  sentLog.set(key, arr);
  return true;
}

export async function sendAlert(payload: AlertPayload): Promise<{ ok: boolean }>{
  const channel: AlertChannel = payload.channel || 'log';
  const rateKey = `${channel}:${payload.to || 'broadcast'}`;
  if (!checkRateLimit(rateKey)) {
    await prisma.alert.create({ data: {
      level: 'info',
      subject: payload.subject || null,
      message: `[rate-limited] ${payload.message}`,
      channel,
      to: payload.to || null,
      status: 'failed',
      meta: { reason: 'rate_limited' } as any,
    }}).catch(() => {});
    return { ok: true };
  }
  let delivered = true;
  switch (channel) {
    case 'sms':
      delivered = await sendSms(payload);
      break;
    case 'email':
      delivered = await sendEmail(payload);
      break;
    case 'call':
      delivered = await placeCall(payload);
      break;
    default:
      console.log('[ALERT][LOG]', payload.subject, payload.message);
      delivered = true;
      break;
  }
  if (!delivered) {
    const escalated = await escalate(payload);
    await prisma.alert.create({ data: {
      level: 'warn',
      subject: payload.subject || null,
      message: payload.message,
      channel,
      to: payload.to || null,
      status: escalated ? 'escalated' : 'failed',
      meta: { escalated } as any,
    }}).catch(() => {});
    return { ok: true };
  }
  await prisma.alert.create({ data: {
    level: 'info',
    subject: payload.subject || null,
    message: payload.message,
    channel,
    to: payload.to || null,
    status: 'sent',
    // do not set meta when not needed to avoid null JSON typing issues
  }}).catch(() => {});
  return { ok: true };
}

async function sendSms({ to, message }: AlertPayload): Promise<boolean> {
  const provider = process.env.ALERT_SMS_PROVIDER;
  if (provider === 'twilio') {
    const sid = process.env.ALERT_SMS_TWILIO_ACCOUNT_SID;
    const token = process.env.ALERT_SMS_TWILIO_AUTH_TOKEN;
    const from = process.env.ALERT_SMS_FROM;
    if (!sid || !token || !from) {
      console.warn('[ALERT][SMS] Twilio env missing');
      return false;
    }
    if (!to) {
      console.warn('[ALERT][SMS] missing recipient');
      return false;
    }
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const body = new URLSearchParams({ From: from, To: to, Body: message || '' }).toString();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    }).catch((e) => { console.warn('[ALERT][SMS][Twilio] error', e); return null; });
    return !!res && res.ok;
  } else {
    console.log('[ALERT][SMS][noop]', to, message);
    return true;
  }
}

async function sendEmail({ to, subject, message }: AlertPayload): Promise<boolean> {
  const host = process.env.ALERT_EMAIL_SMTP_HOST;
  const port = Number(process.env.ALERT_EMAIL_SMTP_PORT || 587);
  const user = process.env.ALERT_EMAIL_SMTP_USER;
  const pass = process.env.ALERT_EMAIL_SMTP_PASS;
  if (!host || !user || !pass || !to) {
    console.log('[ALERT][EMAIL][noop]', to, subject);
    return false;
  }
  // Lightweight SMTP via nodemailer (defer import to avoid hard dep when unused)
  // @ts-ignore
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  const ok = await transporter.sendMail({ from: user, to, subject: subject || 'CareNest Alert', text: message || '' })
    .then(() => true)
    .catch((e: unknown) => { console.warn('[ALERT][EMAIL] error', e); return false; });
  return ok;
}

async function escalate(payload: AlertPayload): Promise<boolean> {
  const list = (process.env.ALERT_ESCALATION_RECIPIENTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) return false;
  for (const recipient of list) {
    let ok = false;
    if (payload.channel === 'sms') {
      ok = await sendSms({ ...payload, to: recipient });
    } else if (payload.channel === 'email') {
      ok = await sendEmail({ ...payload, to: recipient });
    } else if (payload.channel === 'call') {
      ok = await placeCall({ ...payload, to: recipient });
    }
    if (ok) return true;
  }
  return false;
}

async function placeCall({ to, message }: AlertPayload): Promise<boolean> {
  const provider = process.env.ALERT_CALL_PROVIDER;
  if (provider === 'twilio') {
    const sid = process.env.ALERT_CALL_TWILIO_ACCOUNT_SID || process.env.ALERT_SMS_TWILIO_ACCOUNT_SID;
    const token = process.env.ALERT_CALL_TWILIO_AUTH_TOKEN || process.env.ALERT_SMS_TWILIO_AUTH_TOKEN;
    const from = process.env.ALERT_CALL_FROM || process.env.ALERT_SMS_FROM;
    const twimlUrl = process.env.ALERT_CALL_TWIML_URL; // optional: hosted TwiML
    if (!sid || !token || !from) {
      console.warn('[ALERT][CALL] Twilio env missing');
      return false;
    }
    if (!to) {
      console.warn('[ALERT][CALL] missing recipient');
      return false;
    }
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`;
    let body: string;
    if (twimlUrl) {
      body = new URLSearchParams({ From: from, To: to, Url: twimlUrl }).toString();
    } else {
      const twiml = `<Response><Say voice="Polly.Aditi">${(message || 'Emergency alert from CareNest').slice(0, 1000)}</Say></Response>`;
      body = new URLSearchParams({ From: from, To: to, Twiml: twiml }).toString();
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    }).catch((e) => { console.warn('[ALERT][CALL][Twilio] error', e); return null; });
    return !!res && res.ok;
  } else {
    console.log('[ALERT][CALL][noop]', to, message);
    return true;
  }
}



