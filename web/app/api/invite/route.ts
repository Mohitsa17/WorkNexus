import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, workspaceName, inviterName, token } = body;

    if (!process.env.RESEND_API_KEY) {
      console.warn('[Invite] RESEND_API_KEY not set – skipping email send, invite is saved in DB.');
      return NextResponse.json({ success: true, message: 'Invite saved (no email key)' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const inviteUrl = `${APP_URL}/invite/${token}`;
    const roleLabel = role === 'ADMIN' ? 'Admin' : role === 'EDITOR' ? 'Editor' : 'Viewer';
    const roleDescription =
      role === 'ADMIN'
        ? 'Full access including member management'
        : role === 'EDITOR'
        ? 'Can create and edit tasks, add comments'
        : 'Can view all tasks and projects';

    const { data, error } = await resend.emails.send({
      from: 'WorkNexus <onboarding@resend.dev>',
      to: email,
      subject: `${inviterName} invited you to join ${workspaceName} on WorkNexus`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050810;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050810;min-height:100vh;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#0c1525;border:1px solid #1e293b;border-radius:20px;overflow:hidden;max-width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:14px 20px;font-size:28px;margin-bottom:16px;">🚀</div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">You're invited to WorkNexus</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:15px;">${inviterName} wants you on their team</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                Hi there! <strong style="color:#e2e8f0;">${inviterName}</strong> has invited you to join the workspace 
                <strong style="color:#a5b4fc;">${workspaceName}</strong> on WorkNexus.
              </p>
              <div style="background:#0f1929;border:1px solid #1e3a5f;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
                <div style="color:#ffffff;font-weight:700;font-size:14px;">Your Role: ${roleLabel}</div>
                <div style="color:#94a3b8;font-size:12px;margin-top:4px;">${roleDescription}</div>
              </div>
              <div style="text-align:center;margin:28px 0;">
                <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 40px;border-radius:12px;box-shadow:0 8px 25px rgba(99,102,241,0.4);">
                  Accept Invitation →
                </a>
              </div>
              <p style="margin:24px 0 0;color:#475569;font-size:13px;text-align:center;">
                This link expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <div style="border-top:1px solid #1e293b;margin:24px 0;"></div>
              <p style="margin:0;color:#334155;font-size:11px;text-align:center;word-break:break-all;">
                Or copy this link: ${inviteUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#080d18;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
              <p style="margin:0;color:#334155;font-size:12px;">© 2025 WorkNexus · Project management made simple</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (error) {
      // ⚠️ Resend free tier without a verified domain can only send to your own email.
      // The invite is still saved in the DB — share the link manually for now.
      console.error('[Resend Error]', JSON.stringify(error));
      // Don't throw — invite is already in DB, just return the invite link so user can share manually
      return NextResponse.json({
        success: true,
        emailSent: false,
        resendError: error.message,
        inviteUrl,
        note: 'Email delivery failed (Resend free tier restriction). Share the invite link manually.',
      });
    }

    console.log('[Email Sent] ID:', data?.id, '→', email);
    return NextResponse.json({ success: true, emailSent: true, emailId: data?.id });
  } catch (err: any) {
    console.error('[Invite API Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
