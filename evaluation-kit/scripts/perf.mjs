// Latency measurements for Digital Memory Vault running locally (next start + PostgreSQL 16).
import fs from 'node:fs';
import pg from 'pg';

const BASE = 'http://localhost:3000';
const REPS = Number(process.env.REPS || 30);
const label = process.env.LABEL || 'baseline';
let ipN = 1;
const ip = () => `203.0.113.${(ipN++ % 250) + 1}`;
const pool = new pg.Pool({ connectionString: 'postgres://dmv:dmv@localhost:5432/dmv_eval' });

async function timed(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json', 'x-forwarded-for': ip() };
  if (token) headers.cookie = `auth_token=${token}`;
  const t0 = performance.now();
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined, redirect: 'manual' });
  const buf = await res.arrayBuffer();
  const ms = performance.now() - t0;
  return { ms, status: res.status, res, bytes: buf.byteLength, text: () => new TextDecoder().decode(buf) };
}
const tokenOf = (res) => (res.headers.getSetCookie().find((c) => c.startsWith('auth_token=')) || '').split(';')[0].split('=')[1];
function stats(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)];
  return { n: s.length, median: +q(0.5).toFixed(1), p95: +q(0.95).toFixed(1), min: +s[0].toFixed(1), max: +s[s.length - 1].toFixed(1) };
}
async function newUser(tag) {
  const r = await timed('POST', '/api/auth/register', { body: { email: `${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@perf.dev`, password: 'PerfTest123', fullName: 'Perf User' } });
  return { token: tokenOf(r.res), ms: r.ms, status: r.status };
}
const decisionBody = { title: 'Perf decision', category: 'product', description: 'Latency measurement decision.', expectedOutcome: 'Measured response time.', confidenceLevel: 7, emotionalState: 'calm', riskLevel: 'medium', decisionDate: '2026-09-01' };
const outcomeBody = { actualOutcome: 'Outcome for latency test.', successRating: 6, lessonLearned: 'None, test.', reflection: 'Test reflection.' };

const out = { label, reps: REPS, endpoints: {}, analyticsByN: {}, dashboardByN: {} };

// warm-up
for (let i = 0; i < 5; i++) await timed('GET', '/');

// Register & login (bcrypt cost 12 dominates)
const reg = []; let u;
for (let i = 0; i < 20; i++) { u = await newUser('reg'); if (u.status === 201) reg.push(u.ms); }
out.endpoints['POST /api/auth/register'] = stats(reg);
const email = `login-${Date.now()}@perf.dev`;
await timed('POST', '/api/auth/register', { body: { email, password: 'PerfTest123', fullName: 'Login User' } });
const login = [];
for (let i = 0; i < 20; i++) { const r = await timed('POST', '/api/auth/login', { body: { email, password: 'PerfTest123' } }); if (r.status === 200) login.push(r.ms); }
out.endpoints['POST /api/auth/login'] = stats(login);

// CRUD on a fresh user
const { token } = await newUser('crud');
const create = [], ids = [];
for (let i = 0; i < REPS; i++) { const r = await timed('POST', '/api/decisions', { token, body: decisionBody }); create.push(r.ms); ids.push(JSON.parse(r.text()).decision.id); }
out.endpoints['POST /api/decisions'] = stats(create);
const outc = [];
for (const id of ids) { const r = await timed('POST', `/api/decisions/${id}/outcome`, { token, body: outcomeBody }); outc.push(r.ms); }
out.endpoints['POST /api/decisions/[id]/outcome'] = stats(outc);
const list = [], one = [], exp = [];
for (let i = 0; i < REPS; i++) list.push((await timed('GET', '/api/decisions', { token })).ms);
for (let i = 0; i < REPS; i++) one.push((await timed('GET', `/api/decisions/${ids[i]}`, { token })).ms);
for (let i = 0; i < REPS; i++) exp.push((await timed('GET', `/api/export/${ids[i]}`, { token })).ms);
out.endpoints['GET /api/decisions (30 decisions)'] = stats(list);
out.endpoints['GET /api/decisions/[id]'] = stats(one);
out.endpoints['GET /api/export/[id]'] = stats(exp);

// Analytics and dashboard vs number of resolved decisions (seeded directly in the database)
const cats = ['career', 'finance', 'health', 'product', 'personal'], emos = ['calm', 'stressed', 'excited', 'pressured', 'uncertain'], risks = ['low', 'medium', 'high'];
for (const n of [10, 50, 100, 250, 500]) {
  const { token: t } = await newUser(`n${n}`);
  const { rows: [{ user_id }] } = await pool.query(`select id as user_id from users order by created_at desc limit 1`);
  for (let i = 0; i < n; i++) {
    const { rows: [d] } = await pool.query(
      `insert into decisions (user_id,title,category,description,expected_outcome,confidence_level,emotional_state,risk_level,decision_date,status)
       values ($1,$2,$3,$4,$5,$6,$7,$8, now() - ($9 || ' days')::interval,'outcome_recorded') returning id`,
      [user_id, `Seeded decision ${i}`, cats[i % 5], 'Seeded for latency test.', 'Seeded expected outcome.', 1 + (i * 7) % 10, emos[i % 5], risks[i % 3], String(i % 365)]);
    await pool.query(`insert into outcomes (decision_id,actual_outcome,success_rating,lesson_learned,reflection) values ($1,'Seeded outcome text',$2,'Seeded lesson','Seeded reflection, felt rushed')`, [d.id, 1 + (i * 3) % 10]);
  }
  const a = [], dsh = [];
  await timed('GET', '/api/analytics', { token: t }); await timed('GET', '/dashboard', { token: t }); // warm
  for (let i = 0; i < REPS; i++) a.push((await timed('GET', '/api/analytics', { token: t })).ms);
  for (let i = 0; i < REPS; i++) dsh.push((await timed('GET', '/dashboard', { token: t })).ms);
  out.analyticsByN[n] = stats(a);
  out.dashboardByN[n] = stats(dsh);
}
await pool.end();
fs.writeFileSync(`perf-${label}.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
