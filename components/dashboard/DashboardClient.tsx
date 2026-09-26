'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const AnalyticsCharts = dynamic(() => import('@/components/charts/AnalyticsCharts'), { ssr: false, loading: () => <div style={{ padding: 40, textAlign: 'center', color: '#444' }}>Loading charts…</div> });

type Decision = {
    id: string; userId: string; title: string; category: string;
    description: string; expectedOutcome: string; confidenceLevel: number;
    emotionalState: string; riskLevel: string; decisionDate: Date | string;
    status: string; createdAt: Date | string;
};
type Outcome = {
    id: string; decisionId: string; actualOutcome: string; successRating: number;
    lessonLearned: string; reflection: string; outcomeDate: Date | string;
};
type User = { id: string; email: string; fullName: string };

interface Props {
    user: User;
    initialDecisions: Decision[];
    initialOutcomes: Outcome[];
}

const CATEGORIES = ['career', 'finance', 'health', 'product', 'personal'] as const;
const EMOSTATES = ['calm', 'stressed', 'excited', 'pressured', 'uncertain'] as const;
const RISKLEVELS = ['low', 'medium', 'high'] as const;

function getRiskColor(risk: string) {
    return risk === 'high' ? '#ff5b5b' : risk === 'medium' ? '#e8b84b' : '#4ecb71';
}

function getStatusBadge(status: string) {
    return status === 'outcome_recorded'
        ? <span className="badge badge-green">Outcome Recorded</span>
        : <span className="badge badge-yellow">Pending Outcome</span>;
}

