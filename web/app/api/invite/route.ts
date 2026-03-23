import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, workspaceName, inviterName, token } = body;
    
    // Dynamically get the base URL from the incoming request
    const origin = new URL(req.url).origin;
    const inviteUrl = `${origin}/invite/${token}`;

    // If no Resend key, skip email silently
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true, emailSent: false, inviteUrl });
    }

    // Dynamically import Resend to avoid build-time errors
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const roleLabel = role === 'ADMIN' ? 'Admin' : role === 'EDITOR' ? 'Editor' : 'Viewer';

    let emailSent = false;
    try {
      const { error } = await resend.emails.send({
        from: 'WorkNexus <onboarding@resend.dev>',
        to: email,
        subject: `${inviterName} invited you to join ${workspaceName} on WorkNexus`,
        html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050810;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#0c1525;border:1px solid #1e293b;border-radius:20px;overflow:hidden;max-width:100%;">
      <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
        <div style="font-size:32px;margin-bottom:12px;">🚀</div>
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">You're invited to WorkNexus</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">${inviterName} wants you on their team</p>
      </td></tr>
      <tr><td style="padding:32px 40px;">
        <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 20px;">
          <strong style="color:#e2e8f0;">${inviterName}</strong> invited you to join 
          <strong style="color:#a5b4fc;">${workspaceName}</strong> as a <strong style="color:#fff;">${roleLabel}</strong>.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;">
            Accept Invitation →
          </a>
        </div>
        <p style="color:#475569;font-size:12px;text-align:center;margin:16px 0 0;">
          Expires in 7 days. If you didn't expect this, ignore this email.
        </p>
      </td></tr>
      <tr><td style="background:#080d18;padding:16px 40px;text-align:center;border-top:1px solid #1e293b;">
        <p style="margin:0;color:#334155;font-size:11px;">© 2025 WorkNexus</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`,
      });

      emailSent = !error;
      if (error) console.warn('[Resend] Email not sent:', error.message);
    } catch (emailErr: any) {
      // Email failed — not a fatal error, the invite link still works
      console.warn('[Resend] Exception during send:', emailErr?.message);
    }

    return NextResponse.json({ success: true, emailSent, inviteUrl });
  } catch (err: any) {
    // Never return 500 — always return the invite URL so the frontend can show it
    console.error('[Invite API]', err);
    return NextResponse.json({ success: true, emailSent: false, inviteUrl: null });
  }
}
