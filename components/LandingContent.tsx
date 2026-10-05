'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StackedScroll } from '@/components/LandingDynamics';
import BrandLogo from '@/components/BrandLogo';
import SiteFooter from '@/components/SiteFooter';
import Hero from '@/components/Hero';

// Decision simulation scenarios for Hero centerpiece
interface Scenario {
    id: string;
    label: string;
    title: string;
    category: string;
    risk: 'high' | 'medium' | 'low';
    emotionalState: string;
    confidence: number;
    expectedOutcome: string;
    actualOutcome: string;
    successRating: number;
    calibrationScore: number;
    biasAlert: string;
    lesson: string;
}

const SCENARIOS: Scenario[] = [
    {
        id: 'pivot',
        label: 'Enterprise AI Pivot',
        title: 'Deprecate Legacy Self-Serve & Shift to Enterprise AI Agents',
        category: 'product',
        risk: 'high',
        emotionalState: 'excited',
        confidence: 8,
        expectedOutcome: 'Close 3 enterprise pilots within 60 days with ACV > $60k; withstand 15% churn in legacy SMB tier.',
        actualOutcome: 'Closed 4 enterprise pilots ($280k ARR total); SMB churn was 12%. Transition executed cleanly.',
        successRating: 9,
        calibrationScore: 90,
        biasAlert: 'Slight optimism bias detected on timeline (took 74 days vs 60 planned), but downside risk well hedged.',
        lesson: 'Pre-mortem contracts with early lighthouse customers de-risked the high-stakes architectural shift.',
    },
    {
        id: 'hire',
        label: 'VP of Engineering Hire',
        title: 'Extend Aggressive Offer to Out-of-Industry Head of Platform',
        category: 'career',
        risk: 'medium',
        emotionalState: 'pressured',
        confidence: 7,
        expectedOutcome: 'Candidate scales team from 8 to 25 engineers in 9 months while reducing cycle time by 30%.',
        actualOutcome: 'Engineering cycle time decreased by 34%, but team friction caused 2 senior departures in month 3.',
        successRating: 7,
        calibrationScore: 100,
        biasAlert: 'Zero calibration gap (predicted 7, scored 7). Emotional pressure at offer time correctly discounted in model.',
        lesson: 'Technical competence was high; onboarding cultural alignment needed a dedicated buddy framework.',
    },
    {
        id: 'treasury',
        label: 'Treasury & Runaway Hedging',
        title: 'Lock 18 Months of Runway into Short-Term Yield & FX Hedge',
        category: 'finance',
        risk: 'low',
        emotionalState: 'calm',
        confidence: 9,
        expectedOutcome: 'Preserve capital with 5.1% annualized yield; protect against 8% USD/EUR currency volatility.',
        actualOutcome: 'Yield delivered exactly 5.12%; avoided $42k FX drag during Q2 transatlantic expansion.',
        successRating: 10,
        calibrationScore: 90,
        biasAlert: 'Calm baseline generated optimal risk asymmetry and preserved capital during market drawdown.',
        lesson: 'Conservative treasury operations eliminate cognitive bandwidth waste during expansion sprints.',
    },
];

const TRUST_LOGOS = [
    { name: 'Apex Quant Labs', symbol: '▲ APEX QUANT' },
    { name: 'Lattice Venture Network', symbol: '⬡ LATTICE' },
    { name: 'Hyperion Systems', symbol: '◈ HYPERION' },
    { name: 'Sequoia Alumni Forum', symbol: '❖ S-NETWORK' },
    { name: 'Matrix Capital', symbol: '◫ MATRIX' },
    { name: 'Founders Guild', symbol: '◎ GUILD_01' },
];

