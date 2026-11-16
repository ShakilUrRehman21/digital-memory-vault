import Link from 'next/link';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './landing.css';
import { Reveal, Stagger, StaggerItem, ScrollProgress } from './motion/Motion';

const sans = Inter_Tight({ subsets: ['latin'], weight: ['400', '500', '800'], variable: '--mv-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--mv-mono' });

const timeline = [
  { d: 'MAR 02', c: '80%', t: 'Switch pricing to annual-first', o: '+ WORKED', miss: false },
  { d: 'APR 19', c: '95%', t: 'Hire generalist over specialist', o: '- MISSED', miss: true },
  { d: 'JUN 07', c: '55%', t: 'Delay launch by two weeks', o: '+ WORKED', miss: false },
  { d: 'AUG 30', c: '90%', t: 'Sign the agency contract', o: 'PATTERN: OVERCONFIDENT', miss: true },
];

const steps = [
  ['Record', 'Write down the decision, the options you rejected, and how confident you are. Under a minute.'],
  ['Review', 'Come back when the result is in. Score the outcome honestly against what you expected.'],
  ['Recalibrate', 'See where your confidence matches reality, and where it consistently does not.'],
];

const features = [
  ['Decision log', 'Every call with its context, alternatives and confidence, in one place.'],
  ['Outcome tracking', 'Close the loop on each decision so nothing stays a guess.'],
  ['Pattern analytics', 'Charts that surface your blind spots by category, confidence and time.'],
  ['PDF export', 'Take your record with you, or share it with a coach or co-founder.'],
];

export default function LandingContent() {
  return (
    <div className={`mv ${sans.variable} ${mono.variable}`}>
      <ScrollProgress color="#2340ff" />
      <header className="mv-wrap mv-nav">
        <Link href="/" className="mv-brand">Memory Vault</Link>
        <nav>
          <a href="#how">How it works</a>
          <Link href="/auth/login">Sign in</Link>
          <Link href="/auth/register" className="mv-btn mv-btn-sm">Get started</Link>
        </nav>
      </header>

      <main>
        <section className="mv-wrap mv-hero">
          <h1 className="mv-rise">Your decisions,<br /><span>on the record.</span></h1>
          <div className="mv-side mv-rise mv-d2">
            <p>Not a journal. Not therapy. Log what you decided and how sure you were, score how it played out, and get real data on your own judgment.</p>
            <Link href="/auth/register" className="mv-btn">Start recording &rarr;</Link>
          </div>
        </section>

        <section className="mv-wrap mv-rise mv-d3" aria-label="Example decision timeline">
          <Stagger className="mv-tl" gap={0.12}>
            {timeline.map((e) => (
              <StaggerItem key={e.d} className={`mv-ev ${e.miss ? 'mv-miss' : ''}`}>
                <small>{e.d} &middot; {e.c} SURE</small>
                <h3>{e.t}</h3>
                <span className="mv-o">{e.o}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section id="how" className="mv-wrap mv-how">
          <Reveal><p className="mv-kicker">How it works</p></Reveal>
          <Stagger className="mv-steps" gap={0.14}>
            {steps.map(([t, d], i) => (
              <StaggerItem key={t}>
                <span className="mv-n">0{i + 1}</span>
                <h2>{t}</h2>
                <p>{d}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="mv-blue">
          <div className="mv-wrap mv-feat">
            <Reveal><h2>Every decision.<br />Every outcome.<br />Measured.</h2></Reveal>
            <Stagger className="mv-list">
              {features.map(([t, d]) => (
                <StaggerItem key={t}><h3>{t}</h3><p>{d}</p></StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="mv-wrap mv-cta">
          <Reveal><h2>Start with one decision<br />you made today.</h2></Reveal>
          <Link href="/auth/register" className="mv-btn">Open your vault &rarr;</Link>
        </section>
      </main>

      <footer className="mv-wrap mv-foot">
        <span>Memory Vault</span>
        <nav>
          <Link href="/auth/login">Sign in</Link>
          <Link href="/auth/register">Register</Link>
        </nav>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
