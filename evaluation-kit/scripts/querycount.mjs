import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgres://dmv:dmv@localhost:5432/dmv_eval' });
const n = Number(process.argv[2]);
const r = await fetch('http://localhost:3000/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.200' }, body: JSON.stringify({ email: `qc${n}-${Date.now()}@perf.dev`, password: 'PerfTest123', fullName: 'QC' }) });
const token = r.headers.getSetCookie()[0].split(';')[0].split('=')[1];
const { rows: [{ id }] } = await pool.query('select id from users order by created_at desc limit 1');
for (let i = 0; i < n; i++) {
  const { rows: [d] } = await pool.query(`insert into decisions (user_id,title,category,description,expected_outcome,confidence_level,emotional_state,risk_level,decision_date,status) values ($1,'q','career','seeded','seeded',5,'calm','low',now(),'outcome_recorded') returning id`, [id]);
  await pool.query(`insert into outcomes (decision_id,actual_outcome,success_rating,lesson_learned,reflection) values ($1,'x',5,'x','x')`, [d.id]);
}
await pool.end();
console.log(token);
