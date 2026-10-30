import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OtpEntry {
  code: string;
  email: string;
  purpose: 'login' | 'signup';
  expiresAt: number;
  attempts: number;
}

interface StoredRegistration {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  gmailVerified: boolean;
  verifiedAt: string;
  phone: string;
  telegram?: string;
  interestedPlanId: string;
  interestedPlanName: string;
  interestedPlanPrice: number;
  customerNote?: string;
  submittedAt: string;
  workflowStage: 'NEW_FOR_ADMIN' | 'ASSIGNED_TO_STAFF' | 'VERIFIED_COMPLETED' | 'REJECTED';
  assignedByAdminCode?: string;
  assignedByAdminName?: string;
  assignedToStaffId?: string;
  assignedToStaffCode?: string;
  assignedToStaffName?: string;
  assignedToPosition?: string;
  assignedAt?: string;
  adminInstruction?: string;
  staffCheckNote?: string;
  checkedByStaffCode?: string;
  checkedByStaffName?: string;
  checkedAt?: string;
}

const otpStore = new Map<string, OtpEntry>();
const registrationStore: StoredRegistration[] = [];

function generateSixDigitOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local.slice(0, 2)}${'*'.repeat(Math.min(5, local.length - 2))}@${domain}`;
}

function hasRealGmailCredentials(): boolean {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').trim();
  return (
    Boolean(user) &&
    Boolean(pass) &&
    user !== 'MY_GMAIL_USER' &&
    pass !== 'MY_GMAIL_APP_PASSWORD'
  );
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  // 1. Send 6-Digit Verification OTP to Customer's Gmail
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const rawEmail = String(req.body?.email || '').trim().toLowerCase();
      const recipientName = String(req.body?.name || 'User').trim();
      const purpose: 'login' | 'signup' = req.body?.purpose === 'signup' ? 'signup' : 'login';
      const portal: 'customer' | 'management' =
        req.body?.portal === 'management' ? 'management' : 'customer';
      const portalLabelKm =
        portal === 'management' ? 'ផ្ទាំងអ្នកគ្រប់គ្រង (Management)' : 'ផ្ទាំងអតិថិជន (Customer)';

      if (!rawEmail || !rawEmail.includes('@')) {
        res.status(400).json({
          ok: false,
          error: 'Invalid email address',
          errorKm: 'សូមបញ្ចូលអាសយដ្ឋាន Gmail ឱ្យបានត្រឹមត្រូវ។'
        });
        return;
      }

      const code = generateSixDigitOtp();
      const ttlMs = 5 * 60 * 1000;
      otpStore.set(rawEmail, {
        code,
        email: rawEmail,
        purpose,
        expiresAt: Date.now() + ttlMs,
        attempts: 0
      });

      if (hasRealGmailCredentials()) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER!.trim(),
              pass: process.env.GMAIL_APP_PASSWORD!.trim()
            }
          });

          await transporter.sendMail({
            from: `"AlphaSignal VIP Security" <${process.env.GMAIL_USER!.trim()}>`,
            to: rawEmail,
            subject: `[AlphaSignal VIP · ${portal === 'management' ? 'Management' : 'Customer'}] លេខកូដ Gmail របស់អ្នកគឺ ${code}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
                <h2 style="margin: 0 0 6px; color: #fbbf24;">AlphaSignal.VIP · ${portalLabelKm}</h2>
                <p style="margin: 0 0 16px; font-size: 14px; color: #cbd5e1;">
                  សួស្តី ${recipientName}, នេះជាលេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់សម្រាប់ការ${purpose === 'signup' ? 'ចុះឈ្មោះគណនីថ្មី (Sign Up)' : 'ចូលគណនី (Login)'}៖
                </p>
                <div style="padding: 18px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; text-align: center; font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fbbf24;">
                  ${code}
                </div>
                <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8;">
                  លេខកូដនេះមានសុពលភាពរយៈពេល ៥ នាទី។ សូមកុំចែករំលែកលេខកូដនេះទៅកាន់អ្នកដទៃ។
                </p>
              </div>
            `
          });

          res.json({
            ok: true,
            deliveryMode: 'gmail_smtp',
            email: rawEmail,
            maskedEmail: maskEmail(rawEmail),
            expiresInSeconds: 300
          });
          return;
        } catch (smtpErr) {
          console.warn('SMTP send fallback triggered:', smtpErr);
        }
      }

      // Preview / Sandbox Inbox Delivery (real server-side OTP verification with live inbox notification preview)
      res.json({
        ok: true,
        deliveryMode: 'inbox_preview',
        email: rawEmail,
        maskedEmail: maskEmail(rawEmail),
        otpPreview: code,
        expiresInSeconds: 300
      });
    } catch (err) {
      console.error('Error in /api/auth/send-otp:', err);
      res.status(500).json({
        ok: false,
        error: 'Failed to generate verification code',
        errorKm: 'មានបញ្ហាក្នុងការបង្កើតលេខកូដផ្ទៀងផ្ទាត់។'
      });
    }
  });

  // 2. Verify 6-Digit Gmail OTP
  app.post('/api/auth/verify-otp', (req, res) => {
    const rawEmail = String(req.body?.email || '').trim().toLowerCase();
    const submittedCode = String(req.body?.code || '').trim();

    const record = otpStore.get(rawEmail);
    if (!record) {
      res.status(400).json({
        ok: false,
        error: 'No active verification code found. Please request a new code.',
        errorKm: 'រកមិនឃើញលេខកូដផ្ទៀងផ្ទាត់ទេ។ សូមចុចផ្ញើលេខកូដម្តងទៀត។'
      });
      return;
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(rawEmail);
      res.status(400).json({
        ok: false,
        error: 'Verification code has expired. Please request a new code.',
        errorKm: 'លេខកូដផ្ទៀងផ្ទាត់បានផុតកំណត់ហើយ។ សូមស្នើសុំលេខកូដថ្មី។'
      });
      return;
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      otpStore.delete(rawEmail);
      res.status(429).json({
        ok: false,
        error: 'Too many invalid attempts. Please request a new code.',
        errorKm: 'អ្នកបានបញ្ចូលខុសលើសកំណត់។ សូមស្នើសុំលេខកូដថ្មីម្តងទៀត។'
      });
      return;
    }

    if (record.code !== submittedCode) {
      res.status(400).json({
        ok: false,
        error: 'Incorrect 6-digit Gmail verification code.',
        errorKm: 'លេខកូដ ៦ ខ្ទង់មិនត្រឹមត្រូវទេ! សូមពិនិត្យក្នុងប្រអប់សារ Gmail ម្តងទៀត។'
      });
      return;
    }

    otpStore.delete(rawEmail);
    res.json({
      ok: true,
      email: rawEmail,
      verifiedAt: new Date().toISOString()
    });
  });

  // 3. Customer Sign-Up Registration Pipeline -> Sent to Administrator & Assigned to Staff
  app.get('/api/registrations', (_req, res) => {
    res.json({ ok: true, registrations: registrationStore });
  });

  app.post('/api/registrations', (req, res) => {
    const body = req.body as StoredRegistration;
    if (!body || !body.email || !body.fullName) {
      res.status(400).json({ ok: false, error: 'Missing required customer fields' });
      return;
    }
    const existingIdx = registrationStore.findIndex(r => r.id === body.id);
    if (existingIdx >= 0) {
      registrationStore[existingIdx] = body;
    } else {
      registrationStore.unshift(body);
    }
    res.json({ ok: true, registration: body });
  });

  app.patch('/api/registrations/:id', (req, res) => {
    const { id } = req.params;
    const idx = registrationStore.findIndex(r => r.id === id);
    if (idx >= 0) {
      registrationStore[idx] = { ...registrationStore[idx], ...req.body };
      res.json({ ok: true, registration: registrationStore[idx] });
      return;
    }
    res.json({ ok: true });
  });

  // 4. Vite Middleware in Development / Static Build in Production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AlphaSignal VIP server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
