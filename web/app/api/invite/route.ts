import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, workspaceName, inviterName, token } = body;

    // In a real application, you would integrate Resend, Sendgrid, or AWS SES here
    // to send an actual email containing the invite link.
    // Example: sendEmail({ to: email, subject: `You're invited to ${workspaceName}`, body: `<a href="https://yourdomain.com/invite/${token}">Click to join</a>`})

    console.log(`[Mock Email Sent] To: ${email}, Token: ${token}, Wks: ${workspaceName}`);

    return NextResponse.json({ success: true, message: 'Invite queued' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