const BENTO_FEATURES = [
    {
        icon: '◈',
        badge: 'Hindsight Immunity',
        title: 'Pre-Commitment Decision Logging',
        desc: 'Lock down your hypothesis, emotional state, risk assessment, and confidence level at T=0. Never fall victim to "I knew it all along" revisionism again.',
        highlight: 'Real-time contextual timestamping',
        accentColor: '#10b981',
    },
    {
        icon: '📐',
        badge: 'Mathematical Rigor',
        title: 'The Calibration Curve & Brier Scoring',
        desc: 'Empirically measure the gap between confidence and outcome. Systematically identify if you are overconfident when bullish or hesitant during market turbulence.',
        highlight: 'Scored: 100 − (|confidence − outcome| × 10)',
        accentColor: '#2563eb',
    },
    {
        icon: '🧠',
        badge: 'Behavioral Pattern Detection',
        title: 'Emotional Bias Detection Engine',
        desc: 'Detect how psychological states (calm, stressed, excited, pressured, uncertain) distort strategic bets using semantic scan of post-outcome reflections.',
        highlight: 'Flags rushed, reactive, and panic vectors',
        accentColor: '#9333ea',
    },
    {
        icon: '🎲',
        badge: 'Asymmetric Return',
        title: 'Risk-Adjusted Performance Profiler',
        desc: 'Isolate high-risk plays from safe operational decisions. Discover whether your high-risk bets generate actual alpha or just unnecessary volatility.',
        highlight: 'Normalized across High / Medium / Low tiers',
        accentColor: '#b7791f',
    },
    {
        icon: '📓',
        badge: 'Wisdom Compounding',
        title: 'Codified Post-Mortems & Playbooks',
        desc: 'Turn wins and failures into permanent operational wisdom. Record lessons learned and build a personalized rulebook for high-leverage moments.',
        highlight: 'Continuous reflection loops',
        accentColor: '#10b981',
    },
    {
        icon: '📄',
        badge: 'Board & Investor Ready',
        title: 'Executive PDF Dossiers & Reports',
        desc: 'Export boardroom-grade decision audits and analytical summaries for investment committees, co-founder reviews, and quarterly strategy audits.',
        highlight: 'Instant single-click PDF generator',
        accentColor: '#0284c7',
    },
];

const INTEGRATIONS = [
    { name: 'Slack', category: 'Chat & Huddles', desc: 'Log decisions straight from executive threads.' },
    { name: 'Linear', category: 'Product Cycles', desc: 'Link roadmap pivots to outcome ratings.' },
    { name: 'Notion', category: 'Knowledge Base', desc: 'Sync PRDs and strategy specs into the vault.' },
    { name: 'GitHub', category: 'Engineering PRs', desc: 'Trace architecture bets to code milestones.' },
    { name: 'Google Calendar', category: 'Meetings', desc: 'Trigger decision prompts post-board meetings.' },
    { name: 'Obsidian', category: 'Second Brain', desc: 'Markdown two-way synchronization.' },
    { name: 'Raycast', category: 'Quick Capture', desc: '3-second shortcut to capture high-stakes bets.' },
    { name: 'Zapier', category: 'Automations', desc: 'Connect to 5,000+ operator workflows.' },
];

const TESTIMONIALS = [
    {
        quote: "Digital Memory Vault revealed that our executive team was 42% more likely to overpromise product timelines when decisions were made in a 'pressured' state. That single insight saved us 4 months of wasted dev cycles.",
        author: 'Elena Rostova',
        role: 'Founder & CEO, Kinetix AI (Series B)',
        stat: '+38% Planning Accuracy',
        avatarBg: '#10b981',
    },
    {
        quote: "As a quant fund partner, I require our portfolio founders to use DMV. It completely eliminates hindsight bias. When someone claims 'we always planned this', the vault holds the exact pre-commitment data.",
        author: 'Marcus Chen',
        role: 'Managing Partner, Apex Capital',
        stat: 'Zero Hindsight Distortion',
        avatarBg: '#8b5cf6',
    },
    {
        quote: "Traditional journals are too unstructured. DMV is an analytical precision tool. The calibration scatter plot and risk matrix are now mandatory review slides in our monthly operating check-in.",
        author: 'Sarah Jenkins',
        role: 'VP of Product, ScaleSphere',
        stat: '2.4× Risk Calibration Gain',
        avatarBg: '#0284c7',
    },
];

