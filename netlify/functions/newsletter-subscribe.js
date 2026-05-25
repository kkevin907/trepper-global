const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://trepper-global.de',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, context) {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const apiKey  = (process.env.MAILERLITE_API_KEY  || '').replace(/\s/g, '');
  const groupId = (process.env.MAILERLITE_GROUP_ID || '').trim();

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Newsletter momentan nicht verfügbar.' }), {
      status: 503,
      headers: CORS_HEADERS,
    });
  }

  const payload = { email, double_optin: true };
  if (groupId) payload.groups = [groupId];

  const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  // 200 = already subscribed, 201 = new subscriber
  if (mlRes.status === 200 || mlRes.status === 201) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  // Generic error — don't leak internal API details
  const status = mlRes.status;
  const message = status === 422
    ? 'Diese E-Mail-Adresse ist ungültig.'
    : 'Newsletter momentan nicht verfügbar. Versuch es später nochmal.';

  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: CORS_HEADERS,
  });
}

export const config = { path: '/api/newsletter-subscribe' };
