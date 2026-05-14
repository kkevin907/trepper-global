export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let email;
  try {
    const body = await request.json();
    email = body?.email?.trim();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Ungültige Anfrage.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ success: false, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey  = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;

  if (!apiKey || !groupId) {
    return new Response(JSON.stringify({ success: false, error: 'Server-Konfigurationsfehler.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, groups: [groupId] }),
    });

    if (res.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json().catch(() => ({}));
    return new Response(
      JSON.stringify({ success: false, error: data?.message || 'Anmeldung fehlgeschlagen. Bitte versuch es nochmal.' }),
      { status: res.status, headers: { 'Content-Type': 'application/json' } }
    );

  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Keine Verbindung. Bitte versuch es nochmal.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: '/api/newsletter-subscribe',
};