const FAQS = [
    {
        q: 'How does Digital Memory Vault differ from normal journaling or Notion?',
        a: 'Traditional tools rely on retrospective writing after events unfold, which is heavily contaminated by hindsight and recency biases. Digital Memory Vault enforces pre-commitment: you log your confidence score, expected outcome, and emotional state BEFORE knowing the result. It then mathematically calculates your calibration gap once the outcome occurs.',
    },
    {
        q: 'What is a Calibration Score and how is it mathematically calculated?',
        a: 'Calibration measures how accurately your confidence reflects true probability. In Digital Memory Vault, every completed decision receives a calibration score using normalized Brier-style gap formulas: 100 − (|Confidence − Outcome Rating| × 10). Perfect alignment yields 100/100.',
    },
    {
        q: 'How does the Emotional Bias Detection Engine work?',
        a: 'When logging a decision, you record your emotional state (calm, stressed, excited, pressured, uncertain). When the outcome is scored, DMV scans your reflections for cognitive keywords (such as rushed, panic, reactive, overconfident) to uncover subconscious blind spots in your strategic process.',
    },
    {
        q: 'How much time does it take each week?',
        a: 'Less than 5 minutes. You only log high-leverage strategic decisions—typically 2 to 5 per week—not trivial daily tasks. Capturing a decision takes 60 seconds; reviewing an outcome takes 90 seconds.',
    },
    {
        q: 'Is my proprietary company and investment data secure?',
        a: 'Yes. All data is scoped strictly to your account, protected by salted bcrypt password hashes, stateless JSON Web Tokens signed with JOSE HS256, and stored in isolated PostgreSQL tables with strict user ownership boundaries.',
    },
    {
        q: 'Can I export my decision logs for co-founders or board members?',
        a: 'Yes. Every decision profile has a one-click executive export that generates a beautifully styled dossier including your initial hypothesis, confidence level, risk tier, actual outcome, calibration gap, and lessons learned.',
    },
];

