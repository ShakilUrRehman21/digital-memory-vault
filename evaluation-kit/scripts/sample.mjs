// Illustrative walkthrough: 10 hypothetical decisions entered through the app's API; metrics returned by /api/analytics.
const BASE = 'http://localhost:3000';
const H = { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.99' };
const reg = await fetch(BASE + '/api/auth/register', { method: 'POST', headers: H, body: JSON.stringify({ email: `sample-${Date.now()}@demo.dev`, password: 'SampleUser1', fullName: 'Sample User' }) });
const cookie = reg.headers.getSetCookie()[0].split(';')[0];
const rows = [
  ['Accept internship offer', 'career', 8, 'medium', 'calm', 9, 'Compared both offers carefully before deciding.'],
  ['Buy a laptop on EMI', 'finance', 7, 'low', 'excited', 7, 'Planned the budget first; payments are manageable.'],
  ['Launch feature without user testing', 'product', 9, 'high', 'pressured', 3, 'Rushed it before the demo; users found bugs.'],
  ['Join a morning gym batch', 'health', 6, 'low', 'calm', 8, 'Consistent routine helped more than expected.'],
  ['Move to a shared flat', 'personal', 7, 'medium', 'uncertain', 5, 'Mixed experience; some doubt about the choice remains.'],
  ['Switch database provider mid-sprint', 'product', 8, 'high', 'stressed', 4, 'Panic after the outage made me hasty.'],
  ['Apply for a hackathon', 'career', 5, 'medium', 'calm', 8, 'Went in with low expectations and learned a lot.'],
  ['Invest savings in an index fund', 'finance', 6, 'medium', 'calm', 6, 'Steady result, as planned.'],
  ['Hire a freelance designer', 'product', 9, 'medium', 'excited', 5, 'Impulsive hire based on one portfolio; I regret skipping references.'],
  ['Start a weekend course', 'personal', 7, 'low', 'calm', 8, 'Good fit with my schedule.'],
];
for (const [title, category, conf, risk, emo, succ, refl] of rows) {
  const d = await (await fetch(BASE + '/api/decisions', { method: 'POST', headers: { ...H, cookie }, body: JSON.stringify({ title, category, description: `Sample decision: ${title}.`, expectedOutcome: 'A positive result within a month.', confidenceLevel: conf, emotionalState: emo, riskLevel: risk, decisionDate: '2026-09-01' }) })).json();
  const o = await fetch(BASE + `/api/decisions/${d.decision.id}/outcome`, { method: 'POST', headers: { ...H, cookie }, body: JSON.stringify({ actualOutcome: 'Sample outcome recorded for the walkthrough.', successRating: succ, lessonLearned: 'Sample lesson.', reflection: refl }) });
  if (o.status !== 201) console.log('outcome failed', o.status);
}
const a = await (await fetch(BASE + '/api/analytics', { headers: { ...H, cookie } })).json();
const { confidenceVsOutcome, monthlyTrend, ...rest } = a;
console.log(JSON.stringify(rest, null, 1));
