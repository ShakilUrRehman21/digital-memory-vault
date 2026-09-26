'use client';

import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts';

interface Props {
    analytics: {
        confidenceVsOutcome: Array<{ confidence: number; outcome: number; title: string; date: string }>;
        monthlyTrend: Array<{ month: string; count: number; avgScore: number }>;
        emotionalDistribution: Record<string, number>;
        riskDistribution: Record<string, number>;
        decisionsByCategory: Record<string, number>;
    };
}

const COLORS = ['#4a9eff', '#9b7fea', '#4ecb71', '#e8b84b', '#ff5b5b'];

const TOOLTIP_STYLE = {
    background: '#0e0e0e',
    border: '1px solid #1c1c1c',
    borderRadius: 8,
    color: '#e0e0e0',
    fontSize: 12,
};

export default function AnalyticsCharts({ analytics }: Props) {
    const emotionalData = Object.entries(analytics.emotionalDistribution).map(([name, value]) => ({ name, value }));
    const categoryData = Object.entries(analytics.decisionsByCategory).map(([name, value]) => ({ name, value }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Confidence vs Outcome Scatter */}
            <div className="card">
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '4px' }}>Confidence vs Outcome Scatter</div>
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '20px' }}>Each point is one completed decision. Ideal alignment = diagonal line.</div>
                {analytics.confidenceVsOutcome.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#333', fontSize: '13px' }}>No completed decisions yet</div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                            <XAxis dataKey="confidence" type="number" domain={[0, 10]} name="Confidence" label={{ value: 'Confidence Level', position: 'insideBottom', offset: -5, fill: '#444', fontSize: 11 }} tick={{ fill: '#444', fontSize: 11 }} />
                            <YAxis dataKey="outcome" type="number" domain={[0, 10]} name="Outcome" label={{ value: 'Outcome', angle: -90, position: 'insideLeft', fill: '#444', fontSize: 11 }} tick={{ fill: '#444', fontSize: 11 }} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#2a2a2a' }} content={({ active, payload }) => {
                                if (active && payload?.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div style={{ ...TOOLTIP_STYLE, padding: '10px 14px' }}>
                                            <div style={{ fontWeight: 600, marginBottom: 4, maxWidth: 200 }}>{d.title}</div>
                                            <div style={{ color: '#4a9eff' }}>Confidence: {d.confidence}/10</div>
                                            <div style={{ color: '#4ecb71' }}>Outcome: {d.outcome}/10</div>
                                        </div>
                                    );
                                }
                                return null;
                            }} />
                            <Scatter name="Decisions" data={analytics.confidenceVsOutcome} fill="#4a9eff" fillOpacity={0.8} />
                        </ScatterChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid-2">
                {/* Monthly Trend */}
                <div className="card">
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '20px' }}>Monthly Outcome Trend</div>
                    {analytics.monthlyTrend.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#333', fontSize: '13px' }}>No trend data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={analytics.monthlyTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                                <XAxis dataKey="month" tick={{ fill: '#444', fontSize: 11 }} />
                                <YAxis domain={[0, 10]} tick={{ fill: '#444', fontSize: 11 }} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Line type="monotone" dataKey="avgScore" stroke="#4a9eff" strokeWidth={2} dot={{ fill: '#4a9eff', r: 4 }} name="Avg Score" />
                                <Line type="monotone" dataKey="count" stroke="#9b7fea" strokeWidth={1} strokeDasharray="4 4" dot={false} name="# Decisions" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Emotional Distribution */}
                <div className="card">
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '20px' }}>Emotional Pattern Distribution</div>
                    {emotionalData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#333', fontSize: '13px' }}>No data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={emotionalData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                                    {emotionalData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: '#666', fontSize: 11 }}>{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Category Bar */}
            <div className="card">
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '20px' }}>Decisions by Category</div>
                {categoryData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#333', fontSize: '13px' }}>No data yet</div>
                ) : (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={categoryData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                            <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#444', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Bar dataKey="value" name="Decisions" radius={[4, 4, 0, 0]}>
                                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
