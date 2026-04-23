// refervo.com/r/<form_code>
//
// Handles BOTH:
//   GET  /r/ABC12345   → renders the lead form (looks up referrer + business)
//   POST /r/ABC12345   → inserts a lead into Supabase, returns thank-you page
//
// No build step. No npm. Just a single Cloudflare Pages Function.

const SUPABASE_URL      = 'https://cbddrhejxrynlhfahulz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZGRyaGVqeHJ5bmxoZmFodWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjM0MzgsImV4cCI6MjA4MjQzOTQzOH0.Bk4Co4j6cskSADp4tJE-q4AVQcKbMUtLnwXuVH9hyJY';

// ─────────────────────────────────────────────────────────────────────────
// Route entry
// ─────────────────────────────────────────────────────────────────────────
export async function onRequest(context) {
  const { request, params } = context;
  const rawCode = String(params.code || '').trim().toUpperCase();

  // Basic sanity: 8 chars, alphanumeric only
  if (!/^[A-Z0-9]{6,12}$/.test(rawCode)) {
    return htmlResponse(renderError('Invalid link', 'This referral link doesn\u2019t look right. Please double-check the URL.'), 404);
  }

  // Look up the referrer + their business
  const lookup = await fetchReferrer(rawCode);
  if (!lookup) {
    return htmlResponse(renderError('Link not found', 'This referral link is no longer active.'), 404);
  }

  const { referrer, business } = lookup;

  if (request.method === 'POST') {
    return handlePost(request, referrer, business);
  }

  return htmlResponse(renderForm({ referrer, business, code: rawCode }), 200);
}

// ─────────────────────────────────────────────────────────────────────────
// Supabase calls
// ─────────────────────────────────────────────────────────────────────────

async function fetchReferrer(formCode) {
  // Returns { referrer, business } or null
  const url = new URL(`${SUPABASE_URL}/rest/v1/referrers`);
  url.searchParams.set('form_code', `eq.${formCode}`);
  url.searchParams.set('select', 'id,business_id,type,name,form_code');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Accept':        'application/json',
    },
  });

  if (!res.ok) return null;
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const referrer = rows[0];

  // Fetch the business name/logo for display
  const bUrl = new URL(`${SUPABASE_URL}/rest/v1/businesses`);
  bUrl.searchParams.set('id', `eq.${referrer.business_id}`);
  bUrl.searchParams.set('select', 'id,name,logo,accepting_leads');
  bUrl.searchParams.set('limit', '1');

  const bRes = await fetch(bUrl.toString(), {
    headers: {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Accept':        'application/json',
    },
  });

  if (!bRes.ok) return null;
  const bRows = await bRes.json();
  if (!Array.isArray(bRows) || bRows.length === 0) return null;

  return { referrer, business: bRows[0] };
}

