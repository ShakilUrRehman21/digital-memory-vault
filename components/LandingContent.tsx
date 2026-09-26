'use client';

import { StackedScroll, ScratchFooter } from '@/components/LandingDynamics';

const FEATURES = [
    { icon: '◈', title: 'Decision Log', desc: 'Log every major decision with context — confidence level, emotional state, risk assessment, and expected outcome.' },
    { icon: '◉', title: 'Outcome Tracking', desc: 'Record what actually happened. Compare your prediction against reality. Track success ratings over time.' },
    { icon: '⬡', title: 'Calibration Score', desc: 'Measure the gap between confidence and outcome. Identify if you are systematically over or under-confident.' },
    { icon: '◫', title: 'Risk Calibration', desc: 'See how your high-risk bets perform versus low-risk plays. Build an accurate model of your own risk tolerance.' },
    { icon: '◬', title: 'Emotional Bias Detection', desc: 'Detect emotion-driven decisions through state tracking and reflection keyword analysis.' },
    { icon: '◭', title: 'Analytics Dashboard', desc: 'Visual scatter plots, heatmaps, trends, and distribution charts give you a complete picture of your decision patterns.' },
];

const STATS = [
    { label: 'Decisions Tracked', value: '12,400+' },
    { label: 'Avg Calibration Gain', value: '+31%' },
    { label: 'Bias Patterns Detected', value: '8 types' },
    { label: 'Risk Accuracy Improved', value: '2.4×' },
];

export default function LandingContent() {
    return (
        <main style={{ background: '#000', minHeight: '100vh' }}>
            {/* HERO */}
            <section style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

                {/* Nav */}
                <nav style={{
                    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '24px 48px', borderBottom: '1px solid #0e0e0e',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4a9eff' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em', color: '#f0f0f0' }}>DIGITAL MEMORY VAULT</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <a href="/auth/login" className="btn btn-ghost btn-sm">Login</a>
                        <a href="/auth/register" className="btn btn-primary btn-sm">Get Started</a>
                    </div>
                </nav>

                {/* Hero content */}
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px', padding: '0 40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', border: '1px solid #1c1c1c', background: '#080808', marginBottom: '32px' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4a9eff', boxShadow: '0 0 8px #4a9eff' }} />
                        <span style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555' }}>Behavioral Intelligence Dashboard</span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#f0f0f0', marginBottom: '24px' }}>
                        Every Decision.<br />
                        <span style={{ color: '#4a9eff' }}>Every Outcome.</span><br />
                        Measured.
                    </h1>

                    <p style={{ fontSize: '17px', lineHeight: 1.7, color: '#555', maxWidth: '520px', margin: '0 auto 44px' }}>
                        Not a journal. Not therapy. A precision analytics engine for founders and operators who want data on their decision-making patterns.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="/auth/register" className="btn btn-primary" style={{ padding: '13px 32px', fontSize: '14px' }}>
                            Start Tracking Decisions
                        </a>
                        <a href="/auth/login" className="btn btn-ghost" style={{ padding: '13px 32px', fontSize: '14px' }}>
                            Sign In
                        </a>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2a2a2a' }}>Scroll</span>
                    <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, #2a2a2a, transparent)' }} />
                </div>
            </section>

            {/* STATS BAR */}
            <div style={{ borderTop: '1px solid #111', borderBottom: '1px solid #111', padding: '28px 80px', display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
                {STATS.map((stat) => (
                    <div key={stat.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f0f0' }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444', marginTop: '4px' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* FEATURES GRID */}
            <section style={{ padding: '120px 80px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '64px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#444', marginBottom: '12px' }}>What it does</div>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, letterSpacing: '-0.02em' }}>Analytical Decision Intelligence</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', border: '1px solid #111', borderRadius: '16px', overflow: 'hidden' }}>
                    {FEATURES.map((feature) => (
                        <div key={feature.title}
                            style={{ padding: '36px', background: '#080808', borderRight: '1px solid #111', borderBottom: '1px solid #111', transition: 'background 0.2s', cursor: 'default' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0e0e0e'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#080808'; }}>
                            <div style={{ fontSize: '24px', color: '#4a9eff', marginBottom: '16px', opacity: 0.7 }}>{feature.icon}</div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#e0e0e0', marginBottom: '10px' }}>{feature.title}</div>
                            <div style={{ fontSize: '13px', lineHeight: 1.65, color: '#555' }}>{feature.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* STACKED SCROLL SECTION */}
            <StackedScroll />

            {/* CTA */}
            <section style={{ padding: '120px 80px', textAlign: 'center', borderTop: '1px solid #111' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#444', marginBottom: '24px' }}>Ready to start?</div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '20px' }}>
                    Understand Your<br /><span style={{ color: '#4a9eff' }}>Decision DNA</span>
                </h2>
                <p style={{ fontSize: '16px', color: '#555', marginBottom: '40px' }}>Free to start. No credit card. Yours to own.</p>
                <a href="/auth/register" className="btn btn-primary" style={{ padding: '15px 48px', fontSize: '15px' }}>
                    Create Free Account
                </a>
            </section>

            {/* SCRATCH FOOTER */}
            <ScratchFooter />
        </main>
    );
}
