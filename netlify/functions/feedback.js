export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false }), { status: 405 });
  }

  let nachricht, email;
  try {
    const body = await request.json();
    nachricht = (body?.nachricht || '').trim();
    email     = (body?.email     || '').trim();
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }

  if (!nachricht) {
    return new Response(JSON.stringify({ success: false, error: 'Nachricht fehlt.' }), { status: 400 });
  }

  const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;

  // If a Discord/Slack webhook is configured, forward there
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**Neues Feedback auf trepper-global.de**\n\n${nachricht}${email ? `\n\nVon: ${email}` : ''}`,
      }),
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = { path: '/api/feedback' };
