const crypto = require('node:crypto');
const BASE_TAG = 'Surf Town Quiz - October 2026';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const respond = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' });
  let input;
  try { input = JSON.parse(event.body || '{}'); } catch { return respond(400, { error: 'Invalid request' }); }
  const email = String(input.email || '').trim().toLowerCase();
  const firstName = String(input.first_name || '').trim().slice(0, 100);
  const consent = input.marketing_consent === true;
  if (!emailPattern.test(email) || email.length > 254 || !firstName) return respond(400, { error: 'Please provide a valid name and email' });
  const key = process.env.MAILCHIMP_API_KEY;
  const audience = process.env.MAILCHIMP_AUDIENCE_ID;
  const dc = process.env.MAILCHIMP_DC || (key && key.split('-').pop());
  if (!key || !audience || !/^[a-z]{2,4}\d+$/.test(dc || '')) return respond(500, { error: 'Integration is not configured' });
  const base = `https://${dc}.api.mailchimp.com/3.0`;
  const auth = { 'Authorization': `Basic ${Buffer.from('netlify:' + key).toString('base64')}`, 'Content-Type': 'application/json' };
  const hash = crypto.createHash('md5').update(email).digest('hex');
  const memberUrl = `${base}/lists/${encodeURIComponent(audience)}/members/${hash}`;
  try {
    // status_if_new avoids overwriting subscription preferences of existing contacts.
    const upsert = await fetch(memberUrl, {
      method: 'PUT', headers: auth,
      body: JSON.stringify({ email_address: email, status_if_new: consent ? 'subscribed' : 'transactional', merge_fields: { FNAME: firstName } })
    });
    if (!upsert.ok) {
      console.error('Mailchimp member error', upsert.status, (await upsert.text()).slice(0, 500));
      return respond(502, { error: 'Unable to save your details right now' });
    }
    const member = await upsert.json();
    // If an existing non-subscribed contact newly opts in, use a Mailchimp hosted
    // signup flow instead of silently changing their status here.
    const tagResponse = await fetch(`${memberUrl}/tags`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ tags: [{ name: BASE_TAG, status: 'active' }] })
    });
    if (!tagResponse.ok) {
      console.error('Mailchimp tag error', tagResponse.status, (await tagResponse.text()).slice(0, 500));
      return respond(502, { error: 'Unable to finish saving your details' });
    }
    return respond(200, { ok: true, subscribed: member.status === 'subscribed' });
  } catch (error) {
    console.error('Mailchimp integration failure', error);
    return respond(502, { error: 'Service temporarily unavailable' });
  }
};
