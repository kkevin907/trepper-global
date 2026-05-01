export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey   = process.env.MAILERLITE_API_KEY;
  const groupId  = process.env.MAILERLITE_GROUP_ID;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Newsletter momentan nicht verfügbar.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = { email };
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
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const err = await mlRes.json().catch(() => ({}));
  const message = err?.message || 'Unbekannter Fehler';
  return new Response(JSON.stringify({ error: message }), {
    status: mlRes.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = { path: '/api/newsletter-subscribe' };