function ScoreCard({ label, value, max = 100, color = '#4a9eff' }: { label: string; value: number; max?: number; color?: string }) {
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555' }}>{label}</div>
            <div style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.03em', color: '#f0f0f0' }}>{value}<span style={{ fontSize: '18px', color: '#333' }}>/{max}</span></div>
            <div className="score-bar">
                <div className="score-fill" style={{ width: `${(value / max) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
            </div>
        </div>
    );
}

export default function DashboardClient({ user, initialDecisions, initialOutcomes }: Props) {
    const router = useRouter();
    const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
    const [outcomesMap, setOutcomesMap] = useState<Record<string, Outcome>>({});
    const [activeTab, setActiveTab] = useState<'overview' | 'decisions' | 'analytics'>('overview');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [analytics, setAnalytics] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // Modals
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
    const [showOutcomeModal, setShowOutcomeModal] = useState<Decision | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Forms
    const [decisionForm, setDecisionForm] = useState({
        title: '', category: 'product', description: '', expectedOutcome: '',
        confidenceLevel: 7, emotionalState: 'calm', riskLevel: 'medium',
        decisionDate: new Date().toISOString().split('T')[0],
    });
    const [outcomeForm, setOutcomeForm] = useState({
        actualOutcome: '', successRating: 7, lessonLearned: '', reflection: '', outcomeDate: new Date().toISOString().split('T')[0],
    });
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Build outcomes map
    useEffect(() => {
        const map: Record<string, Outcome> = {};
        initialOutcomes.forEach((o) => { map[o.decisionId] = o; });
        setOutcomesMap(map);
    }, [initialOutcomes]);

    const fetchAnalytics = useCallback(async () => {
        setAnalyticsLoading(true);
        try {
            const res = await fetch('/api/analytics');
            if (res.ok) setAnalytics(await res.json());
        } finally {
            setAnalyticsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'analytics' && !analytics) fetchAnalytics();
    }, [activeTab, analytics, fetchAnalytics]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    const resetDecisionForm = () => {
        setDecisionForm({ title: '', category: 'product', description: '', expectedOutcome: '', confidenceLevel: 7, emotionalState: 'calm', riskLevel: 'medium', decisionDate: new Date().toISOString().split('T')[0] });
        setEditingDecision(null);
        setFormError('');
    };

    const openEditModal = (d: Decision) => {
        setEditingDecision(d);
        setDecisionForm({
            title: d.title, category: d.category, description: d.description,
            expectedOutcome: d.expectedOutcome, confidenceLevel: d.confidenceLevel,
            emotionalState: d.emotionalState, riskLevel: d.riskLevel,
            decisionDate: new Date(d.decisionDate).toISOString().split('T')[0],
        });
        setShowDecisionModal(true);
    };

    const handleDecisionSubmit = async () => {
        setFormLoading(true);
        setFormError('');
        try {
            const url = editingDecision ? `/api/decisions/${editingDecision.id}` : '/api/decisions';
            const method = editingDecision ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(decisionForm) });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error); return; }

            if (editingDecision) {
                setDecisions((prev) => prev.map((d) => d.id === editingDecision.id ? data.decision : d));
            } else {
                setDecisions((prev) => [data.decision, ...prev]);
            }
            setShowDecisionModal(false);
            resetDecisionForm();
        } catch { setFormError('Network error'); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/decisions/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setDecisions((prev) => prev.filter((d) => d.id !== id));
            setOutcomesMap((prev) => { const n = { ...prev }; delete n[id]; return n; });
            setShowDeleteConfirm(null);
        }
    };

    const handleOutcomeSubmit = async () => {
        if (!showOutcomeModal) return;
        setFormLoading(true);
        setFormError('');
        try {
            const res = await fetch(`/api/decisions/${showOutcomeModal.id}/outcome`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(outcomeForm),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error); return; }
            setOutcomesMap((prev) => ({ ...prev, [showOutcomeModal.id]: data.outcome }));
            setDecisions((prev) => prev.map((d) => d.id === showOutcomeModal.id ? { ...d, status: 'outcome_recorded' } : d));
            setShowOutcomeModal(null);
            setAnalytics(null); // invalidate cache
        } catch { setFormError('Network error'); }
        finally { setFormLoading(false); }
    };

    const filteredDecisions = categoryFilter
        ? decisions.filter((d) => d.category === categoryFilter)
        : decisions;

    const pending = decisions.filter((d) => d.status === 'pending_outcome').length;
    const completed = decisions.filter((d) => d.status === 'outcome_recorded').length;

    const TAB_STYLE = (active: boolean) => ({
        padding: '8px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
        color: active ? '#4a9eff' : '#555', background: 'none', border: 'none',
        borderBottom: active ? '2px solid #4a9eff' : '2px solid transparent',
        transition: 'all 0.2s', marginBottom: '-1px',
    } as any);

    return (
        <div style={{ minHeight: '100vh', background: '#000' }}>
            {/* Top Nav */}
            <nav style={{ borderBottom: '1px solid #111', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(8px)', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4a9eff' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: '#888' }}>DMV</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {(['overview', 'decisions', 'analytics'] as const).map((tab) => (
                        <button key={tab} style={TAB_STYLE(activeTab === tab)} onClick={() => setActiveTab(tab)}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#444' }}>{user.fullName}</span>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-up">
                        <div style={{ marginBottom: '36px' }}>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#444', marginBottom: '6px' }}>Overview</div>
                            <h1 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em' }}>Behavioral Dashboard</h1>
                        </div>

                        {/* Metrics row */}
                        <div className="grid-4" style={{ marginBottom: '32px' }}>
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555' }}>Total Decisions</div>
                                <div style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.03em' }}>{decisions.length}</div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#555' }}>
                                    <span style={{ color: '#e8b84b' }}>{pending} pending</span>
                                    <span>·</span>
                                    <span style={{ color: '#4ecb71' }}>{completed} complete</span>
                                </div>
                            </div>
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555' }}>Pending Outcomes</div>
                                <div style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.03em', color: '#e8b84b' }}>{pending}</div>
                                <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={() => setActiveTab('decisions')}>View decisions →</button>
                            </div>
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555' }}>Outcomes Recorded</div>
                                <div style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.03em', color: '#4ecb71' }}>{completed}</div>
                                <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={() => { setActiveTab('analytics'); fetchAnalytics(); }}>View analytics →</button>
                            </div>
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer', borderStyle: 'dashed' }}
                                onClick={() => { resetDecisionForm(); setShowDecisionModal(true); }}>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555' }}>New Decision</div>
                                <div style={{ fontSize: '48px', fontWeight: 300, color: '#4a9eff' }}>+</div>
                                <div style={{ fontSize: '12px', color: '#444' }}>Log a new decision</div>
                            </div>
                        </div>

                        {/* Recent decisions */}
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Decisions</div>
                                <button className="btn btn-primary btn-sm" onClick={() => { resetDecisionForm(); setShowDecisionModal(true); }}>+ Add Decision</button>
                            </div>
                            {decisions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#333' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>◈</div>
                                    <div style={{ fontSize: '14px', marginBottom: '8px', color: '#555' }}>No decisions logged yet</div>
                                    <div style={{ fontSize: '12px', color: '#333' }}>Start tracking your decision-making patterns</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                    {decisions.slice(0, 5).map((d) => (
                                        <DecisionRow key={d.id} decision={d} outcome={outcomesMap[d.id]}
                                            onEdit={() => openEditModal(d)}
                                            onOutcome={() => { setShowOutcomeModal(d); setOutcomeForm({ actualOutcome: '', successRating: 7, lessonLearned: '', reflection: '', outcomeDate: new Date().toISOString().split('T')[0] }); }}
                                            onDelete={() => setShowDeleteConfirm(d.id)}
                                            onExport={() => window.open(`/api/export/${d.id}`, '_blank')}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* DECISIONS TAB */}
                {activeTab === 'decisions' && (
                    <div className="animate-fade-up">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#444', marginBottom: '6px' }}>Decision Log</div>
                                <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em' }}>All Decisions</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <select className="input" style={{ width: 160 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                    <option value="">All Categories</option>
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                </select>
                                <button className="btn btn-primary" onClick={() => { resetDecisionForm(); setShowDecisionModal(true); }}>+ Add Decision</button>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {filteredDecisions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#333' }}>
                                    <div style={{ fontSize: '14px', color: '#555' }}>No decisions found{categoryFilter ? ` in "${categoryFilter}"` : ''}</div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 80px 160px', padding: '12px 24px', borderBottom: '1px solid #111', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#444' }}>
                                        <span>Decision</span><span>Category</span><span>Risk</span><span>Confidence</span><span>Status</span><span style={{ textAlign: 'right' }}>Actions</span>
                                    </div>
                                    {filteredDecisions.map((d) => (
                                        <DecisionRow key={d.id} decision={d} outcome={outcomesMap[d.id]}
                                            onEdit={() => openEditModal(d)}
                                            onOutcome={() => { setShowOutcomeModal(d); setOutcomeForm({ actualOutcome: '', successRating: 7, lessonLearned: '', reflection: '', outcomeDate: new Date().toISOString().split('T')[0] }); }}
                                            onDelete={() => setShowDeleteConfirm(d.id)}
                                            onExport={() => window.open(`/api/export/${d.id}`, '_blank')}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && (
                    <div className="animate-fade-up">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#444', marginBottom: '6px' }}>Analytics</div>
                                <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em' }}>Behavioral Intelligence</h2>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={fetchAnalytics} disabled={analyticsLoading}>
                                {analyticsLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : '↺ Refresh'}
                            </button>
                        </div>

                        {analyticsLoading && !analytics && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#444' }}>
                                <div className="spinner" /><span style={{ marginLeft: 12 }}>Computing analytics…</span>
                            </div>
                        )}

                        {analytics && (
                            <>
                                <div className="grid-4" style={{ marginBottom: '24px' }}>
                                    <ScoreCard label="Decision Accuracy" value={analytics.decisionAccuracyScore} color="#4a9eff" />
                                    <ScoreCard label="Risk Calibration" value={analytics.riskCalibrationScore} color="#9b7fea" />
                                    <ScoreCard label="Emotional Bias" value={analytics.emotionalBiasScore} color="#ff5b5b" />
                                    <ScoreCard label="Confidence Score" value={analytics.confidenceCalibrationScore} color="#4ecb71" />
                                </div>

                                <div className="grid-2" style={{ marginBottom: '24px' }}>
                                    <div className="card">
                                        <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>Calibration Insights</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {[
                                                { label: 'Overconfidence Rate', value: `${analytics.overconfidenceRate}%`, warn: analytics.overconfidenceRate > 50 },
                                                { label: 'Underconfidence Rate', value: `${analytics.underconfidenceRate}%` },
                                                { label: 'High-Risk Success', value: `${analytics.highRiskSuccessRate}%` },
                                                { label: 'Low-Risk Success', value: `${analytics.lowRiskSuccessRate}%` },
                                            ].map((item) => (
                                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#080808', borderRadius: 8, border: '1px solid #111' }}>
                                                    <span style={{ fontSize: '13px', color: '#666' }}>{item.label}</span>
                                                    <span style={{ fontSize: '16px', fontWeight: 600, color: item.warn ? '#ff5b5b' : '#f0f0f0' }}>{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>Risk Distribution</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {[
                                                { label: 'Low Risk', key: 'low', color: '#4ecb71' },
                                                { label: 'Medium Risk', key: 'medium', color: '#e8b84b' },
                                                { label: 'High Risk', key: 'high', color: '#ff5b5b' },
                                            ].map((item) => {
                                                const total = Object.values(analytics.riskDistribution as Record<string, number>).reduce((a: number, b: number) => a + b, 0) || 1;
                                                const pct = Math.round(((analytics.riskDistribution[item.key] || 0) / total) * 100);
                                                return (
                                                    <div key={item.key}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                            <span style={{ fontSize: '12px', color: '#666' }}>{item.label}</span>
                                                            <span style={{ fontSize: '12px', color: item.color, fontWeight: 600 }}>{analytics.riskDistribution[item.key] || 0} ({pct}%)</span>
                                                        </div>
                                                        <div className="score-bar">
                                                            <div className="score-fill" style={{ width: `${pct}%`, background: item.color }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <AnalyticsCharts analytics={analytics} />
                            </>
                        )}

                        {!analytics && !analyticsLoading && (
                            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#333' }}>
                                <div style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>No analytics data yet</div>
                                <div style={{ fontSize: '12px', color: '#333' }}>Add decisions and record outcomes to generate insights</div>
                                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={fetchAnalytics}>Compute Analytics</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* DECISION MODAL */}
            {showDecisionModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowDecisionModal(false); resetDecisionForm(); } }}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{editingDecision ? 'Edit Decision' : 'Log New Decision'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => { setShowDecisionModal(false); resetDecisionForm(); }} style={{ fontSize: '18px' }}>×</button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="label">Decision Title</label>
                                <input className="input" placeholder="e.g. Hire VP of Engineering" value={decisionForm.title} onChange={(e) => setDecisionForm({ ...decisionForm, title: e.target.value })} />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="label">Category</label>
                                    <select className="input" value={decisionForm.category} onChange={(e) => setDecisionForm({ ...decisionForm, category: e.target.value })}>
                                        {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Decision Date</label>
                                    <input type="date" className="input" value={decisionForm.decisionDate} onChange={(e) => setDecisionForm({ ...decisionForm, decisionDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Description</label>
                                <textarea className="input" rows={3} placeholder="What is this decision about?" value={decisionForm.description} onChange={(e) => setDecisionForm({ ...decisionForm, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Expected Outcome</label>
                                <textarea className="input" rows={3} placeholder="What do you expect to happen?" value={decisionForm.expectedOutcome} onChange={(e) => setDecisionForm({ ...decisionForm, expectedOutcome: e.target.value })} />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="label">Emotional State</label>
                                    <select className="input" value={decisionForm.emotionalState} onChange={(e) => setDecisionForm({ ...decisionForm, emotionalState: e.target.value })}>
                                        {EMOSTATES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Risk Level</label>
                                    <select className="input" value={decisionForm.riskLevel} onChange={(e) => setDecisionForm({ ...decisionForm, riskLevel: e.target.value })}>
                                        {RISKLEVELS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Confidence Level: <strong style={{ color: '#4a9eff' }}>{decisionForm.confidenceLevel}/10</strong></label>
                                <input type="range" min={1} max={10} value={decisionForm.confidenceLevel} onChange={(e) => setDecisionForm({ ...decisionForm, confidenceLevel: Number(e.target.value) })} style={{ width: '100%', accentColor: '#4a9eff' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#444', marginTop: '4px' }}>
                                    <span>1 — Total uncertainty</span><span>10 — Absolute certainty</span>
                                </div>
                            </div>
                            {formError && <div style={{ padding: '10px 14px', background: 'rgba(255,91,91,0.06)', border: '1px solid rgba(255,91,91,0.2)', borderRadius: '8px', fontSize: '13px', color: '#ff5b5b' }}>{formError}</div>}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => { setShowDecisionModal(false); resetDecisionForm(); }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleDecisionSubmit} disabled={formLoading}>
                                {formLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : editingDecision ? 'Save Changes' : 'Log Decision'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OUTCOME MODAL */}
            {showOutcomeModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowOutcomeModal(null); }}>
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Record Outcome</h3>
                                <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{showOutcomeModal.title}</div>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowOutcomeModal(null)} style={{ fontSize: '18px' }}>×</button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="label">Actual Outcome</label>
                                <textarea className="input" rows={3} placeholder="What actually happened?" value={outcomeForm.actualOutcome} onChange={(e) => setOutcomeForm({ ...outcomeForm, actualOutcome: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Success Rating: <strong style={{ color: '#4a9eff' }}>{outcomeForm.successRating}/10</strong></label>
                                <input type="range" min={1} max={10} value={outcomeForm.successRating} onChange={(e) => setOutcomeForm({ ...outcomeForm, successRating: Number(e.target.value) })} style={{ width: '100%', accentColor: '#4a9eff' }} />
                            </div>
                            <div className="form-group">
                                <label className="label">Lesson Learned</label>
                                <textarea className="input" rows={2} placeholder="What did you learn?" value={outcomeForm.lessonLearned} onChange={(e) => setOutcomeForm({ ...outcomeForm, lessonLearned: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Reflection</label>
                                <textarea className="input" rows={3} placeholder="Reflect on your thought process…" value={outcomeForm.reflection} onChange={(e) => setOutcomeForm({ ...outcomeForm, reflection: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Outcome Date</label>
                                <input type="date" className="input" value={outcomeForm.outcomeDate} onChange={(e) => setOutcomeForm({ ...outcomeForm, outcomeDate: e.target.value })} />
                            </div>
                            {formError && <div style={{ padding: '10px 14px', background: 'rgba(255,91,91,0.06)', border: '1px solid rgba(255,91,91,0.2)', borderRadius: '8px', fontSize: '13px', color: '#ff5b5b' }}>{formError}</div>}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowOutcomeModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleOutcomeSubmit} disabled={formLoading}>
                                {formLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : 'Record Outcome'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(null); }}>
                    <div className="modal" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Delete Decision</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowDeleteConfirm(null)} style={{ fontSize: '18px' }}>×</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>
                                This will permanently delete this decision and its outcome. This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DecisionRow({ decision, outcome, onEdit, onOutcome, onDelete, onExport }: {
    decision: Decision; outcome?: Outcome;
    onEdit: () => void; onOutcome: () => void; onDelete: () => void; onExport: () => void;
}) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 80px 160px', padding: '14px 24px', borderBottom: '1px solid #0e0e0e', alignItems: 'center', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#080808'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#e0e0e0', marginBottom: '2px' }}>{decision.title}</div>
                <div style={{ fontSize: '11px', color: '#444' }}>{new Date(decision.decisionDate).toISOString().split('T')[0]}</div>
            </div>
            <span className="badge">{decision.category}</span>
            <span className="badge" style={{ color: getRiskColor(decision.riskLevel), borderColor: getRiskColor(decision.riskLevel) + '33' }}>{decision.riskLevel}</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f0', fontFamily: 'JetBrains Mono, monospace' }}>{decision.confidenceLevel}<span style={{ fontSize: '11px', color: '#444' }}>/10</span></span>
            {getStatusBadge(decision.status)}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                {decision.status === 'pending_outcome' && (
                    <button className="btn btn-ghost btn-sm" onClick={onOutcome} title="Record Outcome" style={{ fontSize: '11px' }}>+ Outcome</button>
                )}
                <button className="btn btn-ghost btn-icon" onClick={onEdit} title="Edit" style={{ fontSize: '14px' }}>✎</button>
                <button className="btn btn-ghost btn-icon" onClick={onExport} title="Export" style={{ fontSize: '12px' }}>↗</button>
                <button className="btn btn-ghost btn-icon btn-danger" onClick={onDelete} title="Delete" style={{ fontSize: '14px' }}>×</button>
            </div>
        </div>
    );
}
