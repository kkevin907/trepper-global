const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://trepper-global.de',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async (request) => {
  // Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false }), { status: 405, headers: CORS_HEADERS });
  }

  let nachricht, email;
  try {
    const body = await request.json();
    nachricht = (body?.nachricht || '').trim();
    email     = (body?.email     || '').trim();
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 400, headers: CORS_HEADERS });
  }

  if (!nachricht) {
    return new Response(JSON.stringify({ success: false, error: 'Nachricht fehlt.' }), { status: 400, headers: CORS_HEADERS });
  }

  // Basic length limits to prevent spam
  if (nachricht.length > 2000) {
    return new Response(JSON.stringify({ success: false, error: 'Nachricht zu lang.' }), { status: 400, headers: CORS_HEADERS });
  }

  // Optional email: validate if provided
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ success: false, error: 'E-Mail-Adresse ungültig.' }), { status: 400, headers: CORS_HEADERS });
  }

  const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;

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
    headers: CORS_HEADERS,
  });
};

export const config = { path: '/api/feedback' };