export default function LandingContent() {
    const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
    const [annualBilling, setAnnualBilling] = useState<boolean>(true);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* STICKY GLASS NAVIGATION BAR */}
            <nav className="glass-nav" style={{
                position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 40px',
            }}>
                <BrandLogo />

                <div style={{ display: 'none', alignItems: 'center', gap: '32px' }} className="nav-desktop-links">
                    <a href="#features" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
                    <a href="#demo" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Live Console</a>
                    <a href="#integrations" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Integrations</a>
                    <a href="#pricing" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Pricing</a>
                    <a href="#faq" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>FAQ</a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/auth/login" className="btn btn-ghost btn-sm" style={{ borderRadius: '999px' }}>
                        Sign In
                    </Link>
                    <Link href="/auth/register" className="btn btn-emerald btn-sm" style={{ borderRadius: '999px', padding: '8px 20px' }}>
                        Launch Vault →
                    </Link>
                    
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="bg-grid-subtle" style={{
                position: 'relative', paddingTop: '90px', paddingBottom: '90px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                paddingLeft: '24px', paddingRight: '24px',
            }}>
                <Hero />

                {/* HERO CENTERPIECE: INTERACTIVE DECISION VAULT CONSOLE (Inspired by Finora phone & Clara card cluster) */}
                <div id="demo" style={{ position: 'relative', marginTop: '64px', width: '100%', maxWidth: '1100px', zIndex: 10 }}>
                    {/* Floating Card 1: Top Left */}
                    <div className="glass-card-floating floating-elem-1" style={{
                        position: 'absolute', top: '-24px', left: '-20px', zIndex: 20,
                        padding: '16px 20px', textAlign: 'left', minWidth: '220px',
                        display: 'none',
                    }} id="floating-card-left">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>Calibration Gain</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>+31.4%</div>
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>↑ Top 5% founder cohort</div>
                    </div>

                    {/* Floating Card 2: Top Right */}
                    <div className="glass-card-floating floating-elem-2" style={{
                        position: 'absolute', top: '10px', right: '-15px', zIndex: 20,
                        padding: '16px 20px', textAlign: 'left', maxWidth: '260px',
                        display: 'none',
                    }} id="floating-card-right">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9333ea' }} />
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9333ea' }}>Bias Detection</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                            High stress detected → <strong>2.4×</strong> higher risk of optimistic timeline projections.
                        </div>
                    </div>

                    {/* Central Device Window */}
                    <div className="glass-panel" style={{
                        borderRadius: '24px', padding: '32px', border: '1px solid var(--border-primary)',
                        boxShadow: '0 30px 60px -12px rgba(15, 23, 42, 0.160), 0 0 40px -10px rgba(16, 185, 129, 0.15)',
                        background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.06) 0%, #ffffff 40%)',
                    }}>
                        {/* Device Top Bar: Scenario Switcher */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-primary)',
                            paddingBottom: '20px', marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ca8a04' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                                    DMV-CONSOLE // LIVE_SIMULATOR
                                </span>
                            </div>

                            {/* Clickable scenario buttons */}
                            <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.025)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                                {SCENARIOS.map((sc) => (
                                    <button
                                        key={sc.id}
                                        onClick={() => setSelectedScenario(sc)}
                                        style={{
                                            padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                            background: selectedScenario.id === sc.id ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                                            color: selectedScenario.id === sc.id ? '#10b981' : 'var(--text-secondary)',
                                        }}
                                    >
                                        {sc.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Scenario Card Content */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', textAlign: 'left' }}>
                            {/* Left Column: Decision & Prediction */}
                            <div style={{ background: 'rgba(15, 23, 42, 0.025)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10b981', fontWeight: 600 }}>
                                        Step 01 · Pre-Commitment
                                    </span>
                                    <span className="badge" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                        {selectedScenario.category}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.35 }}>
                                    {selectedScenario.title}
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.032)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confidence</div>
                                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                                            {selectedScenario.confidence}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/10</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.032)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Emotional State</div>
                                        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize', marginTop: '4px' }}>
                                            {selectedScenario.emotionalState}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '6px' }}>
                                        Hypothesis / Expected Outcome:
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(15, 23, 42, 0.016)', padding: '12px', borderRadius: '8px' }}>
                                        {selectedScenario.expectedOutcome}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Verified Outcome & Calibration */}
                            <div style={{ background: 'rgba(16, 185, 129, 0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#059669', fontWeight: 600 }}>
                                        Step 02 · Outcome & Calibration
                                    </span>
                                    <span style={{
                                        fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                                        background: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontWeight: 600
                                    }}>
                                        Calibration: {selectedScenario.calibrationScore}/100
                                    </span>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '6px' }}>
                                        Reality / Actual Outcome:
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, background: 'rgba(15, 23, 42, 0.024)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                                        {selectedScenario.actualOutcome}
                                    </p>
                                </div>

                                <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.024)', borderRadius: '10px', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                                        Cognitive Pattern & Bias Audit
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                                        {selectedScenario.biasAlert}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '10px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                                        Codified Lesson:
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        &ldquo;{selectedScenario.lesson}&rdquo;
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Console Footer */}
                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                <span>Risk: <strong style={{ color: selectedScenario.risk === 'high' ? '#dc2626' : '#b7791f', textTransform: 'capitalize' }}>{selectedScenario.risk}</strong></span>
                                <span>Outcome Rating: <strong style={{ color: '#10b981' }}>{selectedScenario.successRating}/10</strong></span>
                            </div>
                            <Link href="/auth/register" style={{ fontSize: '12px', color: '#10b981', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                Create Your Private Vault →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* MONOCHROMATIC TRUST & PARTNER LOGO BAR (Finora & Clara style) */}
            <section style={{
                borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)',
                padding: '36px 24px', background: 'rgba(15, 23, 42, 0.060)', textAlign: 'center'
            }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 600 }}>
                    MEASURING HIGH-STAKES DECISIONS ACROSS FOUNDERS, QUANTS & OPERATING EXECUTIVES
                </div>
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    gap: '48px', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto', opacity: 0.65
                }}>
                    {TRUST_LOGOS.map((logo) => (
                        <div key={logo.name} style={{
                            fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em',
                            color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace'
                        }}>
                            {logo.symbol}
                        </div>
                    ))}
                </div>
            </section>

            {/* METRICS & PROVEN IMPACT BAR */}
            <div style={{
                padding: '48px 40px', maxWidth: '1100px', margin: '0 auto',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>12,400+</div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: '6px' }}>Strategic Bets Calibrated</div>
                </div>
                <div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#10b981', letterSpacing: '-0.02em' }}>+31.4%</div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: '6px' }}>Average Calibration Gain</div>
                </div>
                <div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#8b5cf6', letterSpacing: '-0.02em' }}>8 Types</div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: '6px' }}>Cognitive Biases Detected</div>
                </div>
                <div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.02em' }}>2.4×</div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: '6px' }}>Risk Accuracy Multiplier</div>
                </div>
            </div>

            {/* SMART FEATURES BENTO GRID (Finora 2x2/3x2 & Clara style) */}
            <section id="features" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <div className="glass-pill" style={{ marginBottom: '16px' }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>Precision Features</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span>Built for Cognitive Mastery</span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 50px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
                        Transform Unconscious Instinct<br />
                        <span className="gradient-text-emerald">Into Empirical Performance</span>
                    </h2>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '560px', margin: '16px auto 0' }}>
                        Every module is engineered to neutralize the cognitive pitfalls that plague even the smartest operators.
                    </p>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '20px'
                }}>
                    {BENTO_FEATURES.map((feat) => (
                        <div key={feat.title} className="glass-panel" style={{
                            padding: '32px', display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between', minHeight: '260px'
                        }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '12px',
                                        background: 'rgba(15, 23, 42, 0.028)', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '20px', color: feat.accentColor,
                                        border: '1px solid var(--border-primary)'
                                    }}>
                                        {feat.icon}
                                    </div>
                                    <span style={{
                                        fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                                        padding: '4px 10px', borderRadius: '999px', background: 'rgba(15, 23, 42, 0.025)',
                                        border: '1px solid var(--border-primary)', color: 'var(--text-secondary)'
                                    }}>
                                        {feat.badge}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                                    {feat.title}
                                </h3>
                                <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                                    {feat.desc}
                                </p>
                            </div>
                            <div style={{
                                marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-primary)',
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: feat.accentColor,
                                fontFamily: 'JetBrains Mono, monospace'
                            }}>
                                <span>❯</span>
                                <span>{feat.highlight}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* WORKFLOW COMPARISON: INTUITION TRAP VS THE VAULT PROTOCOL (Clara style) */}
            <section style={{
                padding: '80px 24px', maxWidth: '1100px', margin: '0 auto',
                borderTop: '1px solid var(--border-primary)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Methodological Advantage
                    </div>
                    <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Why Memory Alone Fails Founders
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    {/* The Old Way */}
                    <div style={{
                        background: 'rgba(255, 50, 50, 0.03)', border: '1px solid rgba(255, 80, 80, 0.15)',
                        borderRadius: '20px', padding: '32px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <span style={{ color: '#dc2626', fontSize: '18px' }}>✕</span>
                            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ef4444' }}>The Intuition &amp; Retro Trap</h3>
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                            <li style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ color: '#dc2626' }}>•</span>
                                <span><strong>Hindsight revisionism:</strong> Brain rewrites initial expectations once the final outcome is known.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ color: '#dc2626' }}>•</span>
                                <span><strong>Emotional amnesia:</strong> Forgetting how panic or euphoria hijacked strategic bets at execution time.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ color: '#dc2626' }}>•</span>
                                <span><strong>Zero calibration metrics:</strong> Inability to know whether you are chronically over or underconfident.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ color: '#dc2626' }}>•</span>
                                <span><strong>Repeated mistake patterns:</strong> Post-mortems live as forgotten Google Docs without actionable analytics.</span>
                            </li>
                        </ul>
                    </div>

                    {/* The Vault Protocol */}
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '20px', padding: '32px', boxShadow: '0 0 30px -10px rgba(16, 185, 129, 0.15)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span>
                            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#059669' }}>The Digital Memory Vault Protocol</h3>
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                            <li style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ color: '#10b981' }}>✓</span>
                                <span><strong>Pre-registered commitments:</strong> Confidence and criteria are locked at T=0 before reality unfolds.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ color: '#10b981' }}>✓</span>
                                <span><strong>State &amp; bias tracking:</strong> Algorithmic correlation between stress, excitement, and bet performance.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ color: '#10b981' }}>✓</span>
                                <span><strong>Empirical calibration score:</strong> Clear numerical score showing where your judgment is sharpest.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ color: '#10b981' }}>✓</span>
                                <span><strong>Codified rulebook:</strong> Extracted principles compound over months into your firm&apos;s decision advantage.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* GSAP STACKED SCROLL (Interactive card stack) */}
            <StackedScroll />

            {/* ECOSYSTEM & INTEGRATIONS (Finora style) */}
            <section id="integrations" style={{
                padding: '80px 24px', maxWidth: '1100px', margin: '0 auto',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '48px' }}>
                    <div className="glass-pill" style={{ marginBottom: '16px' }}>
                        <span style={{ color: '#0284c7', fontWeight: 600 }}>Workflow Synergy</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span>Zero Context Switching</span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Integrates with Where You Make Bets
                    </h2>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '14px auto 0' }}>
                        Capture decisions in seconds from your communications, issue trackers, and executive calendars.
                    </p>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '16px', textAlign: 'left'
                }}>
                    {INTEGRATIONS.map((tool) => (
                        <div key={tool.name} className="glass-panel" style={{
                            padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '6px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{tool.name}</span>
                                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{tool.category}</span>
                            </div>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {tool.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SOCIAL PROOF & TESTIMONIALS (Finora & Clara style) */}
            <section style={{
                padding: '80px 24px', maxWidth: '1150px', margin: '0 auto',
                borderTop: '1px solid var(--border-primary)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <div className="glass-pill" style={{ marginBottom: '16px' }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>Verified Operators</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span>Measurable Impact</span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Trusted by High-Velocity Leaders
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    {TESTIMONIALS.map((t) => (
                        <div key={t.author} className="glass-panel" style={{
                            padding: '32px', display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between', position: 'relative'
                        }}>
                            <div>
                                <div style={{ fontSize: '28px', color: '#10b981', lineHeight: 1, marginBottom: '16px' }}>&ldquo;</div>
                                <p style={{ fontSize: '14.5px', lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: '24px' }}>
                                    {t.quote}
                                </p>
                            </div>
                            <div>
                                <div style={{
                                    display: 'inline-block', fontSize: '11px', fontWeight: 600, color: '#10b981',
                                    background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px',
                                    marginBottom: '16px'
                                }}>
                                    {t.stat}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: '50%', background: t.avatarBg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, color: '#fff', fontSize: '14px'
                                    }}>
                                        {t.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.author}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* TRANSPARENT PRICING TIERS (Finora & Clara style with toggle) */}
            <section id="pricing" style={{
                padding: '90px 24px', maxWidth: '1150px', margin: '0 auto',
                borderTop: '1px solid var(--border-primary)', textAlign: 'center'
            }}>
                <div style={{ marginBottom: '40px' }}>
                    <div className="glass-pill" style={{ marginBottom: '16px' }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>Transparent Economics</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span>Zero Lock-In</span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Invest in Your Decision Infrastructure
                    </h2>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '14px auto 28px' }}>
                        Start free. Upgrade when your decision velocity demands deep cognitive pattern analytics.
                    </p>

                    {/* Monthly / Annual Toggle */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(15, 23, 42, 0.028)', padding: '5px',
                        borderRadius: '999px', border: '1px solid var(--border-primary)'
                    }}>
                        <button
                            onClick={() => setAnnualBilling(false)}
                            style={{
                                padding: '8px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: 500,
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                background: !annualBilling ? 'rgba(15, 23, 42, 0.060)' : 'transparent',
                                color: !annualBilling ? '#ffffff' : 'var(--text-secondary)'
                            }}
                        >
                            Monthly Billing
                        </button>
                        <button
                            onClick={() => setAnnualBilling(true)}
                            style={{
                                padding: '8px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: 500,
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
                                background: annualBilling ? '#10b981' : 'transparent',
                                color: annualBilling ? '#ffffff' : 'var(--text-secondary)'
                            }}
                        >
                            <span>Annual</span>
                            <span style={{
                                fontSize: '10px', background: 'rgba(15, 23, 42, 0.020)', padding: '2px 6px',
                                borderRadius: '999px', color: '#ffffff', fontWeight: 700
                            }}>
                                SAVE 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* 3 Pricing Cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px', textAlign: 'left', alignItems: 'stretch'
                }}>
                    {/* Tier 1: Starter */}
                    <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Starter</div>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>Essential calibration for individual founders and solo builders.</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '28px' }}>
                                <span style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary)' }}>$0</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ month forever</span>
                            </div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Up to 30 active decisions</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Core confidence calibration score</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> 5 standard decision categories</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Outcome tracking &amp; post-mortems</li>
                                <li style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}><span>✕</span> Emotional keyword scanner</li>
                                <li style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}><span>✕</span> Executive PDF export dossiers</li>
                            </ul>
                        </div>
                        <Link href="/auth/register" className="btn btn-glass" style={{ width: '100%', borderRadius: '10px', textAlign: 'center' }}>
                            Start Free
                        </Link>
                    </div>

                    {/* Tier 2: Pro Operator (Featured) */}
                    <div className="glass-panel pricing-card-featured" style={{
                        padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.060) 0%, rgba(15, 23, 42, 0.060) 100%)',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', fontSize: '10.5px', fontWeight: 700,
                            letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 14px', borderRadius: '999px'
                        }}>
                            Most Popular
                        </div>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#059669', marginBottom: '6px' }}>Pro Operator</div>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>Full behavioral intelligence suite for active founders and quants.</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '28px' }}>
                                <span style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {annualBilling ? '$19' : '$24'}
                                </span>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ month {annualBilling && '(billed annually)'}</span>
                            </div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '32px' }}>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> <strong>Unlimited</strong> decisions &amp; outcomes</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Full emotional bias detection engine</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Scatter plot &amp; monthly trend charts</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Asymmetric risk profiler (Low/Med/High)</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Executive PDF export dossiers</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Priority encrypted cloud backups</li>
                            </ul>
                        </div>
                        <Link href="/auth/register" className="btn btn-emerald" style={{ width: '100%', borderRadius: '10px', textAlign: 'center' }}>
                            Launch Pro Vault →
                        </Link>
                    </div>

                    {/* Tier 3: Enterprise / Funds */}
                    <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Funds &amp; Teams</div>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>Multi-user calibration for investment committees &amp; executive suites.</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '28px' }}>
                                <span style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {annualBilling ? '$64' : '$79'}
                                </span>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ month</span>
                            </div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Everything in Pro Operator</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Multi-member team calibration audits</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Anonymous investment committee voting</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Custom decision taxonomy &amp; tags</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> API access &amp; automated exports</li>
                                <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>✓</span> Dedicated behavioral calibration review</li>
                            </ul>
                        </div>
                        <Link href="/auth/register" className="btn btn-glass" style={{ width: '100%', borderRadius: '10px', textAlign: 'center' }}>
                            Deploy Team Vault
                        </Link>
                    </div>
                </div>
            </section>

            {/* INTERACTIVE FAQ ACCORDION (Finora & Clara style) */}
            <section id="faq" style={{
                padding: '80px 24px', maxWidth: '880px', margin: '0 auto',
                borderTop: '1px solid var(--border-primary)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div className="glass-pill" style={{ marginBottom: '16px' }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>Clarity &amp; Questions</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span>Frequently Asked</span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Everything You Need to Know
                    </h2>
                </div>

                <div className="glass-panel" style={{ padding: '8px 24px', overflow: 'hidden' }}>
                    {FAQS.map((faq, index) => {
                        const isOpen = openFaq === index;
                        return (
                            <div key={faq.q} className="faq-accordion-item">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    style={{
                                        width: '100%', padding: '20px 0', display: 'flex',
                                        alignItems: 'center', justifyContent: 'space-between',
                                        background: 'none', border: 'none', textAlign: 'left',
                                        cursor: 'pointer', color: isOpen ? '#10b981' : 'var(--text-primary)',
                                        fontSize: '15.5px', fontWeight: 600, transition: 'color 0.2s',
                                        gap: '16px'
                                    }}
                                >
                                    <span>{faq.q}</span>
                                    <span style={{
                                        fontSize: '20px', fontWeight: 300, color: isOpen ? '#10b981' : 'var(--text-muted)',
                                        transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'none'
                                    }}>
                                        +
                                    </span>
                                </button>
                                {isOpen && (
                                    <div style={{
                                        paddingBottom: '20px', color: 'var(--text-secondary)', fontSize: '14px',
                                        lineHeight: 1.65, animation: 'fadeIn 0.25s ease'
                                    }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* RADIANT CTA BANNER (Finora & Clara style) */}
            <section style={{ padding: '80px 24px 100px', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{
                    position: 'relative', borderRadius: '28px', padding: '64px 32px',
                    textAlign: 'center', overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                    border: '1px solid var(--border-primary)',
                    boxShadow: '0 20px 60px -15px rgba(16, 185, 129, 0.25)'
                }}>
                    {/* Ambient light pulse */}
                    <div style={{
                        position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
                        width: '500px', height: '300px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
                        filter: 'blur(50px)', pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
                        <div className="glass-pill" style={{ marginBottom: '20px' }}>
                            <span className="pulsing-dot" />
                            <span>Stop Leaving Your Strategy to Chance</span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px' }}>
                            Ready to Master Your<br /><span className="gradient-text-emerald">Decision DNA?</span>
                        </h2>
                        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '36px' }}>
                            Join forward-thinking founders and quants who measure every outcome and compound their strategic accuracy over time.
                        </p>
                        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/auth/register" className="btn btn-emerald" style={{ padding: '15px 40px', fontSize: '15px', borderRadius: '999px' }}>
                                Create Your Vault Free →
                            </Link>
                            <Link href="/auth/login" className="btn btn-glass" style={{ padding: '15px 32px', fontSize: '15px', borderRadius: '999px' }}>
                                Operator Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </main>
    );
}