async function insertLead({ business, referrer, clientName, clientPhone, serviceRequested }) {
  const url = `${SUPABASE_URL}/rest/v1/leads`;

  const body = {
    receiver_id:        business.id,
    referrer_id:        referrer.id,
    source:             'public_form',
    status:             'pending_review',
    client_name:        clientName,
    client_phone:       clientPhone,
    service_requested:  serviceRequested,
    notes:              `Service requested: ${serviceRequested}`,
    // RLS explicitly requires these to be null for public_form leads:
    sender_id:               null,
    lead_fee:                null,
    connection_id:           null,
    personal_connection_id:  null,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey':         SUPABASE_ANON_KEY,
      'Authorization':  `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type':   'application/json',
      'Prefer':         'return=representation',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Lead insert failed:', res.status, errText);
    return { ok: false, error: errText || `Status ${res.status}` };
  }

  const data = await res.json().catch(() => null);
  return { ok: true, lead: Array.isArray(data) ? data[0] : data };
}

// ─────────────────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────────────────

async function handlePost(request, referrer, business) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return htmlResponse(renderError('Bad request', 'Something went wrong with your submission. Please try again.'), 400);
  }

  const clientName       = String(form.get('name') || '').trim();
  const clientPhoneRaw   = String(form.get('phone') || '').trim();
  const serviceRequested = String(form.get('service') || '').trim();

  // Validation
  const errors = [];
  if (!clientName || clientName.length < 2)      errors.push('Please enter your full name.');
  if (clientName.length > 100)                   errors.push('Name is too long.');

  const phoneDigits = clientPhoneRaw.replace(/\D/g, '');
  if (phoneDigits.length < 10)                   errors.push('Please enter a valid phone number.');
  if (phoneDigits.length > 15)                   errors.push('That phone number is too long.');

  if (!serviceRequested || serviceRequested.length < 2)  errors.push('Please tell us what service you need.');
  if (serviceRequested.length > 500)                     errors.push('Service description is too long (max 500 characters).');

  if (errors.length > 0) {
    return htmlResponse(renderForm({
      referrer, business,
      code: referrer.form_code,
      errors,
      values: { name: clientName, phone: clientPhoneRaw, service: serviceRequested },
    }), 400);
  }

  const result = await insertLead({
    business,
    referrer,
    clientName,
    clientPhone: phoneDigits,
    serviceRequested,
  });

  if (!result.ok) {
    return htmlResponse(renderForm({
      referrer, business,
      code: referrer.form_code,
      errors: ['We couldn\u2019t send your referral just now. Please try again in a moment.'],
      values: { name: clientName, phone: clientPhoneRaw, service: serviceRequested },
    }), 500);
  }

  return htmlResponse(renderThankYou({ business, referrer, clientName }), 200);
}

// ─────────────────────────────────────────────────────────────────────────
// HTML rendering
// ─────────────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function baseStyles() {
  return `
    :root {
      --orange: #f97316;
      --orange-light: #fb923c;
      --orange-dark: #ea580c;
      --black: #1a1a1a;
      --white: #ffffff;
      --gray-text: #6b7280;
      --gray-strong: #374151;
      --gray-light: #f3f4f6;
      --gray-border: #e5e7eb;
      --red: #dc2626;
      --red-light: #fef2f2;
      --green: #16a34a;
      --green-light: #f0fdf4;
      --font-display: 'Plus Jakarta Sans', sans-serif;
      --font-body: 'DM Sans', sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background: linear-gradient(180deg, var(--gray-light) 0%, var(--white) 100%);
      min-height: 100vh;
      padding: 2rem 1rem;
      color: var(--black);
      -webkit-font-smoothing: antialiased;
    }
    .container { max-width: 460px; margin: 0 auto; }
    .logo {
      text-align: center;
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 1.5rem;
    }
    .logo-refer { color: var(--orange); }
    .logo-vo    { color: var(--black); }
    .card {
      background: var(--white);
      border-radius: 20px;
      padding: 1.75rem 1.5rem;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
    }
    h1 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1.25;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: var(--gray-text);
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .referrer-line {
      display: inline-block;
      background: var(--gray-light);
      color: var(--gray-strong);
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    label {
      display: block;
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--gray-strong);
      margin-bottom: 0.4rem;
      margin-top: 1rem;
    }
    label:first-of-type { margin-top: 0; }
    input[type="text"], input[type="tel"], textarea {
      width: 100%;
      font-family: var(--font-body);
      font-size: 1rem;
      padding: 0.85rem 1rem;
      background: var(--white);
      border: 1.5px solid var(--gray-border);
      border-radius: 12px;
      color: var(--black);
      transition: border-color 0.15s ease;
      -webkit-appearance: none;
      appearance: none;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: var(--orange);
    }
    textarea { resize: vertical; min-height: 90px; }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1rem;
      padding: 0.95rem 1.25rem;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      margin-top: 1.5rem;
      transition: transform 0.1s ease, box-shadow 0.15s ease;
    }
    .btn-primary {
      background: var(--black);
      color: var(--white);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
    }
    .btn-primary:active { transform: translateY(0); }
    .errors {
      background: var(--red-light);
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      color: var(--red);
      font-size: 0.9rem;
    }
    .errors ul { list-style: none; }
    .errors li { padding: 0.15rem 0; }
    .small-print {
      text-align: center;
      font-size: 0.75rem;
      color: var(--gray-text);
      margin-top: 1rem;
      line-height: 1.4;
    }
    .footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.8rem;
      color: var(--gray-text);
    }
    .footer a {
      color: var(--orange);
      text-decoration: none;
    }
    .footer a:hover { text-decoration: underline; }

    /* Thank-you page */
    .success-icon {
      width: 64px;
      height: 64px;
      background: var(--green-light);
      border: 3px solid var(--green);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      font-size: 2rem;
    }
    .cta-card {
      background: linear-gradient(135deg, var(--orange), var(--orange-dark));
      border-radius: 16px;
      padding: 1.5rem;
      margin-top: 1.5rem;
      color: var(--white);
    }
    .cta-card h2 {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
    }
    .cta-card p {
      font-size: 0.9rem;
      line-height: 1.5;
      opacity: 0.95;
      margin-bottom: 1rem;
    }
    .cta-button {
      display: inline-block;
      background: var(--white);
      color: var(--orange-dark);
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.95rem;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      text-decoration: none;
    }
    .cta-button:hover { background: rgba(255,255,255,0.92); }
  `;
}

function headHtml(title) {
  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="robots" content="noindex">
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <style>${baseStyles()}</style>
  `;
}

