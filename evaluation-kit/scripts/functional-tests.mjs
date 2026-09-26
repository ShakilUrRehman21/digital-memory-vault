// Functional tests for Digital Memory Vault (run against a live local server).
// Usage: node functional-tests.mjs  (server on http://localhost:3000)
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const results = [];
let ipCounter = 1;
const freshIp = () => `192.0.2.${ipCounter++}`;

function record(id, area, description, expected, actual, pass) {
  results.push({ id, area, description, expected, actual: String(actual), pass: !!pass });
}

function getCookieHeader(res) {
  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  return raw.find((c) => c.startsWith('auth_token=')) || null;
}
function tokenFrom(setCookie) {
  return setCookie ? setCookie.split(';')[0].split('=')[1] : null;
}
async function call(method, path, { token, body, ip, manual = true } = {}) {
  const headers = { 'Content-Type': 'application/json', 'x-forwarded-for': ip || freshIp() };
  if (token) headers.cookie = `auth_token=${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: manual ? 'manual' : 'follow',
  });
  let json = null;
  const ct = res.headers.get('content-type') || '';
  let text = '';
  if (ct.includes('application/json')) json = await res.json();
  else text = await res.text();
  return { res, status: res.status, json, text, setCookie: getCookieHeader(res) };
}

const stamp = Date.now();
const userA = { email: `a${stamp}@test.dev`, password: 'CorrectHorse9', fullName: 'Test User A' };
const userB = { email: `b${stamp}@test.dev`, password: 'BatteryStaple7', fullName: 'Test User B' };
const validDecision = {
  title: 'Accept internship offer',
  category: 'career',
  description: 'Choosing between two internship offers for the summer.',
  expectedOutcome: 'Gain product experience and a return offer.',
  confidenceLevel: 8,
  emotionalState: 'calm',
  riskLevel: 'medium',
  decisionDate: '2026-07-01',
};
const validOutcome = {
  actualOutcome: 'Received a return offer after the internship.',
  successRating: 9,
  lessonLearned: 'Comparing offers carefully paid off.',
  reflection: 'Took time to compare offers; glad I did.',
};

// ---------- Authentication ----------
let r = await call('POST', '/api/auth/register', { body: userA });
const sc = r.setCookie || '';
record('TC01', 'Authentication', 'Register with valid details', '201 and session cookie set',
  `${r.status}; cookie ${sc ? 'set' : 'missing'}`, r.status === 201 && !!sc);
let tokenA = tokenFrom(r.setCookie);

record('TC02', 'Authentication', 'Session cookie is HttpOnly, SameSite=Strict, Secure, 7-day expiry',
  'All four attributes present',
  sc.replace(/auth_token=[^;]+/, 'auth_token=<token>'),
  /HttpOnly/i.test(sc) && /SameSite=Strict/i.test(sc) && /Secure/i.test(sc) && /Max-Age=604800/.test(sc));

r = await call('POST', '/api/auth/register', { body: userA });
record('TC03', 'Authentication', 'Register with an email already in use', '409', r.status, r.status === 409);

r = await call('POST', '/api/auth/register', { body: { ...userB, password: 'short' } });
record('TC04', 'Authentication', 'Register with a password under 8 characters', '400', r.status, r.status === 400);

r = await call('POST', '/api/auth/register', { body: { ...userB, email: 'not-an-email' } });
record('TC05', 'Authentication', 'Register with an invalid email format', '400', r.status, r.status === 400);

r = await call('POST', '/api/auth/login', { body: { email: userA.email, password: userA.password } });
record('TC06', 'Authentication', 'Log in with correct credentials', '200 and session cookie set',
  `${r.status}; cookie ${r.setCookie ? 'set' : 'missing'}`, r.status === 200 && !!r.setCookie);
tokenA = tokenFrom(r.setCookie) || tokenA;

r = await call('POST', '/api/auth/login', { body: { email: userA.email, password: 'WrongPassword1' } });
record('TC07', 'Authentication', 'Log in with a wrong password', '401', r.status, r.status === 401);

{
  const ip = '198.51.100.7';
  const statuses = [];
  for (let i = 0; i < 6; i++) {
    const x = await call('POST', '/api/auth/login', { ip, body: { email: userA.email, password: 'WrongPassword1' } });
    statuses.push(x.status);
  }
  record('TC08', 'Authentication', 'Sixth failed login from the same IP within one minute is blocked',
    'Attempts 1–5: 401, attempt 6: 429', statuses.join(', '),
    statuses.slice(0, 5).every((s) => s === 401) && statuses[5] === 429);
}

// Register user B for access-control tests
r = await call('POST', '/api/auth/register', { body: userB });
const tokenB = tokenFrom(r.setCookie);

// ---------- Route protection ----------
r = await call('GET', '/dashboard');
record('TC09', 'Route protection', 'Open the dashboard without logging in', 'Redirect to /auth/login',
  `${r.status} → ${r.res.headers.get('location')}`, [302, 307].includes(r.status) && /\/auth\/login/.test(r.res.headers.get('location') || ''));

r = await call('GET', '/api/decisions');
record('TC10', 'Route protection', 'Call the decisions API without logging in', 'Request refused (redirect to /auth/login)',
  `${r.status} → ${r.res.headers.get('location')}`, [302, 307].includes(r.status) && /\/auth\/login/.test(r.res.headers.get('location') || ''));

r = await call('GET', '/api/decisions', { token: tokenA.slice(0, -4) + 'abcd' });
record('TC11', 'Route protection', 'Call the API with a tampered token', 'Redirect to /auth/login and cookie cleared',
  `${r.status}; cookie ${r.setCookie ? 'cleared' : 'not cleared'}`, [302, 307].includes(r.status) && !!r.setCookie);

r = await call('GET', '/auth/login', { token: tokenA });
record('TC12', 'Route protection', 'Open the login page while already logged in', 'Redirect to /dashboard',
  `${r.status} → ${r.res.headers.get('location')}`, [302, 307].includes(r.status) && /\/dashboard/.test(r.res.headers.get('location') || ''));

// ---------- Decisions ----------
r = await call('POST', '/api/decisions', { token: tokenA, body: validDecision });
const decisionId = r.json?.decision?.id;
record('TC13', 'Decision logging', 'Log a decision with all fields valid', '201, status "pending_outcome"',
  `${r.status}; ${r.json?.decision?.status}`, r.status === 201 && r.json?.decision?.status === 'pending_outcome');

r = await call('POST', '/api/decisions', { token: tokenA, body: { ...validDecision, confidenceLevel: 11 } });
const s11 = r.status;
r = await call('POST', '/api/decisions', { token: tokenA, body: { ...validDecision, confidenceLevel: 0 } });
record('TC14', 'Decision logging', 'Log a decision with confidence outside 1–10 (0 and 11)', '400 for both',
  `${s11}, ${r.status}`, s11 === 400 && r.status === 400);

r = await call('POST', '/api/decisions', { token: tokenA, body: { ...validDecision, category: 'travel' } });
record('TC15', 'Decision logging', 'Log a decision with an unknown category', '400', r.status, r.status === 400);

r = await call('POST', '/api/decisions', { token: tokenA, body: { ...validDecision, description: 'short' } });
record('TC16', 'Decision logging', 'Log a decision with a description under 10 characters', '400', r.status, r.status === 400);

await call('POST', '/api/decisions', { token: tokenA, body: { ...validDecision, title: 'Buy laptop on EMI', category: 'finance' } });
r = await call('GET', '/api/decisions', { token: tokenA });
record('TC17', 'Decision logging', 'List own decisions', '200 with both logged decisions',
  `${r.status}; ${r.json?.decisions?.length} decisions`, r.status === 200 && r.json?.decisions?.length === 2);

r = await call('GET', '/api/decisions?category=finance', { token: tokenA });
record('TC18', 'Decision logging', 'Filter decisions by category', 'Only finance decisions returned',
  `${r.json?.decisions?.length} returned; categories: ${[...new Set(r.json?.decisions?.map((d) => d.category))].join(',')}`,
  r.json?.decisions?.length === 1 && r.json.decisions[0].category === 'finance');

r = await call('PUT', `/api/decisions/${decisionId}`, { token: tokenA, body: { title: 'Accept summer internship offer' } });
record('TC19', 'Decision logging', 'Edit the title of a pending decision', '200 with updated title',
  `${r.status}; ${r.json?.decision?.title ?? r.json?.error}`, r.status === 200 && r.json?.decision?.title === 'Accept summer internship offer');

// ---------- Access control ----------
r = await call('GET', `/api/decisions/${decisionId}`, { token: tokenB });
record('TC20', 'Access control', "Another user reads user A's decision", '404', r.status, r.status === 404);

r = await call('DELETE', `/api/decisions/${decisionId}`, { token: tokenB });
record('TC21', 'Access control', "Another user deletes user A's decision", '404 and decision still exists', r.status, r.status === 404);

r = await call('POST', `/api/decisions/${decisionId}/outcome`, { token: tokenB, body: validOutcome });
record('TC22', 'Access control', "Another user records an outcome on user A's decision", '404', r.status, r.status === 404);

// ---------- Outcomes ----------
r = await call('POST', `/api/decisions/${decisionId}/outcome`, { token: tokenA, body: { ...validOutcome, successRating: 0 } });
record('TC23', 'Outcome recording', 'Record an outcome with success rating outside 1–10', '400', r.status, r.status === 400);

r = await call('POST', `/api/decisions/${decisionId}/outcome`, { token: tokenA, body: validOutcome });
const r2 = await call('GET', `/api/decisions/${decisionId}`, { token: tokenA });
record('TC24', 'Outcome recording', 'Record a valid outcome', '201; decision status becomes "outcome_recorded"',
  `${r.status}; ${r2.json?.decision?.status}`, r.status === 201 && r2.json?.decision?.status === 'outcome_recorded');

r = await call('POST', `/api/decisions/${decisionId}/outcome`, { token: tokenA, body: validOutcome });
record('TC25', 'Outcome recording', 'Record a second outcome for the same decision', '409', r.status, r.status === 409);

r = await call('PUT', `/api/decisions/${decisionId}`, { token: tokenA, body: { confidenceLevel: 9 } });
const after = await call('GET', `/api/decisions/${decisionId}`, { token: tokenA });
record('TC26', 'Outcome recording', 'Change the original confidence after the outcome is recorded', 'Rejected, so predictions stay fixed',
  `${r.status}; confidence now ${after.json?.decision?.confidenceLevel}`, r.status >= 400);

// ---------- Analytics ----------
r = await call('GET', '/api/analytics', { token: tokenB });
record('TC27', 'Analytics', 'Request analytics for a user with no decisions', '200 with all scores 0',
  `${r.status}; scores ${[r.json?.decisionAccuracyScore, r.json?.riskCalibrationScore, r.json?.emotionalBiasScore, r.json?.confidenceCalibrationScore].join('/')}`,
  r.status === 200 && r.json.decisionAccuracyScore === 0 && r.json.confidenceCalibrationScore === 0);

r = await call('GET', '/api/analytics', { token: tokenA });
record('TC28', 'Analytics', 'Request analytics for a user with one resolved decision', '200; completed = 1, pending = 1',
  `${r.status}; completed ${r.json?.completedDecisions}, pending ${r.json?.pendingDecisions}`,
  r.status === 200 && r.json.completedDecisions === 1 && r.json.pendingDecisions === 1);

// ---------- Export ----------
r = await call('GET', `/api/export/${decisionId}`, { token: tokenA });
record('TC29', 'Report export', 'Export a decision report', '200, HTML file download',
  `${r.status}; ${r.res.headers.get('content-type')}; ${r.res.headers.get('content-disposition')}`,
  r.status === 200 && /text\/html/.test(r.res.headers.get('content-type') || '') && /attachment/.test(r.res.headers.get('content-disposition') || ''));

r = await call('GET', `/api/export/${decisionId}`, { token: tokenB });
record('TC30', 'Report export', "Another user exports user A's decision", '404', r.status, r.status === 404);

{
  const x = await call('POST', '/api/decisions', { token: tokenA, body: { ...validDecision, title: '<b id="inj">Injected</b>' } });
  const exp = await call('GET', `/api/export/${x.json?.decision?.id}`, { token: tokenA });
  const raw = exp.text.includes('<b id="inj">Injected</b>');
  record('TC31', 'Report export', 'Export a decision whose title contains HTML markup', 'Markup escaped in the report',
    raw ? 'Markup inserted unescaped' : 'Markup escaped', !raw);
}

// ---------- Deletion ----------
r = await call('DELETE', `/api/decisions/${decisionId}`, { token: tokenA });
const gone = await call('GET', `/api/decisions/${decisionId}`, { token: tokenA });
record('TC32', 'Decision logging', 'Delete a decision (outcome removed with it)', '200, then 404 on read',
  `${r.status}, then ${gone.status}`, r.status === 200 && gone.status === 404);

// ---------- Logout ----------
r = await call('POST', '/api/auth/logout', { token: tokenA });
const expired = /Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(r.setCookie || '');
record('TC33', 'Authentication', 'Log out', '200 and session cookie cleared',
  `${r.status}; cookie ${expired ? 'cleared' : 'not cleared'}`, r.status === 200 && expired);

fs.writeFileSync(new URL('./functional-results.json', import.meta.url), JSON.stringify(results, null, 2));
for (const t of results) console.log(`${t.pass ? 'PASS' : 'FAIL'}  ${t.id}  ${t.description}  ->  ${t.actual}`);
console.log(`\n${results.filter((t) => t.pass).length}/${results.length} passed`);