function renderForm({ referrer, business, code, errors = [], values = {} }) {
  const businessName = escapeHtml(business.name || 'this business');
  const isPerson     = referrer.type === 'person';
  const referrerLine = isPerson
    ? `Sent by ${escapeHtml(referrer.name)}`
    : `Source: ${escapeHtml(referrer.name)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${headHtml(`Send a lead to ${business.name}`)}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-refer">Refer</span><span class="logo-vo">Vo</span>
    </div>

    <div class="card">
      <span class="referrer-line">${referrerLine}</span>
      <h1>Tell ${businessName} how to reach you</h1>
      <p class="subtitle">Fill this out and ${businessName} will get in touch shortly. Takes about 20 seconds.</p>

      ${errors.length > 0 ? `
        <div class="errors">
          <ul>${errors.map(e => `<li>\u2022 ${escapeHtml(e)}</li>`).join('')}</ul>
        </div>
      ` : ''}

      <form method="POST" action="/r/${escapeHtml(code)}" novalidate>
        <label for="name">Your name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          autocomplete="name"
          maxlength="100"
          value="${escapeHtml(values.name || '')}"
          placeholder="First and last name"
        >

        <label for="phone">Phone number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          autocomplete="tel"
          inputmode="tel"
          maxlength="20"
          value="${escapeHtml(values.phone || '')}"
          placeholder="(555) 123-4567"
        >

        <label for="service">What service do you need?</label>
        <textarea
          id="service"
          name="service"
          required
          maxlength="500"
          placeholder="Briefly describe what you\u2019re looking for"
        >${escapeHtml(values.service || '')}</textarea>

        <button type="submit" class="btn btn-primary">Send to ${businessName}</button>

        <p class="small-print">
          By submitting, you agree ${businessName} can contact you about your request.
        </p>
      </form>
    </div>

    <div class="footer">
      Powered by <a href="https://refervo.com">ReferVo</a>
    </div>
  </div>
</body>
</html>`;
}

function renderThankYou({ business, referrer, clientName }) {
  const businessName = escapeHtml(business.name || 'the business');
  const isPerson     = referrer.type === 'person';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${headHtml('Thanks \u2014 we got it')}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-refer">Refer</span><span class="logo-vo">Vo</span>
    </div>

    <div class="card" style="text-align:center;">
      <div class="success-icon">\u2705</div>
      <h1>Thanks, ${escapeHtml(clientName.split(' ')[0] || 'there')}!</h1>
      <p class="subtitle">
        Your info was sent to <strong>${businessName}</strong>. They\u2019ll reach out shortly.
      </p>

      <div class="cta-card" style="text-align:left;">
        <h2>\ud83d\udcb0 Next time, you could get paid.</h2>
        <p>
          When you refer someone to a business you love, you deserve a thank-you.
          Join ReferVo and ${isPerson ? 'businesses can send you cash' : 'every referral can pay you back'}
          \u2014 or you can donate every dollar to a charity you pick.
        </p>
        <a href="https://refervo.com" class="cta-button">Learn more \u2192</a>
      </div>
    </div>

    <div class="footer">
      <a href="https://refervo.com">refervo.com</a>
    </div>
  </div>
</body>
</html>`;
}

function renderError(heading, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${headHtml(heading)}
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-refer">Refer</span><span class="logo-vo">Vo</span>
    </div>
    <div class="card" style="text-align:center;">
      <h1>${escapeHtml(heading)}</h1>
      <p class="subtitle">${escapeHtml(message)}</p>
      <a href="https://refervo.com" class="btn btn-primary" style="text-decoration:none;">Go to refervo.com</a>
    </div>
  </div>
</body>
</html>`;
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      // Basic security headers
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  });
}
